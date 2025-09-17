// ===========import library===========================
import React, { useState } from 'react';
import ApiService from '../../services/api';  // 新增：匯入 ApiService
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

  // 新增：charger 新增相關狀態
  const [newChargers, setNewChargers] = useState([]);
  const [chargerCount, setChargerCount] = useState(1);
  const [chargerStatus, setChargerStatus] = useState('2');  // 預設值改為字串 '2'

  // 若 site 為 null（尚未選擇站點），不渲染任何內容
  if (!site) return null;

  // 修正狀態轉中文函數，確保正確處理不同型態的狀態值
  const statusText = (status) => {
    // 確保比較時都是字串
    const s = String(status);
    
    switch (s) {
      case '-1': return "故障";
      case '0': return "進廠維修";
      case '1': return "出租中";
      case '2': return "待租借(滿電)";
      case '3': return "待租借(30%-99%)";
      case '4': return "準備中(<30%)";
      default: 
        console.warn(`未知狀態: ${status} (${typeof status})`);
        return `未知(${status})`;
    }
  };

  // 根據點擊的類型過濾充電器
  const getChargersByType = (type) => {
    switch (type) {
      case 'total':
        return chargers;
      case 'available':
        // 狀態 2 和 3 為可用
        return chargers.filter(c => {
          const status = Number(c.status);
          return status === 2 || status === 3;
        });
      case 'occupied':
        // 狀態 1 為出租中
        return chargers.filter(c => Number(c.status) === 1);
      case 'maintenance':
        // 狀態 -1 和 0 為維護中
        return chargers.filter(c => {
          const status = Number(c.status);
          return status === -1 || status === 0;
        });
      case 'preparing':
        // 狀態 4 為準備中
        return chargers.filter(c => Number(c.status) === 4);
      case 'todayOrders':
        return chargers.filter(c => c.todayOrder);
      default:
        return [];
    }
  };

  // 修正統計計算函數
  const calculateStats = (siteChargers) => {
    const stats = {
      totalChargers: siteChargers.length,
      available: 0,
      occupied: 0,
      maintenance: 0,
      preparing: 0,
      todayOrders: 0
    };

    siteChargers.forEach(c => {
      const status = Number(c.status);
      switch (status) {
        case 2:
        case 3:
          stats.available++;
          break;
        case 1:
          stats.occupied++;
          break;
        case -1:
        case 0:
          stats.maintenance++;
          break;
        case 4:
          stats.preparing++;
          break;
      }
    });

    console.log(`站點 ${site.site_id} 統計:`, stats); // Debug 日誌
    return stats;
  };

  const selectedSiteChargers = chargers.filter(c => c.site_id === site.site_id);
  const currentStats = calculateStats(selectedSiteChargers);

  function PreviewMap() {
    const cityCenters = {
      "基隆市": { lat: 25.1314, lng: 121.7444 },
      "台北市": { lat: 25.0330, lng: 121.5654 },
      "新北市": { lat: 25.0160, lng: 121.4628 },
      "桃園市": { lat: 24.9936, lng: 121.3010 },
      "新竹市": { lat: 24.8138, lng: 120.9675 },
      "新竹縣": { lat: 24.8310, lng: 121.0110 },
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
      "宜蘭縣": { lat: 24.7548, lng: 121.7601 },
      "花蓮縣": { lat: 23.9911, lng: 121.6111 },
      "台東縣": { lat: 22.7932, lng: 121.0714 },
      "澎湖縣": { lat: 23.5655, lng: 119.5662 },
      "金門縣": { lat: 24.4321, lng: 118.3186 },
      "連江縣": { lat: 26.1603, lng: 119.9499 },
    }

    // 創建站點：
    //          editeSite有經緯度就用editSite的
    //          沒有就用縣市中心
    //          縣市沒有就用台北市中心
    // 編輯站點：
    //          用editSite的經緯度
    // 預覽站點：
    //          用site的經緯度
    const mapCenter = creating
      ? (editSite?.latitude && editSite?.longitude
        ? {
          lat: Number(editSite.latitude),
          lng: Number(editSite.longitude)
        }
        :
        (editSite && editSite.country
          ? cityCenters[editSite.country]
          : { lat: 25.033964, lng: 121.564468 }))
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


  // 修正：處理 charger 新增
  const handleAddChargers = async () => {
    const count = parseInt(chargerCount, 10);
    if (count <= 0 || count > 10) {
      alert('數量必須在 1-10 之間');
      return;
    }

    if (!site || !site.site_id) {
      alert('無法取得站點資訊');
      return;
    }

    // 確保使用字串形式的狀態值
    const normalizedStatus = String(chargerStatus);
    console.log('準備新增充電器，狀態:', chargerStatus, '->', normalizedStatus);

    try {
      // 從 API 重新獲取所有充電器以確保 charger_id 不重複
      const allChargers = await ApiService.getChargers();
      console.log('所有充電器資料:', allChargers);
      
      // 更安全的 charger_id 生成邏輯
      let maxChargerId = 0;
      if (allChargers && allChargers.length > 0) {
        // 過濾出有效的數字 ID
        const validIds = allChargers
          .map(c => parseInt(c.charger_id, 10))
          .filter(id => !isNaN(id) && id > 0);
        
        if (validIds.length > 0) {
          maxChargerId = Math.max(...validIds);
        }
      }
      
      console.log('當前最大充電器 ID:', maxChargerId);
      
      // 檢查是否會與現有 ID 衝突
      const existingIds = new Set(allChargers.map(c => String(c.charger_id)));
      const newChargersList = [];
      
      for (let i = 0; i < count; i++) {
        let newChargerId = maxChargerId + 1 + i;
        
        // 確保不與現有 ID 衝突
        while (existingIds.has(String(newChargerId))) {
          newChargerId++;
        }
        
        // 再次檢查這個 ID 是否已被使用（以防併發）
        if (existingIds.has(String(newChargerId))) {
          console.warn(`充電器 ID ${newChargerId} 已被使用，跳過`);
          continue;
        }
        
        newChargersList.push({
          charger_id: newChargerId,
          site_id: site.site_id,
          status: normalizedStatus,  // 使用字串形式
          operator_id: parseInt(localStorage.getItem('employeeId'), 10)
        });
        
        // 將新 ID 加入檢查集合
        existingIds.add(String(newChargerId));
      }
      
      if (newChargersList.length === 0) {
        alert('無法生成有效的充電器 ID，請稍後再試');
        return;
      }
      
      console.log('準備新增的充電器:', newChargersList);
      setNewChargers(newChargersList);
      
    } catch (error) {
      console.error('獲取充電器資料失敗:', error);
      alert('無法獲取充電器資料，請檢查網路連線後再試');
    }
  };

  // 先新增 charger，再保存站點，並刷新資料
  const handleSave = async () => {
    try {
      let chargersAdded = 0;
      
      if (newChargers.length > 0) {
        console.log('開始新增充電器:', newChargers);
        
        for (const charger of newChargers) {
          try {
            console.log('正在新增充電器:', charger);
            
            // 確保 status 為數字型態
            const chargerPayload = {
              ...charger,
              status: parseInt(charger.status, 10)
            };
            
            const result = await ApiService.createCharger(chargerPayload);
            console.log('充電器新增成功:', result);
            
            // 確認返回結果是否包含預期的資料結構
            if (result && result.charger) {
              // 檢查返回狀態是否與請求狀態一致
              if (parseInt(result.charger.status, 10) !== parseInt(charger.status, 10)) {
                console.warn(`警告: 狀態值不一致 - 請求:${charger.status}, 返回:${result.charger.status}`);
              }
            } else {
              console.warn('新增充電器後未收到預期的返回資料:', result);
            }
            
            chargersAdded++;
          } catch (err) {
            console.error('新增充電器失敗:', err);
            console.error('失敗的充電器資料:', charger);
            
            throw new Error(`新增充電器 ${charger.charger_id} 失敗: ${err.message}`);
          }
        }
        
        console.log(`成功新增 ${chargersAdded} 個充電器`);
        setNewChargers([]);  // 清空預覽列表
      }
      
      // 然後保存站點（如果有站點需要保存）
      if (onSave) {
        await onSave();
      }
      
      // 強制重新載入資料以確保統計更新
      if (window.loadAllData) {
        console.log('重新載入數據以更新統計...');
        await window.loadAllData();
      }
      
      // 顯示成功訊息
      if (chargersAdded > 0) {
        alert(`成功新增 ${chargersAdded} 個充電器！`);
      } else {
        alert('保存成功！');
      }
      
    } catch (err) {
      console.error("保存失敗:", err);
      alert(`保存失敗：${err.message}`);
    }
  };

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
                  <button className="btn admin-btn admin-small admin-primary" onClick={handleSave} disabled={saving}>
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
                      <span className="admin-number">{currentStats.totalChargers}</span>
                      <span className="admin-label">總充電器</span>
                    </div>
                    <div
                      className="admin-mini-stat admin-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveStat('available')}
                    >
                      <span className="admin-number">{currentStats.available}</span>
                      <span className="admin-label">可用充電器</span>
                    </div>
                    <div
                      className="admin-mini-stat admin-warning"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveStat('occupied')}
                    >
                      <span className="admin-number">{currentStats.occupied}</span>
                      <span className="admin-label">使用中</span>
                    </div>
                    <div
                      className="admin-mini-stat admin-info"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveStat('maintenance')}
                    >
                      <span className="admin-number">{currentStats.maintenance}</span>
                      <span className="admin-label">維護中</span>
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

            {/* 新增充電器部分 - 移到 modal-body 內部 */}
            {!creating && (
              <div className="admin-detail-section">
                <h4>新增充電器</h4>
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label>數量</label>
                    <input
                      type="number"
                      value={chargerCount}
                      onChange={(e) => setChargerCount(e.target.value)}
                      min="1"
                      max="10"
                      placeholder="1"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%'
                      }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>狀態</label>
                    <select 
                      value={chargerStatus} 
                      onChange={(e) => setChargerStatus(e.target.value)}  // 直接使用字串值
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%'
                      }}
                    >
                      <option value="-1">故障</option>
                      <option value="0">進廠維修</option>
                      <option value="1">出租中</option>
                      <option value="2">待租借(滿電)</option>
                      <option value="3">待租借(30%-99%)</option>
                      <option value="4">準備中(30%)</option> 
                      
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <button className="btn admin-btn admin-small" onClick={handleAddChargers}>
                      預覽充電器
                    </button>
                  </div>
                </div>
                
                {newChargers.length > 0 && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e3e8ee'
                  }}>
                    <h5>將新增以下充電器：</h5>
                    <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                      {newChargers.map((c, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>
                          <strong>充電器 ID:</strong> {c.charger_id}, 
                          <strong> 狀態:</strong> {statusText(c.status)} ({c.status})
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        className="btn admin-btn admin-small admin-primary" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? '新增中...' : `確定新增 ${newChargers.length} 個充電器`}
                      </button>
                      <button 
                        className="btn admin-btn admin-small" 
                        onClick={() => setNewChargers([])}
                        style={{ marginLeft: '10px' }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div >
    </APIProvider>
  );
};

export default SiteDetailModal;
