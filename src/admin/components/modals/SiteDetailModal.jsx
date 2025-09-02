import React from 'react';

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
  stats = { totalChargers: 0, available: 0, occupied: 0, maintenance: 0, todayOrders: 0 }
}) => {
  // UI 結構說明：
  // - overlay（最外層）：點擊 overlay 即關閉 modal（但 saving 時禁止關閉）
  // - modal-content：實際內容，阻止點擊事件冒泡以免觸發 overlay 的關閉
  // - header：顯示標題與操作按鈕（編輯 / 取消 / 儲存 / 關閉）
  // - body：分成基本資訊、站點統計、位置預覽三個區塊（視 isEditing / creating 決定顯示方式）

  return (
    // overlay：點 overlay 可關閉 modal（除非正在 saving）
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      {/* 內容區：阻止事件冒泡以避免點擊內容區也關閉 modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {/* 標題：建立時顯示 "新增站點"，否則顯示站點名稱 */}
          <h3>
            {creating ? "新增站點" : `站點詳情 - ${site.site_name}`}
          </h3>
          <div>
            {/* 編輯狀態控制按鈕：
                - 非編輯模式顯示「編輯」按鈕（由父元件 onEdit 負責切換 isEditing）
                - 編輯模式顯示「取消」與「儲存」按鈕（由 onCancel / onSave 處理）
                - saving 為 true 時會 disable 按鈕以避免重複送出 */}
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
            {/* 右上關閉按鈕（saving 時被鎖住） */}
            <button className="close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="site-details">
            <div className="detail-section">
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
                <div className="form-grid">
                  {/* 編輯模式：站點 ID 為唯讀（disabled） */}
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

                  {/* 建立/編輯站點表單欄位（受控 input）：
                      - name 屬性需與父元件 onChange 的邏輯相符（例如使用 e.target.name 來更新對應欄位）
                      - 值使用 editSite（父元件在打開 modal 時應把 site 複製給 editSite）
                      - required 屬性在前端會阻止空值提交，但實務仍需在後端再次驗證 */}
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

            {/* 站點統計區塊（僅在不是建立流程時顯示）：
                - stats 由父元件計算並傳入，包含總充電器、可用、使用中、今日訂單數 */}
            {!creating && (
              <div className="detail-section">
                <h4>站點統計</h4>
                <div className="stats-mini-grid">
                  <div className="mini-stat success">
                    <span className="number">{stats.totalChargers}</span>
                    <span className="label">總充電器</span>
                  </div>
                  <div className="mini-stat primary">
                    <span className="number">{stats.available}</span>
                    <span className="label">可用充電器</span>
                  </div>
                  <div className="mini-stat warning">
                    <span className="number">{stats.occupied}</span>
                    <span className="label">使用中</span>
                  </div>
                  <div className="mini-stat info">
                    <span className="number">{stats.todayOrders}</span>
                    <span className="label">今日訂單數</span>
                  </div>
                </div>
              </div>
            )}

            {/* 位置預覽：使用 Google Static Map API 顯示地圖快照（注意：需替換 YOUR_API_KEY）
                - 若要避免依賴外部 key，可改成使用內建地圖或不顯示預覽 */}
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