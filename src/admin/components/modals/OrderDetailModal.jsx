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

  // 將 charger.status（數字或字串）標準化為語意字串： 'available' | 'occupied' | 'maintenance' | 'preparing' | 'unknown'
  const normalizeChargerStatus = (charger) => {
    const raw = charger?.status ?? charger?.charger_status ?? '';
    const s = String(raw).trim();
    const n = Number(s);
    // 依你 DB 定義對應
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
                        const cs = normalizeChargerStatus(charger); // 'available'|'occupied'|'maintenance'|'preparing'|'unknown'
                        const isCurrent = String(charger.charger_id) === String(order?.charger_id);
                        const available = cs === 'available';
                        const disabled = !available && !isCurrent;

                        // 型號/容量/電量/PD 資訊（依實際欄位調整）
                        const model =
                          charger.model ||
                          charger.device_model ||
                          charger.name ||
                          charger.charger_name ||
                          `行動電源`;
                        const idLabel = charger.charger_code || charger.serial_number || charger.charger_id;
                        const capacity = charger.capacity || charger.capacity_mAh || charger.battery_capacity || '';
                        const battery = charger.battery_percent ?? charger.battery ?? null;
                        const pd = charger.pd_watt || charger.pd || charger.output || '';

                        const statusLabel =
                          cs === 'available' ? '可用' :
                          cs === 'occupied' ? `使用中（預計 ${charger.available_at || '未知'} 可用）` :
                          (cs === 'maintenance' || cs === 'preparing') ? '維修/準備中' : '未知';

                        // 顏色：可用=綠、使用中=橘、維修/準備中=灰/藍
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
                            onKeyDown={(e) => {
                              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                                onChange({ target: { name: 'charger_id', value: charger.charger_id } });
                              }
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

                      {/* 無可用項時顯示提示 */}
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
                  
                  <div className="form-group">
                    <label>備註 (comment)</label>
                    <textarea
                      name="comment"
                      value={editOrder?.comment ?? ""}
                      onChange={onChange}
                      placeholder="可輸入備註或租借說明"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>訂單狀態</label>
                    <select 
                      name="order_status" 
                      value={String(editOrder?.order_status ?? "0")} 
                      onChange={onChange}
                    >
                      <option value="0">進行中</option>
                      <option value="1">已完成</option>
                      <option value="-1">已取消</option>
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