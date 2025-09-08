// ===========import library===========================
import React, { useState } from 'react';
// Google Maps
import {
  APIProvider,
  Map,
  useMap,
  useAdvancedMarkerRef,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";



// ====================================================
// 站點管理 查看詳細資訊視窗
// 顯示單一站點的詳細資料與統計，提供建立/編輯站點。
const SiteDetailModal = ({
  site,
  editSite,
  isEditing,
  creating,
  saving,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onClose,
  // 新增 stats prop，來自 SiteManagement 計算
  stats = { totalChargers: 0, available: 0, occupied: 0, maintenance: 0, todayOrders: 0 },
  chargers = [] // 父元件需傳入該站點所有充電器資料
}) => {
  const [activeStat, setActiveStat] = useState(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState("");

  // 狀態轉中文
  const statusText = (status) => {
    switch (Number(status)) {
      case -1: return "故障";
      case 0: return "進廠維修";
      case 1: return "出租中";
      case 2: return "代租借,滿電";
      case 3: return "待租借,30%-99%";
      case 4: return "準備中,<30%";
      default: return "未知";
    }
  };

  // 根據點擊的類型過濾充電器
  const getChargersByType = (type) => {
    switch (type) {
      case 'total':
        return chargers;
      case 'available':
        return chargers.filter(c => [2, 3].includes(Number(c.status)));
      case 'occupied':
        return chargers.filter(c => Number(c.status) === 1);
      case 'maintenance':
        return chargers.filter(c => [-1, 0].includes(Number(c.status)));
      case 'todayOrders':
        return chargers.filter(c => c.todayOrder); // 根據你的 todayOrder 欄位
      default:
        return [];
    }
  };

  const selectedSiteChargers = chargers.filter(c => c.site_id === site.site_id);



  return (
    // overlay：點 overlay 可關閉 modal（除非正在 saving）
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      {/* 內容區：阻止事件冒泡以避免點擊內容區也關閉 modal */}
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          {/* 標題： "新增站點"，否則顯示站點名稱 */}
          <h3>
            {creating ? "新增站點" : `站點詳情 - ${site.site_name}`}
          </h3>
          <div>
            {/* 編輯狀態控制按鈕：
                - 非編輯模式顯示「編輯」按鈕（由父元件 onEdit 負責切換 isEditing）
                - 編輯模式顯示「取消」與「儲存」按鈕（由 onCancel / onSave 處理）
                - saving 為 true 時會 disable 按鈕以避免重複送出 */}
            {!isEditing ? (
              <button className="btn admin-btn admin-small admin-primary" onClick={onEdit}>
                編輯
              </button>
            ) : (
              <>
                <button className="btn admin-btn admin-small" onClick={onCancel} disabled={saving}>
                  取消
                </button>
                <button className="btn admin-btn admin-small admin-primary" onClick={onSave} disabled={saving}>
                  {saving ? "儲存中..." : "儲存"}
                </button>
              </>
            )}
            {/* 右上關閉按鈕（saving 時被鎖住） */}
            <button className="admin-close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>

        <div className="admin-modal-body">
          <div className="admin-site-details">
            <div className="admin-detail-section">
              <h4>基本資訊</h4>

              {/* 非編輯模式顯示純文字；編輯模式顯示表單 input */}
              {!isEditing ? (
                <>
                  {/* 若為查看（非建立），顯示站點 ID */}
                  {!creating && <p><strong>站點ID:</strong> {site.site_id}</p>}
                  <p><strong>站點名稱:</strong> {site.site_name}</p>
                  <p><strong>地址:</strong> {site.address}</p>
                  <p><strong>經度:</strong> {site.longitude}</p>
                  <p><strong>緯度:</strong> {site.latitude}</p>
                </>
              ) : (
                <div className="admin-form-grid">
                  {/* 編輯模式：站點 ID 為唯讀（disabled） */}
                  {!creating && (
                    <div className="admin-form-group">
                      <label>站點ID</label>
                      <input
                        type="text"
                        value={site.site_id}
                        disabled
                      />
                    </div>
                  )}

                  {/* 建立/編輯站點表單欄位（受控 input）：
                      - name 屬性需與父元件 onChange 的邏輯相符（例如使用 e.target.name 來更新對應欄位）
                      - 值使用 editSite（父元件在打開 modal 時應把 site 複製給 editSite）
                      - required 屬性在前端會阻止空值提交，但實務仍需在後端再次驗證 */}
                  <div className="admin-form-group admin-form-col-2">
                    <label>站點名稱 <span className="admin-required">*</span></label>
                    <input
                      type="text"
                      name="site_name"
                      value={editSite?.site_name || ""}
                      onChange={onChange}
                      placeholder="請輸入站點名稱"
                      required
                    />
                  </div>

                  <div className="admin-form-group admin-form-col-2">
                    <label>地址 <span className="admin-required">*</span></label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        name="address"
                        value={editSite?.address || ""}
                        onChange={onChange}
                        placeholder="請輸入站點地址"
                        required
                      />
                      <button
                        type="button"
                        className="btn admin-btn admin-small"
                        onClick={handleGeocode}
                        disabled={isLoadingGeo}
                      >
                        {isLoadingGeo ? "查詢中..." : "查詢經緯度"}
                      </button>
                    </div>
                    {geoError && <div className="admin-form-error">{geoError}</div>}
                  </div>

                  <div className="admin-form-group">
                    <label>經度 <span className="admin-required">*</span></label>
                    <input
                      type="number"
                      name="longitude"
                      step="0.00000001"
                      min="-180"
                      max="180"
                      value={editSite?.longitude || ""}
                      onChange={onChange}
                      placeholder="-180 到 180"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>緯度 <span className="admin-required">*</span></label>
                    <input
                      type="number"
                      name="latitude"
                      step="0.00000001"
                      min="-90"
                      max="90"
                      value={editSite?.latitude || ""}
                      onChange={onChange}
                      placeholder="-90 到 90"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 站點統計區塊：
                - stats 由父元件計算並傳入，包含總充電器、可用、使用中、今日訂單數 */}
            {!creating && (
              <div className="admin-detail-section">
                <h4>站點統計</h4>
                <div className="admin-stats-mini-grid admin-centered">
                  <div
                    className="admin-mini-stat admin-success"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveStat('total')}
                  >
                    <span className="admin-number">{stats.totalChargers}</span>
                    <span className="admin-label">總充電器</span>
                  </div>
                  <div
                    className="admin-mini-stat admin-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveStat('available')}
                  >
                    <span className="admin-number">{stats.available}</span>
                    <span className="admin-label">可用充電器</span>
                  </div>
                  <div
                    className="admin-mini-stat admin-warning"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveStat('occupied')}
                  >
                    <span className="admin-number">{stats.occupied}</span>
                    <span className="admin-label">使用中</span>
                  </div>
                  <div
                    className="admin-mini-stat admin-info"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveStat('todayOrders')}
                  >
                    <span className="admin-number">{stats.todayOrders}</span>
                    <span className="admin-label">今日訂單數</span>
                  </div>
                </div>
                {/* 點擊後顯示充電器清單 */}
                {activeStat && (
                  <div className="admin-charger-list">
                    <h5>
                      {activeStat === 'total' && '全部充電器'}
                      {activeStat === 'available' && '可用充電器'}
                      {activeStat === 'occupied' && '使用中充電器'}
                      {activeStat === 'maintenance' && '維護中充電器'}
                      {activeStat === 'todayOrders' && '今日訂單充電器'}
                    </h5>
                    <ul>
                      {getChargersByType(activeStat).map((c) => (
                        <li key={c.charger_id || c.id}>
                          行動充電器 {c.charger_id || c.id}（狀態：{statusText(c.status)}）
                        </li>
                      ))}
                      {getChargersByType(activeStat).length === 0 && <li>無資料</li>}
                    </ul>
                    <button className="btn admin-btn admin-small" onClick={() => setActiveStat(null)}>關閉</button>
                  </div>
                )}
              </div>
            )}
            {!creating && !isEditing && (
              <div className="admin-detail-section">
                <h4>位置預覽</h4>
                <div className="admin-map-preview">
                  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    
                  </APIProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailModal;
