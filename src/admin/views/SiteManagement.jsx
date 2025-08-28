import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import SiteDetailModal from '../components/modals/SiteDetailModal';
import ApiService from '../services/api';

const SiteManagement = () => {
  const { sites, chargers, setSites, loading, error, loadAllData } = useAdminData();

  // debug: 確認 chargers 內容（印出第一筆完整物件以了解欄位）
  if (Array.isArray(chargers) && chargers.length > 0) {
    console.log('SiteManagement chargers[0]:', JSON.stringify(chargers[0], null, 2));
  } else {
    console.log('SiteManagement chargers sample (empty or not array):', chargers);
  }

  // 安全地把 chargers 轉成陣列
  const chargersArr = Array.isArray(chargers) ? chargers : [];

  // 對應你的狀態定義：
  // -1、0 => 故障 / 進廠維修 → 視為 maintenance（維護中）
  // 1 => 出租中 → 視為 occupied（使用中/已外借）
  // 2、3 => 待租借  (代租借,滿電)、（30%~99%）→ 視為 available（可用）
  // 4 =>準備中（<30%）→ 視為 preparing（準備中，可列為 other 或 unavailable）
  const normalizeStatus = (c) => {
    const raw = c?.status ?? c?.charger_status ?? null;
    if (raw === null || raw === undefined) return 'unknown';
    const s = Number(raw);
    if (s === -1 || s === 0) return 'maintenance';
    if (s === 1) return 'occupied';
    if (s === 2 || s === 3) return 'available';
    if (s === 4) return 'preparing';
    return 'other';
  };

  // single-pass 計數
  const counts = chargersArr.reduce(
    (acc, c) => {
      const ns = normalizeStatus(c);
      if (ns === 'available') acc.available++;
      else if (ns === 'occupied') acc.occupied++;
      else if (ns === 'maintenance') acc.maintenance++;
      else if (ns === 'preparing') acc.preparing++;
      else acc.other++;
      return acc;
    },
    { available: 0, occupied: 0, maintenance: 0, preparing: 0, other: 0 }
  );

  // 可在 UI 使用 counts.available / counts.occupied / counts.maintenance

  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [isEditingSite, setIsEditingSite] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [creatingSite, setCreatingSite] = useState(false);
  const [saving, setSaving] = useState(false);

  // 共用驗證與格式化
  const toFixed8 = (n) => {
    if (n === "" || n === undefined || n === null || isNaN(n)) return "";
    return Number.parseFloat(n).toFixed(8);
  };
  const isValidLng = (v) => v !== "" && !isNaN(v) && v >= -180 && v <= 180;
  const isValidLat = (v) => v !== "" && !isNaN(v) && v >= -90 && v <= 90;

  // handleViewSite 定義
  const handleViewSite = async (site) => {
    // 先把 site 設到 state，確保 modal 可拿到站點基本資料
    setSelectedSite(site);
    setEditSite(site);
    setIsEditingSite(false);
    setCreatingSite(false);

    // 計算該站點的充電器與狀態統計（避免型別差異用 String 比較）
    const siteChargers = chargersArr.filter((c) => String(c.site_id) === String(site.site_id));
    const totalChargers = siteChargers.length;
    const available = siteChargers.filter((c) => normalizeStatus(c) === "available").length;
    const occupied = siteChargers.filter((c) => normalizeStatus(c) === "occupied").length;
    const maintenance = siteChargers.filter((c) => normalizeStatus(c) === "maintenance").length;

    // 計算今日訂單數：如果站點物件包含 orders 則計算，否則預設 0
    let todayOrders = 0;
    try {
      const today = new Date();
      const isSameDay = (d) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      if (Array.isArray(site.orders)) {
        todayOrders = site.orders.reduce((acc, o) => {
          const sd = o.start_date ? new Date(o.start_date) : null;
          return acc + (sd && isSameDay(sd) ? 1 : 0);
        }, 0);
      }
    } catch (e) {
      console.warn("計算今日訂單數失敗", e);
      todayOrders = 0;
    }

    // 把統計放到一個物件，供 Modal 顯示
    const stats = { totalChargers, available, occupied, maintenance, todayOrders };
    setShowSiteModal(true);
    // 把 stats 暫存在 editSite（或用另一 state）；這裡將 stats 放到 editSite._stats
    setEditSite((prev) => ({ ...(prev || site), _stats: stats }));
  };

  // handleAddSite 定義
  const handleAddSite = () => {
    const blank = { site_name: "", address: "" };
    setSelectedSite(blank);
    setEditSite(blank);
    setIsEditingSite(true);
    setCreatingSite(true);
    setShowSiteModal(true);
  };

  const handleSiteFieldChange = (e) => {
    const { name, value } = e.target;
    setEditSite((prev) => {
      let v = value;
      if (name === "longitude" || name === "latitude") {
        v = value === "" ? "" : toFixed8(value);
      }
      return { ...prev, [name]: v };
    });
  };

  const handleSaveSite = async () => {
    if (!editSite) return;
    try {
      setSaving(true);
      const { site_name, address, longitude, latitude } = editSite;

      if (!isValidLng(longitude) || !isValidLat(latitude)) {
        throw new Error("經度/緯度為必填，且必須為數字（經度 -180~180；緯度 -90~90）");
      }

      const lng8 = Number(toFixed8(longitude));
      const lat8 = Number(toFixed8(latitude));

      const payload = {
        site_name,
        address,
        longitude: lng8,
        latitude: lat8,
      };

      if (creatingSite || !editSite.site_id) {
        const created = await ApiService.createSite(payload);
        setSites((prev) => [...prev, created]);
        setSelectedSite(created);
        setEditSite(created);
        setCreatingSite(false);
      } else {
        const updated = await ApiService.updateSite(editSite.site_id, payload);
        setSites((prev) => prev.map((s) => (s.site_id === updated.site_id ? { ...s, ...updated } : s)));
        setSelectedSite(updated);
        setEditSite(updated);
      }
      setIsEditingSite(false);
    } catch (err) {
      console.error("Failed to save site:", err);
      alert(`站點儲存失敗：${err.message || "請稍後再試"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  return (
    <div className="sites-content">
      <div className="content-header">
        <h2>站點管理</h2>
        <div>
          <button className="btn" onClick={loadAllData}>
            🔄 刷新資料
          </button>
          <button className="btn primary" onClick={handleAddSite}>
            ➕ 新增站點
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="mini-stat primary">
          <span className="number">{sites.length}</span>
          <span className="label">總站點數</span>
        </div>
        <div className="mini-stat success">
          <span className="number">{counts.available}</span>
          <span className="label">可用充電器</span>
        </div>
        <div className="mini-stat warning">
          <span className="number">{counts.occupied}</span>
          <span className="label">使用中</span>
        </div>
        <div className="mini-stat danger">
          <span className="number">{counts.maintenance}</span>
          <span className="label">維護中</span>
        </div>
        <div className="mini-stat">
          <span className="number">{counts.preparing}</span>
          <span className="label">準備中</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>站點ID</th>
              <th>站點名稱</th>
              <th>地址</th>
              <th>充電器數量</th>
              <th>可用數量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => {
              // 轉成字串比較 site_id，避免 number vs string 差異造成過濾失敗
              const siteChargers = chargers.filter((c) => String(c.site_id) === String(site.site_id));
              // 使用 normalizeStatus(c) 判斷是否為 'available'（比直接比對 c.status 更可靠）
              const availableCount = siteChargers.filter((c) => normalizeStatus(c) === "available").length;

              return (
                <tr key={site.site_id}>
                  <td>{site.site_id}</td>
                  <td>{site.site_name}</td>
                  <td>{site.address}</td>
                  <td>{siteChargers.length}</td>
                  <td>
                    <span className={`badge ${availableCount > 0 ? "success" : "danger"}`}>
                      {availableCount}
                    </span>
                  </td>
                  <td>
                    <button className="btn small primary" onClick={() => handleViewSite(site)}>
                      查看詳情
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSiteModal && selectedSite && (
        <SiteDetailModal
          site={selectedSite}
          editSite={editSite}
          isEditing={isEditingSite}
          creating={creatingSite}
          saving={saving}
          // 傳入我們剛計算好的統計（若無則 fallback 為 0）
          stats={editSite?._stats ?? { totalChargers: 0, available: 0, occupied: 0, maintenance: 0, todayOrders: 0 }}
          onEdit={() => setIsEditingSite(true)}
          onCancel={() => {
            setEditSite(selectedSite);
            setIsEditingSite(false);
            setCreatingSite(false);
          }}
          onSave={handleSaveSite}
          onChange={handleSiteFieldChange}
          onClose={() => !saving && setShowSiteModal(false)}
        />
      )}
    </div>
  );
};

export default SiteManagement;
