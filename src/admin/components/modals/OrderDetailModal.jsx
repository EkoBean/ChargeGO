import React from 'react';

const OrderDetailModal = ({
  order,
  editOrder,
  isEditing,
  creating,
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
  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {creating ? "新增訂單" : `訂單詳情 #${order.order_ID}`}
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
                <button 
                  className="btn small primary" 
                  onClick={onSave} 
                  disabled={saving || (isEditing && !editOrder?.site_id)}
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
                  <p><strong>站點:</strong> {order.site_name}</p>
                  <p><strong>充電器:</strong> {order.charger_id || "未指定"}</p>
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
                <div className="form-grid">
                  {creating && (
                    <div className="form-group form-col-2">
                      <label>用戶ID</label>
                      <input
                        type="text"
                        name="uid"
                        value={editOrder?.uid || ""}
                        onChange={onChange}
                        placeholder="請輸入用戶ID"
                      />
                    </div>
                  )}
                  
                  <div className="form-group form-col-2">
                    <label>選擇站點</label>
                    <select 
                      name="site_id" 
                      value={editOrder?.site_id || ""} 
                      onChange={onChange}
                    >
                      <option value="">-- 選擇站點 --</option>
                      {sites.map(site => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group form-col-2">
                    <label>選擇充電器</label>
                    <select 
                      name="charger_id" 
                      value={editOrder?.charger_id || ""} 
                      onChange={onChange}
                      disabled={!editOrder?.site_id}
                    >
                      <option value="">-- 選擇充電器 --</option>
                      {siteChargers.map(charger => (
                        <option 
                          key={charger.charger_id} 
                          value={charger.charger_id}
                          disabled={charger.status !== "available" && charger.charger_id !== order.charger_id}
                        >
                          #{charger.charger_id} - {charger.status === "available" ? "可用" : 
                                                 charger.status === "occupied" ? "使用中" : "維護中"}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>訂單狀態</label>
                    <select 
                      name="order_status" 
                      value={editOrder?.order_status || "active"} 
                      onChange={onChange}
                    >
                      <option value="active">進行中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
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
                <div className="form-grid">
                  <div className="form-group">
                    <label>開始時間</label>
                    <input 
                      type="datetime-local" 
                      value={order.start_date ? new Date(order.start_date).toISOString().slice(0, 16) : ""} 
                      disabled 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>結束時間 {!editOrder?.end && "(未結束)"}</label>
                    <input 
                      type="datetime-local" 
                      name="end"
                      value={editOrder?.end ? new Date(editOrder.end).toISOString().slice(0, 16) : ""} 
                      onChange={onChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {!creating && (
              <div className="detail-section">
                <h4>費用資訊</h4>
                <p><strong>總費用:</strong> NT$ {order.fee || 0}</p>
                <p><strong>計費方式:</strong> {order.charge_method || "標準計費"}</p>
                <p><strong>支付狀態:</strong> {order.payment_status ? "已支付" : "未支付"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;