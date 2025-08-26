import React from 'react';

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
  onClose
}) => {
  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {creating ? "新增站點" : `站點詳情 - ${site.site_name}`}
          </h3>
          <div>
            {!isEditing ? (
              <button className="btn small primary" onClick={onEdit}>
                編輯
              </button>
            ) : (
              <>
                <button className="btn small" onClick={onCancel} disabled={saving}>
                  取消
                </button>
                <button className="btn small primary" onClick={onSave} disabled={saving}>
                  {saving ? "儲存中..." : "儲存"}
                </button>
              </>
            )}
            <button className="close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="site-details">
            <div className="detail-section">
              <h4>基本資訊</h4>
              
              {!isEditing ? (
                <>
                  {!creating && <p><strong>站點ID:</strong> {site.site_id}</p>}
                  <p><strong>站點名稱:</strong> {site.site_name}</p>
                  <p><strong>地址:</strong> {site.address}</p>
                  <p><strong>經度:</strong> {site.longitude}</p>
                  <p><strong>緯度:</strong> {site.latitude}</p>
                </>
              ) : (
                <div className="form-grid">
                  {!creating && (
                    <div className="form-group">
                      <label>站點ID</label>
                      <input 
                        type="text" 
                        value={site.site_id} 
                        disabled 
                      />
                    </div>
                  )}
                  
                  <div className="form-group form-col-2">
                    <label>站點名稱 <span className="required">*</span></label>
                    <input
                      type="text"
                      name="site_name"
                      value={editSite?.site_name || ""}
                      onChange={onChange}
                      placeholder="請輸入站點名稱"
                      required
                    />
                  </div>
                  
                  <div className="form-group form-col-2">
                    <label>地址 <span className="required">*</span></label>
                    <input
                      type="text"
                      name="address"
                      value={editSite?.address || ""}
                      onChange={onChange}
                      placeholder="請輸入站點地址"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>經度 <span className="required">*</span></label>
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
                  
                  <div className="form-group">
                    <label>緯度 <span className="required">*</span></label>
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

            {!creating && (
              <div className="detail-section">
                <h4>站點統計</h4>
                <div className="stats-mini-grid">
                  <div className="mini-stat success">
                    <span className="number">5</span>
                    <span className="label">總充電器</span>
                  </div>
                  <div className="mini-stat primary">
                    <span className="number">3</span>
                    <span className="label">可用充電器</span>
                  </div>
                  <div className="mini-stat warning">
                    <span className="number">2</span>
                    <span className="label">使用中</span>
                  </div>
                  <div className="mini-stat info">
                    <span className="number">120</span>
                    <span className="label">今日訂單數</span>
                  </div>
                </div>
              </div>
            )}
            
            {!creating && !isEditing && (
              <div className="detail-section">
                <h4>位置預覽</h4>
                <div className="map-preview">
                  <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${site.latitude},${site.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${site.latitude},${site.longitude}&key=YOUR_API_KEY`} 
                    alt="站點位置地圖" 
                  />
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