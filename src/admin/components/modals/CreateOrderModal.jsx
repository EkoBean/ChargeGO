import React, { useState } from 'react';

const CreateOrderModal = ({
  editOrder,
  saving,
  sites,
  siteChargers,
  onCancel,
  onSave,
  onChange,
  onClose,
}) => {
  // 將 charger.status 標準化為語意字串
  const normalizeChargerStatus = (charger) => {
    const raw = charger?.status ?? charger?.charger_status ?? '';
    const s = String(raw).trim();
    const n = Number(s);
    // DB 定義對應
    if (n === -1 || n === 0) return 'maintenance';
    if (n === 1) return 'occupied';
    if (n === 2 || n === 3) return 'available';
    if (n === 4) return 'preparing';
    const lower = s.toLowerCase();
    if (lower.includes('avail') || lower === 'available') return 'available';
    if (lower.includes('occup') || lower === 'occupied') return 'occupied';
    if (lower.includes('maint') || lower.includes('repair')) return 'maintenance';
    return 'unknown';
  };

  // 新增一個驗證函數
  const validateForm = () => {
    const errors = {};
    
    if (!editOrder?.uid) errors.uid = '用戶ID不能為空';
    if (!editOrder?.user_name) errors.user_name = '用戶名稱不能為空';
    if (!editOrder?.site_id) errors.site_id = '請選擇站點';
    if (!editOrder?.charger_id) errors.charger_id = '請選擇充電器';
    if (!editOrder?.start_date) errors.start_date = '開始時間不能為空';
    
    return errors;
  };

  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>新增訂單</h3>
          <div>
            <button className="btn small" onClick={onCancel} disabled={saving}>
              取消
            </button>
            <button 
              className="btn small primary" 
              onClick={() => {
                const errors = validateForm();
                if (Object.keys(errors).length > 0) {
                  // 顯示第一個錯誤
                  alert(`請填寫必填欄位: ${Object.values(errors)[0]}`);
                  return;
                }
                onSave();
              }} 
              disabled={saving}
            >
              {saving ? "儲存中..." : "儲存"}
            </button>
            <button className="close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="order-details">
            <div className="detail-section">
              <h4>基本資訊</h4>
              <div className="form-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '20px' 
              }}>
                {/* 用戶ID */}
                <div className="form-group">
                  <label>用戶ID <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    name="uid"
                    value={editOrder?.uid || ""}
                    onChange={onChange}
                    placeholder="請輸入用戶ID"
                    required
                  />
                </div>
                
                {/* 用戶名稱 */}
                <div className="form-group">
                  <label>用戶名稱 <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    name="user_name"
                    value={editOrder?.user_name || ""}
                    onChange={onChange}
                    placeholder="請輸入用戶名稱"
                    required
                  />
                </div>
                
                {/* 選擇站點 */}
                <div className="form-group">
                  <label>選擇站點 <span style={{ color: '#dc3545' }}>*</span></label>
                  <select 
                    name="site_id" 
                    value={editOrder?.site_id || ""} 
                    onChange={onChange}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e3e8ee',
                      minHeight: 38,
                      background: '#fff'
                    }}
                    required
                  >
                    <option value="">-- 選擇站點 --</option>
                    {sites.map(site => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.site_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 訂單狀態 */}
                <div className="form-group">
                  <label>訂單狀態 <span style={{ color: '#dc3545' }}>*</span></label>
                  <select 
                    name="order_status" 
                    value={String(editOrder?.order_status ?? "0")} 
                    onChange={onChange}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e3e8ee',
                      minHeight: 38,
                      background: '#fff'
                    }}
                    required
                  >
                    <option value="0">進行中</option>
                    <option value="1">已完成</option>
                    <option value="-1">已取消</option>
                  </select>
                </div>

                {/* 選擇充電器 */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>選擇充電器 <span style={{ color: '#dc3545' }}>*</span></label>
                  <div
                    role="listbox"
                    aria-label="可選充電器"
                    tabIndex={0}
                    style={{
                      maxHeight: 260,
                      overflowY: 'auto',
                      border: '1px solid #e6e6e6',
                      borderRadius: 8,
                      padding: 8,
                      background: '#fff'
                    }}
                  >
                    {siteChargers.length === 0 && (
                      <div style={{ padding: 12, color: '#666' }}>此站目前沒有行動電源資料。</div>
                    )}

                    {siteChargers.map((charger) => {
                      const cs = normalizeChargerStatus(charger);
                      const isCurrent = String(charger.charger_id) === String(editOrder?.charger_id);
                      const available = cs === 'available';
                      const disabled = !available && !isCurrent;

                      const model = charger.model || charger.device_model || charger.name || charger.charger_name || `行動電源`;
                      const idLabel = charger.charger_code || charger.serial_number || charger.charger_id;
                      const capacity = charger.capacity || charger.capacity_mAh || charger.battery_capacity || '';
                      const battery = charger.battery_percent ?? charger.battery ?? null;
                      const pd = charger.pd_watt || charger.pd || charger.output || '';

                      const statusLabel =
                        cs === 'available' ? '可用' :
                        cs === 'occupied' ? `使用中（預計 ${charger.available_at || '未知'} 可用）` :
                        (cs === 'maintenance' || cs === 'preparing') ? '維修/準備中' : '未知';

                      const dotColor = available ? '#28a745' : cs === 'occupied' ? '#fd7e14' : '#6c757d';
                      const textColor = disabled ? '#8a8f95' : '#212529';
                      const bg = isCurrent ? '#f0fff4' : '#fff';
                      const border = isCurrent ? '#c7f0d0' : '#ececec';

                      const labelParts = [];
                      if (idLabel) labelParts.push(`#${idLabel}`);
                      if (capacity) labelParts.push(`${capacity}mAh`);
                      if (battery !== null && battery !== '') labelParts.push(`${battery}%`);
                      if (pd) labelParts.push(`PD ${pd}W`);
                      const leftText = labelParts.join('　');

                      return (
                        <button
                          key={charger.charger_id}
                          type="button"
                          role="option"
                          aria-selected={String(editOrder?.charger_id) === String(charger.charger_id)}
                          aria-disabled={disabled}
                          disabled={disabled}
                          onClick={() => {
                            if (disabled) return;
                            onChange({ target: { name: 'charger_id', value: charger.charger_id } });
                          }}
                          className="charger-list-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            width: '100%',
                            padding: '10px',
                            marginBottom: 8,
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            background: bg,
                            color: textColor,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              aria-hidden
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                background: dotColor,
                                display: 'inline-block',
                                marginRight: 4,
                              }}
                            />
                            <div style={{ lineHeight: 1 }}>
                              <div style={{ fontWeight: 600 }}>{model} <span style={{ color: '#666', fontWeight: 500 }}>（編號:{idLabel}）</span></div>
                              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{leftText}</div>
                            </div>
                          </div>

                          <div style={{ marginLeft: 12, textAlign: 'right', minWidth: 160 }}>
                            <span
                              className="badge"
                              style={{
                                background: 'transparent',
                                color: disabled ? '#8a8f95' : dotColor,
                                fontWeight: 700,
                              }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {siteChargers.every((c) => normalizeChargerStatus(c) !== 'available') &&
                      !(editOrder?.charger_id && siteChargers.some((c) => String(c.charger_id) === String(editOrder.charger_id))) && (
                      <div style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                        <div style={{ marginBottom: 8, fontWeight: 700 }}>目前無可用行動電源</div>
                        <div>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => { onClose(); window.alert('請前往查看其他站點'); }}
                            style={{ marginRight: 8 }}
                          >
                            查看其他站點
                          </button>
                          <button
                            type="button"
                            className="btn primary"
                            onClick={() => { window.alert('已登記通知（示範）'); }}
                          >
                            通知我
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 備註 */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>備註 (comment)</label>
                  <textarea
                    name="comment"
                    value={editOrder?.comment || ""}
                    onChange={onChange}
                    placeholder="可輸入備註或租借說明"
                    rows={3}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e3e8ee',
                      background: '#fff',
                      fontSize: 15,
                      color: '#34495e',
                      width: '100%',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>時間資訊</h4>
              <div className="form-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '20px' 
              }}>
                <div className="form-group">
                  <label>開始時間 <span style={{ color: '#dc3545' }}>*</span></label>
                  <input 
                    type="datetime-local" 
                    name="start_date"
                    value={editOrder?.start_date ? new Date(editOrder.start_date).toISOString().slice(0, 16) : ""} 
                    onChange={(e) => {
                      // 確保日期被正確解析
                      const dateValue = e.target.value;
                      if (dateValue) {
                        try {
                          // 將 datetime-local 轉換為 ISO 格式
                          const dateObj = new Date(dateValue);
                          console.log('選擇的開始時間:', dateObj.toISOString());
                          onChange({
                            target: {
                              name: 'start_date',
                              value: dateObj.toISOString() // 存儲為 ISO 格式
                            }
                          });
                        } catch (error) {
                          console.error('日期解析錯誤:', error);
                        }
                      } else {
                        onChange(e); // 如果為空值，正常傳遞
                      }
                    }}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>結束時間</label>
                  <input 
                    type="datetime-local" 
                    name="end"
                    value={editOrder?.end ? new Date(editOrder.end).toISOString().slice(0, 16) : ""} 
                    onChange={onChange}
                  />
                  <small style={{ color: '#6c757d' }}>可選填，未填寫表示進行中</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;