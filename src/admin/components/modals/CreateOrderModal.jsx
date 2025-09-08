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
  // 修正充電器狀態判斷邏輯
  const normalizeChargerStatus = (charger) => {
    const raw = charger?.status ?? charger?.charger_status ?? '';
    const s = String(raw).trim();
    const n = Number(s);
    
    // 首先檢查資料庫是否已有進行中的訂單
    const isRented = charger?.is_rented === true || 
                     charger?.is_rented === 1 || 
                     charger?.is_rented === '1' ||
                     charger?.current_renter != null || // 加入這個檢查
                     charger?.current_order_id != null; // 加入這個檢查
    
    if (isRented) {
        return 'occupied';
    }
    
    // 再檢查充電器本身的狀態
    if (n === -1 || n === 0) return 'maintenance';
    if (n === 1) return 'occupied';
    if (n === 2 || n === 3) return 'available';
    if (n === 4) return 'preparing';
    
    // 字串狀態的檢查
    const lower = s.toLowerCase();
    if (lower.includes('rent') || lower.includes('occup') || lower === 'occupied') return 'occupied';
    if (lower.includes('avail') || lower === 'available') return 'available';
    if (lower.includes('maint') || lower.includes('repair')) return 'maintenance';
    if (lower.includes('prep')) return 'preparing';
    
    return 'unknown';
  };

  // 修正驗證函數 - 根據訂單狀態動態驗證
  const validateForm = () => {
    const errors = {};
    const status = editOrder?.order_status || "0";
    
    // 基本必填欄位
    if (!editOrder?.uid) errors.uid = '用戶ID不能為空';
    if (!editOrder?.rental_site_id) errors.rental_site_id = '請選擇租借站點';
    if (!editOrder?.charger_id) errors.charger_id = '請選擇充電器';
    if (!editOrder?.start_date) errors.start_date = '開始時間不能為空';
    
    // 檢查選擇的充電器是否可用
    if (editOrder?.charger_id) {
      const selectedCharger = siteChargers.find(c => String(c.charger_id) === String(editOrder.charger_id));
      if (selectedCharger) {
        const chargerStatus = normalizeChargerStatus(selectedCharger);
        if (chargerStatus !== 'available') {
          errors.charger_id = '所選充電器目前不可用，請選擇其他充電器';
        }
      }
    }
    
    // 根據訂單狀態決定其他必填欄位
    if (status === "1" || status === "-1") { // 已完成或已取消
      if (!editOrder?.return_site_id) errors.return_site_id = '訂單已完成/取消，請選擇歸還站點';
      if (!editOrder?.end) errors.end = '訂單已完成/取消，請填寫結束時間';
    }
    
    return errors;
  };

  // 判斷是否需要顯示歸還相關欄位
  const needReturnFields = editOrder?.order_status === "1" || editOrder?.order_status === "-1";

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>新增訂單</h3>
          <div>
            <button className="btn admin-btn admin-small" onClick={onCancel} disabled={saving}>
              取消
            </button>
            <button 
              className="btn admin-btn admin-small admin-primary" 
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
              {saving ? "建立中..." : "建立訂單"}
            </button>
            <button className="admin-close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>
        
        <div className="admin-modal-body">
          <div className="admin-order-details">
            <div className="admin-detail-section">
              <h4>基本資訊</h4>
              <div className="admin-form-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '20px' 
              }}>
                {/* 用戶ID */}
                <div className="admin-form-group">
                  <label>用戶ID <span className="admin-required">*</span></label>
                  <input
                    type="number"
                    name="uid"
                    value={editOrder?.uid || ""}
                    onChange={onChange}
                    placeholder="請輸入用戶ID"
                    required
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e3e8ee',
                      minHeight: 38,
                      background: '#fff'
                    }}
                  />
                </div>

                {/* 用戶名稱（自動帶入） */}
                <div className="admin-form-group">
                  <label>用戶名稱</label>
                  <input
                    type="text"
                    value={editOrder?.user_name || ""}
                    disabled
                    placeholder="輸入用戶ID後自動帶入"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e3e8ee',
                      minHeight: 38,
                      backgroundColor: '#f7fafd',
                      color: editOrder?.user_name ? '#333' : '#999'
                    }}
                  />
                </div>
                
                {/* 租借站點 */}
                <div className="admin-form-group">
                  <label>租借站點 <span className="admin-required">*</span></label>
                  <select 
                    name="rental_site_id"  
                    value={editOrder?.rental_site_id || ""} 
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
                    <option value="">-- 選擇租借站點 --</option>
                    {sites.map(site => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.site_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 訂單狀態 */}
                <div className="admin-form-group">
                  <label>訂單狀態 <span className="admin-required">*</span></label>
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
                  <small className="admin-input-hint">
                    {needReturnFields ? '已完成/取消需填寫歸還站點和結束時間' : '進行中只需填寫租借站點和開始時間'}
                  </small>
                </div>

                {/* 歸還站點 - 根據狀態決定是否顯示和必填 */}
                {needReturnFields && (
                  <div className="admin-form-group">
                    <label>歸還站點 <span className="admin-required">*</span></label>
                    <select 
                      name="return_site_id"  
                      value={editOrder?.return_site_id || ""} 
                      onChange={onChange}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff'
                      }}
                      required={needReturnFields}
                    >
                      <option value="">-- 選擇歸還站點 --</option>
                      {sites.map(site => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 選擇充電器 - 修正狀態顯示和可選性 */}
                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>選擇充電器 <span className="admin-required">*</span></label>
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
                      <div style={{ padding: 12, color: '#666', textAlign: 'center' }}>
                        請先選擇租借站點以載入充電器
                      </div>
                    )}

                    {siteChargers.map((charger) => {
                      const cs = normalizeChargerStatus(charger);
                      const isCurrent = String(charger.charger_id) === String(editOrder?.charger_id);
                      const available = cs === 'available';
                      const disabled = !available; // 只有可用的充電器才能選擇

                      const model = charger.model || charger.device_model || charger.name || charger.charger_name || `行動電源`;
                      const idLabel = charger.charger_code || charger.serial_number || charger.charger_id;
                      const capacity = charger.capacity || charger.capacity_mAh || charger.battery_capacity || '';
                      const battery = charger.battery_percent ?? charger.battery ?? null;
                      const pd = charger.pd_watt || charger.pd || charger.output || '';

                      // 修正狀態標籤顯示
                      const statusLabel = (() => {
                        switch (cs) {
                          case 'available':
                            return '✅ 可租借';
                          case 'occupied':
                            // 檢查是否有租借者資訊
                            const renterInfo = charger.current_renter || charger.rented_by;
                            const expectedReturn = charger.expected_return || charger.available_at;
                            if (renterInfo) {
                              return `🚫 租借中（租借者: ${renterInfo}）`;
                            } else if (expectedReturn) {
                              return `🚫 租借中（預計 ${expectedReturn} 歸還）`;
                            }
                            return '🚫 租借中';
                          case 'maintenance':
                            return '🔧 維修中';
                          case 'preparing':
                            return '⚙️ 準備中';
                          default:
                            return '❓ 狀態未知';
                        }
                      })();

                      const dotColor = (() => {
                        switch (cs) {
                          case 'available': return '#28a745'; // 綠色
                          case 'occupied': return '#dc3545';   // 紅色
                          case 'maintenance': return '#6c757d'; // 灰色
                          case 'preparing': return '#fd7e14';   // 橘色
                          default: return '#6c757d';           // 預設灰色
                        }
                      })();

                      const textColor = disabled ? '#8a8f95' : '#212529';
                      const bg = isCurrent ? '#f0fff4' : (disabled ? '#f8f9fa' : '#fff');
                      const border = isCurrent ? '#c7f0d0' : (disabled ? '#dee2e6' : '#ececec');

                      const labelParts = [];
                      if (idLabel) labelParts.push(`#${idLabel}`);
                      if (capacity) labelParts.push(`${capacity}mAh`);
                      if (battery !== null && battery !== '') labelParts.push(`電量 ${battery}%`);
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
                            if (disabled) {
                              alert('此充電器目前不可租借，請選擇其他充電器');
                              return;
                            }
                            onChange({ target: { name: 'charger_id', value: charger.charger_id } });
                          }}
                          className="admin-charger-list-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            width: '100%',
                            padding: '12px',
                            marginBottom: 8,
                            borderRadius: 8,
                            border: `2px solid ${border}`,
                            background: bg,
                            color: textColor,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            opacity: disabled ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!disabled) {
                              e.target.style.borderColor = dotColor;
                              e.target.style.backgroundColor = available ? '#f8fff9' : bg;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = border;
                            e.target.style.backgroundColor = bg;
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              aria-hidden
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 12,
                                background: dotColor,
                                display: 'inline-block',
                                marginRight: 4,
                                boxShadow: `0 0 0 2px ${dotColor}20`
                              }}
                            />
                            <div style={{ lineHeight: 1.3 }}>
                              <div style={{ fontWeight: 600, fontSize: '15px' }}>
                                {model} 
                                <span style={{ color: '#666', fontWeight: 400, marginLeft: '8px' }}>
                                  （編號: {idLabel}）
                                </span>
                              </div>
                              {leftText && (
                                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                                  {leftText}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ marginLeft: 12, textAlign: 'right', minWidth: 180 }}>
                            <span
                              className="admin-badge"
                              style={{
                                background: disabled ? '#f8f9fa' : `${dotColor}15`,
                                color: dotColor,
                                fontWeight: 600,
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${dotColor}40`
                              }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* 顯示可用充電器統計 */}
                    {siteChargers.length > 0 && (
                      <div style={{ 
                        padding: '12px', 
                        borderTop: '1px solid #e6e6e6', 
                        marginTop: '8px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '0 0 6px 6px',
                        color: '#6c757d',
                        fontSize: '13px',
                        textAlign: 'center'
                      }}>
                        共 {siteChargers.length} 台充電器，
                        可租借: {siteChargers.filter(c => normalizeChargerStatus(c) === 'available').length} 台，
                        租借中: {siteChargers.filter(c => normalizeChargerStatus(c) === 'occupied').length} 台
                      </div>
                    )}
                  </div>
                </div>

                {/* 備註 */}
                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>備註</label>
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

            <div className="admin-detail-section">
              <h4>時間資訊</h4>
              <div className="admin-form-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: needReturnFields ? '1fr 1fr' : '1fr',
                gap: '20px' 
              }}>
                <div className="admin-form-group">
                  <label>開始時間 <span className="admin-required">*</span></label>
                  <input 
                    type="datetime-local" 
                    name="start_date"
                    value={editOrder?.start_date ? 
                      new Date(new Date(editOrder.start_date).getTime() - new Date().getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16) : ""} 
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        // 轉換為 ISO 格式但保持本地時區
                        const localDate = new Date(dateValue);
                        onChange({
                          target: {
                            name: 'start_date',
                            value: localDate.toISOString()
                          }
                        });
                      } else {
                        onChange(e);
                      }
                    }}
                    required
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
                
                {/* 結束時間 - 根據狀態決定是否顯示和必填 */}
                {needReturnFields && (
                  <div className="admin-form-group">
                    <label>結束時間 <span className="admin-required">*</span></label>
                    <input 
                      type="datetime-local" 
                      name="end"
                      value={editOrder?.end ? 
                        new Date(new Date(editOrder.end).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString().slice(0, 16) : ""} 
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                          const localDate = new Date(dateValue);
                          onChange({
                            target: {
                              name: 'end',
                              value: localDate.toISOString()
                            }
                          });
                        } else {
                          onChange(e);
                        }
                      }}
                      required={needReturnFields}
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
                )}
                
                {!needReturnFields && (
                  <small className="admin-input-hint" style={{ gridColumn: '1 / -1' }}>
                    進行中的訂單無需填寫結束時間和歸還站點
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;