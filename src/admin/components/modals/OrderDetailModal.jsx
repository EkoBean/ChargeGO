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

  // 處理租借狀態變更
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
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>租借詳情 #{order.order_ID}</h3>
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
                <button 
                  className="btn admin-btn admin-small admin-primary" 
                  onClick={onSave} 
                  disabled={saving}
                >
                  {saving ? "儲存中..." : "儲存"}
                </button>
              </>
            )}
            <button className="admin-close-btn" onClick={() => !saving && onClose()}>
              ×
            </button>
          </div>
        </div>
        
        <div className="admin-modal-body">
          <div className="admin-order-details">
            <div className="admin-detail-section">
              <h4>基本資訊</h4>
              {!isEditing ? (
                <>
                  <p><strong>租借編號:</strong> {order.order_ID}</p>
                  <p><strong>用戶名稱:</strong> {order.user_name}</p>
                  <p><strong>用戶ID:</strong> {order.uid}</p>
                  <p><strong>出借站點:</strong> {order.rental_site_name ?? order.site_name ?? order.rental_site_id ?? "-"}</p>
                  <p><strong>歸還站點:</strong> {order.return_site_name ?? "-"}</p>
                  <p><strong>充電器:</strong> {order.charger_id || "未指定"}</p>
                  <p><strong>備註:</strong> {order.comment || "-"}</p>
                  <p>
                    <strong>租借狀態:</strong> 
                    <span
                      className={`admin-badge ${
                        order.order_status === "1" || order.order_status === "completed"
                          ? "admin-success"
                          : order.order_status === "0" || order.order_status === "active"
                          ? "admin-warning"
                          : "admin-danger"
                      }`}
                    >
                      {getOrderStatusText(order.order_status)}
                    </span>
                  </p>
                </>
              ) : (
                <div className="admin-form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px' 
                }}>
                  {/* 出借站點（不可編輯） */}
                  <div className="admin-form-group">
                    <label>出借站點</label>
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

                  {/* 歸還站點（可編輯） - 根據租借狀態決定是否顯示 */}
                  {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") ? (
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
                    <div className="admin-form-group">
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
                        進行中的租借無需歸還站點
                      </div>
                    </div>
                  )}

                  {/* 充電器（不可編輯） */}
                  <div className="admin-form-group">
                    <label>租借設備</label>
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

                  {/* 租借狀態 */}
                  <div className="admin-form-group">
                    <label>租借狀態</label>
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
                      <option value="0">租借中</option>
                      <option value="1">已歸還</option>
                      <option value="-1">已取消</option>
                    </select>
                    <small className="admin-input-hint">
                      {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") ? 
                        '已歸還/取消需填寫歸還站點和結束時間' : 
                        '租借中只需要基本資訊'
                      }
                    </small>
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
              )}
            </div>

            <div className="admin-detail-section">
              <h4>時間資訊</h4>
              
              {!isEditing ? (
                <>
                  <p><strong>出借時間:</strong> {order.start_date ? new Date(order.start_date).toLocaleString() : "未開始"}</p>
                  <p><strong>歸還時間:</strong> {order.end ? new Date(order.end).toLocaleString() : "租借中"}</p>
                  <p><strong>租借時長:</strong> {order.end && order.start_date ? 
                    Math.round((new Date(order.end) - new Date(order.start_date)) / (1000 * 60)) + " 分鐘" : 
                    "租借中"}
                  </p>
                </>
              ) : (
                <div className="admin-form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: editOrder?.order_status === "0" ? '1fr' : '1fr 1fr',
                  gap: '20px' 
                }}>
                  <div className="admin-form-group">
                    <label>出借時間</label>
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
                  
                  {/* 歸還時間 - 只有已歸還或已取消才顯示 */}
                  {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") && (
                    <div className="admin-form-group">
                      <label>歸還時間 <span className="admin-required">*</span></label>
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
                    <small className="admin-input-hint" style={{ gridColumn: '1 / -1' }}>
                      租借中無需填寫歸還時間
                    </small>
                  )}
                </div>
              )}
            </div>

            <div className="admin-detail-section">
              <h4>費用資訊</h4>
              {!isEditing ? (
                <>
                  <p><strong>訂單總額:</strong> NT$ {order.total_amount || 0}</p>
                  <p><strong>租借費用:</strong> NT$ {order.fee || 0}</p>
                  <p><strong>實付金額:</strong> NT$ {order.paid_amount || order.fee || 0}</p>
                  <p><strong>計費方式:</strong> {order.charge_method || "標準計費"}</p>
                  <p><strong>支付狀態:</strong> 
                    <span className={`admin-badge ${order.payment_status ? "admin-success" : "admin-warning"}`}>
                      {order.payment_status ? "已支付" : "未支付"}
                    </span>
                  </p>
                </>
              ) : (
                <div className="admin-form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px' 
                }}>
                  <div className="admin-form-group">
                    <label>訂單總額</label>
                    <input
                      type="number"
                      name="total_amount"
                      value={editOrder?.total_amount || ""}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        minHeight: 38
                      }}
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label>租借費用</label>
                    <input
                      type="number"
                      name="fee"
                      value={editOrder?.fee || ""}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        minHeight: 38
                      }}
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label>計費方式</label>
                    <select
                      name="charge_method"
                      value={editOrder?.charge_method || "標準計費"}
                      onChange={onChange}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        minHeight: 38
                      }}
                    >
                      <option value="標準計費">標準計費</option>
                      <option value="時間計費">時間計費</option>
                      <option value="固定費用">固定費用</option>
                      <option value="免費使用">免費使用</option>
                    </select>
                  </div>
                  
                  <div className="admin-form-group">
                    <label>支付狀態</label>
                    <select
                      name="payment_status"
                      value={editOrder?.payment_status ? "1" : "0"}
                      onChange={(e) => onChange({
                        target: {
                          name: 'payment_status',
                          value: e.target.value === "1"
                        }
                      })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        minHeight: 38
                      }}
                    >
                      <option value="0">未支付</option>
                      <option value="1">已支付</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 狀態變更確認對話框 */}
      {showStatusConfirm && (
        <div 
          className="admin-modal-overlay" 
          onClick={cancelStatusChange}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1001
          }}
        >
          <div 
            className="admin-modal-content" 
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
              className="admin-modal-header"
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
                className="admin-close-btn" 
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
              className="admin-modal-body"
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
                您即將會更改用戶租借狀態，是否確定要修改？
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center'
              }}>
                <button 
                  className="btn admin-btn" 
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
                  className="btn admin-btn admin-danger" 
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