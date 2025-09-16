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
import { format } from 'mysql';
const APIkey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;



// ====================================================
// 站點管理 查看詳細資訊視窗
// 顯示單一站點的詳細資料與統計，提供建立/編輯站點。
const SiteDetailModal = ({
  site,
  editSite,
  isEditing,
  creating,
  saving,
  // onEdit={() => setIsEditingSite(true)}
  onEdit,
  onCancel,
  onSave,
  formatWarning,
  onChange,
  onMapClick,
  onSearchClick,
  onClose,
  // 新增 stats prop，來自 SiteManagement 計算
  stats = { totalChargers: 0, available: 0, occupied: 0, maintenance: 0, todayOrders: 0 },
  chargers = [] // 父元件需傳入該站點所有充電器資料
}) => {
  const [activeStat, setActiveStat] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // 若 site 為 null（尚未選擇站點），不渲染任何內容
  if (!site) return null;

  // 狀態轉中文
  const statusText = (status) => {
    switch (Number(status)) {
      case -1: return "故障";
      case 0: return "進廠維修";
      case 1: return "出租中";
      case 2: return "待租借,滿電";
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

  function PreviewMap() {
    const cityCenters = {
      "基隆市": { lat: 25.1314, lng: 121.7444 },
      "台北市": { lat: 25.0330, lng: 121.5654 },
      "新北市": { lat: 25.0160, lng: 121.4628 },
      "桃園市": { lat: 24.9936, lng: 121.3010 },
      "新竹市": { lat: 24.8138, lng: 120.9675 },
      "新竹縣": { lat: 24.7033, lng: 121.0794 },
      "苗栗縣": { lat: 24.5602, lng: 120.8214 },
      "台中市": { lat: 24.1477, lng: 120.6736 },
      "彰化縣": { lat: 24.0518, lng: 120.5161 },
      "南投縣": { lat: 23.9609, lng: 120.9714 },
      "雲林縣": { lat: 23.7092, lng: 120.4313 },
      "嘉義市": { lat: 23.4800, lng: 120.4491 },
      "嘉義縣": { lat: 23.4518, lng: 120.2555 },
      "台南市": { lat: 22.9999, lng: 120.2269 },
      "高雄市": { lat: 22.6273, lng: 120.3014 },
      "屏東縣": { lat: 22.5510, lng: 120.5488 },
      "宜蘭縣": { lat: 24.7298, lng: 121.7463 },
      "花蓮縣": { lat: 23.9911, lng: 121.6111 },
      "台東縣": { lat: 22.7932, lng: 121.0714 },
      "澎湖縣": { lat: 23.5655, lng: 119.5662 },
      "金門縣": { lat: 24.4321, lng: 118.3186 },
      "連江縣": { lat: 26.1603, lng: 119.9499 },
    }

    const mapCenter = creating
      ? (editSite && editSite.country
          ? cityCenters[editSite.country]
          : { lat: 25.033964, lng: 121.564468 })
      : ({
          lat: Number(editSite?.latitude || site?.latitude || 25.033964),
          lng: Number(editSite?.longitude || site?.longitude || 121.564468),
        });



    return (
      <Map
        style={{ width: "100%", height: "200px" }}
        defaultCenter={mapCenter}
        defaultZoom={16}
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
        draggingCursor={"default"}
        draggableCursor={"default"}
        onClick={isEditing && onMapClick}
        // use without map Id, keep it default style in admin system
        mapId={"DEMO_MAP_ID"}
      >
        {editSite.latitude && editSite.longitude && 
          <AdvancedMarker position={mapCenter} />
        }
      </Map>

    )
  }


  return (

    // overlay：點 overlay 可關閉 modal（除非正在 saving）
    // editing : 
    <APIProvider apiKey={APIkey}
      region='TW'
      libraries={['places']}
      onLoad={() => setIsGoogleMapsLoaded(true)}
    >
      <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
        <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3>
              {creating ? "新增站點" : `站點詳情 - ${site.site_name}`}
            </h3>
            <div>
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
                {!isEditing && !creating ? (
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
                    {/*station ID : only show when edit mode (read only) */}
                    {isEditing && !creating && (
                      <div className="admin-form-group">
                        <label>站點ID</label>
                        <input
                          type="text"
                          value={site.site_id}
                          disabled
                        />
                      </div>
                    )}
                    <div className="admin-form-group admin-form-col-2">
                      <label>站點名稱
                        <span className="admin-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="site_name"
                        value={editSite?.site_name || ""}
                        onChange={onChange}
                        placeholder="請輸入站點名稱"
                        required
                        style={!editSite?.site_name?.trim() ? { borderColor: 'red' } : {}}
                      />
                    </div>

                    <div className="admin-form-group admin-form-col-2">
                      <label>地址
                        <span className="admin-required">*</span>

                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <select name="country" id="country" value={editSite?.country || ""} required
                          onChange={onChange}>
                          <option value="">請選擇縣市</option>
                          <option value="基隆市">基隆市</option>
                          <option value="台北市">台北市</option>
                          <option value="新北市">新北市</option>
                          <option value="桃園市">桃園市</option>
                          <option value="新竹市">新竹市</option>
                          <option value="新竹縣">新竹縣</option>
                          <option value="苗栗縣">苗栗縣</option>
                          <option value="台中市">台中市</option>
                          <option value="彰化縣">彰化縣</option>
                          <option value="南投縣">南投縣</option>
                          <option value="雲林縣">雲林縣</option>
                          <option value="嘉義市">嘉義市</option>
                          <option value="嘉義縣">嘉義縣</option>
                          <option value="台南市">台南市</option>
                          <option value="高雄市">高雄市</option>
                          <option value="屏東縣">屏東縣</option>
                          <option value="宜蘭縣">宜蘭縣</option>
                          <option value="花蓮縣">花蓮縣</option>
                          <option value="台東縣">台東縣</option>
                          <option value="澎湖縣">澎湖縣</option>
                          <option value="金門縣">金門縣</option>
                          <option value="連江縣">連江縣</option>
                        </select>
                        <input
                          type="text"
                          name="address"
                          value={editSite?.address || ""}
                          onChange={onChange}
                          placeholder="請輸入站點地址"
                          required
                          style={!editSite?.address?.trim() ? { borderColor: 'red' } : {}}
                        />
                        <button
                          type="button"
                          className="btn admin-btn admin-small"
                          onClick={onSearchClick}
                        >
                          查詢地圖
                        </button>
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>經度
                        <span className="admin-required">*</span>
                        {formatWarning.type == 'longitude' && <span className='admin-lat-lng-warning'>{formatWarning.message}</span>}

                      </label>
                      <input
                        type="number"
                        name="longitude"
                        min="-180"
                        max="180"
                        value={editSite?.longitude || ""}
                        onChange={onChange}
                        placeholder="-180 到 180"
                        required
                        style={formatWarning.type == 'longitude' ? { borderColor: 'red' } : {}}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>緯度
                        <span className="admin-required">*</span>
                        {formatWarning.type === 'latitude' && <span className='admin-lat-lng-warning'>{formatWarning.message}</span>}

                      </label>
                      <input
                        type="number"
                        name="latitude"
                        min="-90"
                        max="90"
                        value={editSite?.latitude || ""}
                        onChange={onChange}
                        placeholder="-90 到 90"
                        required
                        style={formatWarning.type === 'latiude' ? { borderColor: 'red' } : {}}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 站點統計區塊：
                - stats 由父元件計算並傳入，包含總充電器、可用、使用中、今日訂單數 */}
              {/* editing & previewing */}
              {!creating && (
                <div className="admin-detail-section">
                  <h4>該站充電器現狀</h4>
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

                      <span className="admin-label">該站今日出租紀錄</span>
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
              {/* previewing */}
              {!creating && !isEditing && (
                <div className="admin-detail-section">
                </div>
              )}
            </div>
            <div className="admin-map-preview">
              <PreviewMap />
            </div>
          </div>
        </div>
      </div >
    </APIProvider>
  );
};

export default SiteDetailModal;
