import React, { useState } from 'react';
// 租借詳情與編輯表單
const OrderDetailModal = ({
  order,
  editOrder,
  isEditing,
  saving,
  sites,
  siteChargers,
  onEdit,
  onCancel,
  onSave,  // 這是保存訂單的回調函數
  onChange,
  onClose,
  getOrderStatusText,
  currentOperator  // 新增：當前操作員工ID或對象
}) => {
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // 將 charger.status 標準化為語意字串
  const normalizeChargerStatus = (charger) => {
    // 轉換為數字類型
    const statusNum = parseInt(charger.status);
    
    switch (statusNum) {
      case -1:
        return { text: "故障", color: "danger", disabled: true };
      case 0:
        return { text: "進廠維修", color: "secondary", disabled: true };
      case 1:
        return { text: "出租中", color: "warning", disabled: true };
      case 2:
        return { text: "待租借(滿電)", color: "success", disabled: false };
      case 3:
        return { text: "待租借(30%-99%)", color: "primary", disabled: false };
      case 4:
        return { text: "準備中(<30%)", color: "warning", disabled: false, warning: "電量低於30%，可能無法長時間使用" };
      default:
        return { text: "未知", color: "secondary", disabled: true };
    }
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

  // 修改保存按鈕的點擊處理，移除操作員ID的強制要求
  const handleSave = () => {
    // 直接呼叫父組件的onSave方法
    onSave(editOrder);
  };
  
  // 添加日期格式化函數
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // 轉換為 datetime-local 輸入框需要的格式: YYYY-MM-DDTHH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return '';
    }
  };

  // 處理日期輸入變更
  const handleDateTimeChange = (field, value) => {
    if (!value) {
      onChange({ target: { name: field, value: null } });
      return;
    }
    
    try {
      // 將 datetime-local 的值轉換為 ISO 字符串
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        onChange({ target: { name: field, value: date.toISOString() } });
      }
    } catch (error) {
      console.error('日期處理錯誤:', error);
    }
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
                  onClick={handleSave}  // 使用我們的新處理函數
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
                      <option key="status-0" value="0">租借中</option>
                      <option key="status-1" value="1">已歸還</option>
                      <option key="status-n1" value="-1">已取消</option>
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
                      name="start_date"
                      value={formatDateTimeLocal(editOrder?.start_date)}
                      onChange={(e) => handleDateTimeChange('start_date', e.target.value)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        minHeight: 38
                      }}
                      required
                    />
                  </div>
                  
                  {/* 歸還時間 - 只有已歸還或已取消才顯示 */}
                  {(editOrder?.order_status === "1" || editOrder?.order_status === "-1") && (
                    <div className="admin-form-group">
                      <label>歸還時間 <span className="admin-required">*</span></label>
                      <input 
                        type="datetime-local" 
                        name="end"
                        value={formatDateTimeLocal(editOrder?.end)}
                        onChange={(e) => handleDateTimeChange('end', e.target.value)}
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