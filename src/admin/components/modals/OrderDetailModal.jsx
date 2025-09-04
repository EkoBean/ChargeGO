import React, { useState } from 'react';

const OrderDetailModal = ({
  order,
  editOrder,
  isEditing,
  saving,
  sites,
  siteChargers,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onClose,
  getOrderStatusText
}) => {
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

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

  // 處理訂單狀態變更
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const currentStatus = String(editOrder?.order_status ?? "0");
    
    // 如果狀態沒有改變，直接更新
    if (newStatus === currentStatus) {
      onChange(e);
      return;
    }
    
    // 顯示確認對話框
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  // 確認狀態變更
  const confirmStatusChange = () => {
    if (pendingStatus !== null) {
      onChange({ target: { name: 'order_status', value: pendingStatus } });
    }
    setShowStatusConfirm(false);
    setPendingStatus(null);
  };

  // 取消狀態變更
  const cancelStatusChange = () => {
    setShowStatusConfirm(false);
    setPendingStatus(null);
  };

  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>訂單詳情 #{order.order_ID}</h3>
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
                <button 
                  className="btn small primary" 
                  onClick={onSave} 
                  disabled={saving}
                >
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
          <div className="order-details">
            <div className="detail-section">
              <h4>基本資訊</h4>
              {!isEditing ? (
                <>
                  <p><strong>訂單編號:</strong> {order.order_ID}</p>
                  <p><strong>用戶名稱:</strong> {order.user_name}</p>
                  <p><strong>用戶ID:</strong> {order.uid}</p>
                  <p><strong>租出站:</strong> {order.rental_site_name ?? order.site_name ?? order.rental_site_id ?? "-"}</p>
                  <p><strong>歸還站:</strong> {order.return_site_name ?? "-"}</p>
                  <p><strong>充電器:</strong> {order.charger_id || "未指定"}</p>
                  <p><strong>備註:</strong> {order.comment || "-"}</p>
                  <p>
                    <strong>狀態:</strong> 
                    <span
                      className={`badge ${
                        order.order_status === "1" || order.order_status === "completed"
                          ? "success"
                          : order.order_status === "0" || order.order_status === "active"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {getOrderStatusText(order.order_status)}
                    </span>
                  </p>
                </>
              ) : (
                <div className="form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px' 
                }}>
                  {/* 租借站點（不可編輯） */}
                  <div className="form-group">
                    <label>租借站點</label>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f7fafd',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        fontWeight: 500,
                        color: '#34495e',
                        minHeight: 38,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {sites.find(s => String(s.site_id) === String(editOrder?.rental_site_id))?.site_name || "-"}
                    </div>
                  </div>

                  {/* 歸還站點（可編輯） - 根據訂單狀態決定是否顯示 */}
                  {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") ? (
                    <div className="form-group">
                      <label>歸還站點 <span style={{ color: '#dc3545' }}>*</span></label>
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
                        required
                      >
                        <option value="">-- 選擇歸還站點 --</option>
                        {sites.map(site => (
                          <option key={site.site_id} value={site.site_id}>
                            {site.site_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>歸還站點</label>
                      <div
                        style={{
                          padding: '10px 14px',
                          background: '#f0f0f0',
                          borderRadius: 8,
                          border: '1px solid #e3e8ee',
                          color: '#666',
                          minHeight: 38,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        進行中訂單無需歸還站點
                      </div>
                    </div>
                  )}

                  {/* 充電器（不可編輯） */}
                  <div className="form-group">
                    <label>充電器</label>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f7fafd',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        fontWeight: 500,
                        color: '#34495e',
                        minHeight: 38,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {(() => {
                        const charger = siteChargers.find(c => String(c.charger_id) === String(editOrder?.charger_id));
                        if (charger) {
                          const model = charger.model || charger.device_model || charger.name || charger.charger_name || `行動電源`;
                          const idLabel = charger.charger_code || charger.serial_number || charger.charger_id;
                          return `${model}（編號:${idLabel}）`;
                        }
                        return editOrder?.charger_id ? `#${editOrder.charger_id}` : "未指定";
                      })()}
                    </div>
                  </div>

                  {/* 訂單狀態 */}
                  <div className="form-group">
                    <label>訂單狀態</label>
                    <select 
                      name="order_status" 
                      value={String(editOrder?.order_status ?? "0")} 
                      onChange={handleStatusChange}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff'
                      }}
                    >
                      <option value="0">進行中</option>
                      <option value="1">已完成</option>
                      <option value="-1">已取消</option>
                    </select>
                    <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") ? 
                        '已完成/取消需填寫歸還站點和結束時間' : 
                        '進行中只需要基本資訊'
                      }
                    </small>
                  </div>

                  {/* 備註 */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
              )}
            </div>

            <div className="detail-section">
              <h4>時間資訊</h4>
              
              {!isEditing ? (
                <>
                  <p><strong>開始時間:</strong> {order.start_date ? new Date(order.start_date).toLocaleString() : "未開始"}</p>
                  <p><strong>結束時間:</strong> {order.end ? new Date(order.end).toLocaleString() : "進行中"}</p>
                  <p><strong>使用時長:</strong> {order.end && order.start_date ? 
                    Math.round((new Date(order.end) - new Date(order.start_date)) / (1000 * 60)) + " 分鐘" : 
                    "進行中"}
                  </p>
                </>
              ) : (
                <div className="form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: editOrder?.order_status === "0" ? '1fr' : '1fr 1fr',
                  gap: '20px' 
                }}>
                  <div className="form-group">
                    <label>開始時間</label>
                    <input 
                      type="datetime-local" 
                      value={editOrder?.start_date ? 
                        new Date(new Date(editOrder.start_date).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString().slice(0, 16) : ""} 
                      disabled 
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#f7fafd',
                        color: '#666',
                        minHeight: 38
                      }}
                    />
                  </div>
                  
                  {/* 結束時間 - 只有已完成或已取消才顯示 */}
                  {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") && (
                    <div className="form-group">
                      <label>結束時間 <span style={{ color: '#dc3545' }}>*</span></label>
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
                        required
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid #e3e8ee',
                          background: '#fff',
                          minHeight: 38
                        }}
                      />
                    </div>
                  )}
                  
                  {editOrder?.order_status === "0" && (
                    <small style={{ color: '#6c757d', gridColumn: '1 / -1' }}>
                      進行中的訂單無需填寫結束時間
                    </small>
                  )}
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>費用資訊</h4>
              <p><strong>總費用:</strong> NT$ {order.fee || 0}</p>
              <p><strong>計費方式:</strong> {order.charge_method || "標準計費"}</p>
              <p><strong>支付狀態:</strong> {order.payment_status ? "已支付" : "未支付"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 狀態變更確認對話框 */}
      {showStatusConfirm && (
        <div 
          className="modal-overlay" 
          onClick={cancelStatusChange}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1001
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '420px',
              border: '3px solid #dc3545',
              boxShadow: '0 10px 40px rgba(220, 53, 69, 0.3)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)'
            }}
          >
            <div 
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '9px 9px 0 0',
                borderBottom: 'none'
              }}
            >
              <h3 style={{ 
                margin: 0,
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '20px',
                  color: '#ffd700'
                }}>⚠️</span>
                警告
              </h3>
              <button 
                className="close-btn" 
                onClick={cancelStatusChange}
                style={{
                  color: 'white',
                  fontSize: '24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                ×
              </button>
            </div>
            <div 
              className="modal-body"
              style={{
                padding: '24px 20px',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: '#dc3545'
              }}>
                🚨
              </div>
              <p style={{
                fontSize: '16px',
                color: '#333',
                marginBottom: '24px',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                您即將會更改用戶訂單狀態，是否確定要修改？
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center'
              }}>
                <button 
                  className="btn" 
                  onClick={cancelStatusChange}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: '2px solid #6c757d',
                    backgroundColor: '#fff',
                    color: '#6c757d',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  返回
                </button>
                <button 
                  className="btn primary" 
                  onClick={confirmStatusChange}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: '2px solid #dc3545',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c82333';
                    e.target.style.borderColor = '#c82333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                    e.target.style.borderColor = '#dc3545';
                  }}
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;