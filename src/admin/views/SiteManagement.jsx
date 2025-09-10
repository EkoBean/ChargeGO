import React, { useEffect, useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import SiteDetailModal from '../components/modals/SiteDetailModal';
import ApiService from '../services/api';
import OperationLogger from '../utils/operationLogger';

//站點管理主畫面
const SiteManagement = () => {
  // 從 context 取得 sites, chargers, setSites, loading, error, loadAllData
  const { sites, chargers, setSites, loading, error, loadAllData } = useAdminData();

  // debug: 確認 chargers 內容（印出第一筆完整物件以了解欄位）
  if (Array.isArray(chargers) && chargers.length > 0) {
    // console.log('SiteManagement chargers[0]:', JSON.stringify(chargers[0], null, 2));
  } else {
    console.log('SiteManagement chargers sample (empty or not array):', chargers);
  }

  const chargersArr = Array.isArray(chargers) ? chargers : [];

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

  const [siteFilter, setSiteFilter] = useState("all");//顯示所有站點

  // =========== modal selections =================
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);

  // ========== modal content ===============
  // currently editing site data in modal form
  const [editSite, setEditSite] = useState(null);

  // handleAddSite(click on "新增" button) & called in SiteDetailModal.jsx(click on "編輯" button)
  const [isEditingSite, setIsEditingSite] = useState(false);
  // handleAddSite(click on "新增" button) 
  const [creatingSite, setCreatingSite] = useState(false);

  // saving condition (during handleSaveSite)
  const [saving, setSaving] = useState(false);

  // =========== other status ================
  // ('' ->message content, null -> warning type)
  const [formatWarning, setFormatWarning] = useState({ message: '', type: null });

  // =========== functions pack ================

  const checker = {
    isDemical8: (n) => {
      const str = String(n);
      return str.includes('.') && str.split('.')[1].length === 8;
    },
    isValidLng: (n) => {
      const v = parseFloat(n);
      return !isNaN(v) && v >= 119.5 && v <= 122.5;
    },
    isValidLat: (n) => {
      const v = parseFloat(n);
      return !isNaN(v) && v >= 21.5 && v <= 25.5;
    },
  };

  // ==========================================

  // handleViewSite 定義
  const handleViewSite = async (site) => {
    // 記錄查看站點操作
    try {
      await OperationLogger.log(OperationLogger.ACTIONS.VIEW_SITE, {
        site_id: site.site_id,
        site_name: site.site_name,
        action_time: new Date().toISOString()
      });
    } catch (err) {
      console.warn('記錄查看操作失敗:', err);
    }

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
  // debug ===========testing editSite changes============
  useEffect(() => { console.log('editSite :>> ', editSite); }, [editSite])
  useEffect(() => { console.log('formatWarning :>> ', formatWarning); }, [formatWarning])

  // ===================================================

  const handleSiteFieldChange = (e) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    // debug=================================
    console.log(name, value);
    // =====================================

    setEditSite((prev) => {
      // check the coordinate format
      if (name === "longitude" || name === "latitude") {

        // 檢查小數位數是否為 8 位
        if (!checker.isDemical8(value)) {
          setFormatWarning({ message: "小數位數必須為 8 位。", type: name });
          return {
            ...prev, [name]: value
          }
        }
        // 檢查台灣經緯度範圍
        if (name === "longitude") {
          if (!checker.isValidLng(value)) {
            setFormatWarning({ message: "經度不在台灣範圍內（ 119.5-122.5）。", type: name });
            return {
              ...prev, [name]: value
            };
          }
        } else if (name === "latitude") {
          if (!checker.isValidLat(value)) {
            setFormatWarning({ message: "緯度不在台灣範圍內（21.5-25.5）。", type: name });
            return {
              ...prev, [name]: value
            };
          }
        }
        setFormatWarning("");
      }
      else if (name) {
        if (!value) {
          setFormatWarning({ message: '必填欄位不可為空', type: name });
        }
      }
      return { ...prev, [name]: value };
    });
  };

  // press the save button in SiteDetailModal.jsx
  const handleSaveSite = async () => {
    if (!editSite) return;
    try {
      setSaving(true);
      const { site_name, address, longitude, latitude, country } = editSite;
      if (!site_name || !address || !longitude || !latitude) {
        throw new Error("請填寫所有必填欄位");
      }

      if (!checker.isValidLng(longitude) || !checker.isValidLat(latitude)) {
        throw new Error("經度/緯度為必填，且必須為數字（經度 -180~180；緯度 -90~90）");
      }
      if (!checker.isDemical8(longitude) || !checker.isDemical8(latitude)) {
        throw new Error("經度/緯度小數位數必須為 8 位");
      }

      const payload = {
        site_name,
        address,
        longitude,
        latitude,
        country,
      };

      if (creatingSite || !editSite.site_id) {
        const created = await ApiService.createSite(payload);
        
        // 記錄創建站點操作
        try {
          await OperationLogger.log(OperationLogger.ACTIONS.CREATE_SITE, {
            site_name: payload.site_name,
            address: payload.address,
            longitude: payload.longitude,
            latitude: payload.latitude,
            action_time: new Date().toISOString()
          });
        } catch (err) {
          console.warn('記錄創建操作失敗:', err);
        }

        setSites((prev) => [...prev, created]);
        setSelectedSite(created.site);
        setEditSite(created.site);
        setCreatingSite(false);
      } else {
        const updated = await ApiService.updateSite(editSite.site_id, payload);
        
        // 記錄更新站點操作
        try {
          await OperationLogger.log(OperationLogger.ACTIONS.UPDATE_SITE, {
            site_id: editSite.site_id,
            site_name: payload.site_name,
            changes: payload,
            action_time: new Date().toISOString()
          });
        } catch (err) {
          console.warn('記錄更新操作失敗:', err);
        }

        setSites((prev) => prev.map((s) => (s.site_id === updated.site_id ? { ...s, ...updated } : s)));
        setShowSiteModal(true); 
        setIsEditingSite(false);
        setEditSite(updated.site);
        setSelectedSite(updated.site);
      }
    } catch (err) {
      console.error("Failed to save site:", err);
      alert(`站點儲存失敗：${err.message || "請稍後再試"}`);
    } finally {
      setSaving(false);
    }
  };

  // 取得篩選後的站點
  const filteredSites = sites.filter(site => {
    if (siteFilter === "all") return true;
    const siteChargers = chargersArr.filter((c) => String(c.site_id) === String(site.site_id));
    if (siteFilter === "available") return siteChargers.some(c => normalizeStatus(c) === "available");
    if (siteFilter === "occupied") return siteChargers.some(c => normalizeStatus(c) === "occupied");
    if (siteFilter === "maintenance") return siteChargers.some(c => normalizeStatus(c) === "maintenance");
    if (siteFilter === "preparing") return siteChargers.some(c => normalizeStatus(c) === "preparing");
    return true;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  return (
    <div className="admin-sites-content">
      <div className="admin-content-header">
        <h2>站點管理</h2>
        <div>
          <button className="btn admin-btn" onClick={loadAllData}>
            🔄 刷新資料
          </button>
          <button className="btn admin-btn admin-primary" onClick={handleAddSite}>
            ➕ 新增站點
          </button>
        </div>
      </div>

      <div className="admin-stats-row">
        <div
          className={`admin-mini-stat admin-primary${siteFilter === "all" ? " admin-card-selected" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSiteFilter("all")}
        >
          <span className="admin-number">{sites.length}</span>
          <span className="admin-label">總站點數</span>
        </div>
        <div
          className={`admin-mini-stat admin-success${siteFilter === "available" ? " admin-card-selected" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSiteFilter("available")}
        >
          <span className="admin-number">{counts.available}</span>
          <span className="admin-label">可用充電器</span>
        </div>
        <div
          className={`admin-mini-stat admin-warning${siteFilter === "occupied" ? " admin-card-selected" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSiteFilter("occupied")}
        >
          <span className="admin-number">{counts.occupied}</span>
          <span className="admin-label">使用中</span>
        </div>
        <div
          className={`admin-mini-stat admin-danger${siteFilter === "maintenance" ? " admin-card-selected" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSiteFilter("maintenance")}
        >
          <span className="admin-number">{counts.maintenance}</span>
          <span className="admin-label">維護中</span>
        </div>
        <div
          className={`admin-mini-stat${siteFilter === "preparing" ? " admin-card-selected" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSiteFilter("preparing")}
        >
          <span className="admin-number">{counts.preparing}</span>
          <span className="admin-label">準備中</span>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-data-table">
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
            {filteredSites.map((site) => {
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
                    <span className={`admin-badge ${availableCount > 0 ? "admin-success" : "admin-danger"}`}>
                      {availableCount}
                    </span>
                  </td>
                  <td>
                    <button className="btn admin-btn admin-small admin-primary" onClick={() => handleViewSite(site)}>
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
          formatWarning={formatWarning}
          site={selectedSite}
          editSite={editSite}
          isEditing={isEditingSite}
          creating={creatingSite}
          saving={saving}
          stats={editSite?._stats ?? { totalChargers: 0, available: 0, occupied: 0, maintenance: 0, todayOrders: 0 }}
          chargers={chargers.filter(c => String(c.site_id) === String(selectedSite.site_id))} // <--- 傳入該站點充電器資料
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
