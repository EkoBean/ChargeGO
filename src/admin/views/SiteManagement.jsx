import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import SiteDetailModal from '../components/modals/SiteDetailModal';
import ApiService from '../services/api';

const SiteManagement = () => {
  const { sites, chargers, setSites, loading, error, loadAllData } = useAdminData();
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

  const handleViewSite = async (site) => {
    setSelectedSite(site);
    setEditSite(site);
    setIsEditingSite(false);
    setCreatingSite(false);
    setShowSiteModal(true);
  };

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
          <button className="btn primary" onClick={handleAddSite} style={{ marginLeft: 8 }}>
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
          <span className="number">
            {chargers.filter((c) => c.status === "available").length}
          </span>
          <span className="label">可用充電器</span>
        </div>
        <div className="mini-stat warning">
          <span className="number">
            {chargers.filter((c) => c.status === "occupied").length}
          </span>
          <span className="label">使用中</span>
        </div>
        <div className="mini-stat danger">
          <span className="number">
            {chargers.filter((c) => c.status === "maintenance").length}
          </span>
          <span className="label">維護中</span>
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
              const siteChargers = chargers.filter((c) => c.site_id === site.site_id);
              const availableCount = siteChargers.filter((c) => c.status === "available").length;

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
