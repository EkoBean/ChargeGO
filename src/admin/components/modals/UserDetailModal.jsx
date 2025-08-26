import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';

const UserDetailModal = ({ 
  user, 
  editUser, 
  isEditing, 
  saving, 
  onEdit, 
  onCancel, 
  onSave, 
  onChange, 
  onClose 
}) => {
  const { getOrderStatusText } = useAdminData();

  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>用戶詳情 - {user.user_name}</h3>
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
          <div className="user-details">
            <div className="detail-section">
              <h4>基本資料</h4>

              {!isEditing ? (
                <>
                  <p><strong>用戶ID:</strong> {user.uid}</p>
                  <p><strong>姓名:</strong> {user.user_name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>電話:</strong> {user.telephone}</p>
                  <p><strong>地址:</strong> {user.address}</p>
                </>
              ) : (
                <div className="form-grid">
                  <div className="form-group">
                    <label>用戶ID</label>
                    <input value={user.uid} disabled />
                  </div>
                  <div className="form-group">
                    <label>姓名</label>
                    <input
                      name="user_name"
                      value={editUser?.user_name || ""}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editUser?.email || ""}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>電話</label>
                    <input
                      name="telephone"
                      value={editUser?.telephone || ""}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group form-col-2">
                    <label>地址</label>
                    <input
                      name="address"
                      value={editUser?.address || ""}
                      onChange={onChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>帳戶資訊</h4>

              {!isEditing ? (
                <>
                  <p><strong>錢包餘額:</strong> NT$ {user.wallet}</p>
                  <p><strong>點數:</strong> {user.point}</p>
                  <p>
                    <strong>狀態:</strong>
                    <span className={`badge ${user.blacklist ? "danger" : "success"}`}>
                      {user.blacklist ? "黑名單" : "正常"}
                    </span>
                  </p>
                  <p><strong>碳足跡:</strong> {user.total_carbon_footprint}</p>
                </>
              ) : (
                <div className="form-grid">
                  <div className="form-group">
                    <label>錢包餘額</label>
                    <input
                      type="number"
                      name="wallet"
                      step="1"
                      value={editUser?.wallet ?? 0}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>點數</label>
                    <input
                      type="number"
                      name="point"
                      step="1"
                      value={editUser?.point ?? 0}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="blacklist"
                        checked={!!editUser?.blacklist}
                        onChange={onChange}
                      />
                      黑名單
                    </label>
                  </div>
                  <div className="form-group">
                    <label>碳足跡</label>
                    <input value={user.total_carbon_footprint} disabled />
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>最近訂單記錄</h4>
              {user.orders && user.orders.length > 0 ? (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>訂單ID</th>
                      <th>開始時間</th>
                      <th>站點</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.slice(0, 5).map((order) => (
                      <tr key={order.order_ID}>
                        <td>{order.order_ID}</td>
                        <td>{new Date(order.start_date).toLocaleString()}</td>
                        <td>{order.site_name}</td>
                        <td>
                          <span
                            className={`badge ${
                              order.order_status === "1" || order.order_status === "completed"
                                ? "success"
                                : "warning"
                            }`}
                          >
                            {getOrderStatusText(order.order_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>暫無訂單記錄</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;