import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';

// 用戶詳細資訊視窗（Modal）
// Props:
// - user: selectedUser（包含 orders）
// - editUser: 編輯時的暫存物件（受控 input 使用）
// - isEditing: 是否處於編輯模式（控制顯示 input 或純文字）
// - saving: 是否正在儲存（用來 disable 關閉與按鈕）
// - onEdit, onCancel, onSave, onChange, onClose: 各種事件 handler
// - disablePersonalEditing: 若為 true，編輯模式下姓名/Email/電話/地址仍會被鎖住
const UserDetailModal = ({ 
  user, 
  editUser, 
  isEditing, 
  saving, 
  onEdit, 
  onCancel, 
  onSave, 
  onChange, 
  onClose,
  disablePersonalEditing = false,
}) => {
  // 顯示詳細 JSON 於 console，方便開發除錯（正式上線可移除）
  try {
    console.log('UserDetailModal - user:', JSON.stringify(user, null, 2));
    console.log('UserDetailModal - editUser:', JSON.stringify(editUser, null, 2));
  } catch (e) {
    console.log('UserDetailModal props (shallow):', { user, editUser, isEditing, saving, disablePersonalEditing });
  }

  const { getOrderStatusText } = useAdminData();

  return (
    // overlay：點 overlay 可關閉 modal（除非正在 saving）
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      {/* 內容區：阻止事件冒泡以避免點擊內容區也關閉 modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {/* 標題顯示使用者名稱 */}
          <h3>用戶詳情 - {user.user_name}</h3>
          <div>
            {/* 編輯按鈕 / 取消 / 儲存（依 isEditing 切換） */}
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
          <div className="user-details">
            {/* 基本資料區塊 */}
            <div className="detail-section">
              <h4>基本資料</h4>

              {/* 非編輯模式顯示純文字；編輯模式顯示 input（但部分欄位可由 disablePersonalEditing 鎖住） */}
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
                  {/* 用戶ID 永遠不可編輯 */}
                  <div className="form-group">
                    <label>用戶ID</label>
                    <input value={user.uid} disabled />
                  </div>

                  {/* 以下欄位在編輯時會使用 editUser 的值；若 editUser 沒值則 fallback 到 user 的欄位 */}
                  {/* 同時考慮 disablePersonalEditing 來決定是否要鎖住 */}
                  <div className="form-group">
                    <label>姓名</label>
                    <input
                      name="user_name"
                      value={(editUser?.user_name ?? user?.user_name) || ""}
                      onChange={onChange}
                      // 若 disablePersonalEditing 為 true，雖在編輯模式也不可修改
                      disabled={!isEditing || disablePersonalEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={(editUser?.email ?? user?.email) || ""}
                      onChange={onChange}
                      disabled={!isEditing || disablePersonalEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>電話</label>
                    <input
                      name="telephone"
                      value={(editUser?.telephone ?? user?.telephone) || ""}
                      onChange={onChange}
                      disabled={!isEditing || disablePersonalEditing}
                    />
                  </div>

                  <div className="form-group form-col-2">
                    <label>地址</label>
                    <input
                      name="address"
                      value={(editUser?.address ?? user?.address) || ""}
                      onChange={onChange}
                      disabled={!isEditing || disablePersonalEditing}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 帳戶資訊區塊（錢包、點數、黑名單、碳足跡） */}
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
                  {/* 編輯模式下的錢包/點數/黑名單欄位（可編輯） */}
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
                    {/* 碳足跡顯示為只讀（如果需要編輯可改成 input） */}
                    <input value={user.total_carbon_footprint} disabled />
                  </div>
                </div>
              )}
            </div>

            {/* 最近訂單記錄區塊 */}
            <div className="detail-section">
              <h4>最近訂單記錄</h4>
              {user.orders && user.orders.length > 0 ? (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>訂單ID</th>
                      <th>開始時間</th>
                      <th>結束時間</th>
                      <th>站點</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.slice(0, 5).map((order) => (
                      <tr key={order.order_ID}>
                        <td>{order.order_ID}</td>
                        {/* start_date 為資料庫回傳的開始時間，轉成使用者閱讀格式 */}
                        <td>{new Date(order.start_date).toLocaleString()}</td>

                        {/* end 可能在 DB 為 end 或 end_date；先檢查兩個欄位，若為 null/undefined 則顯示空白（執行中） */}
                        <td>
                          {(() => {
                            // 支援 order.end（資料庫欄位名）與 order.end_date（前端其他命名）
                            const endRaw = order.end ?? order.end_date ?? null;
                            if (!endRaw) return ""; // 若要顯示短破折號，改成 return '-';
                            const d = new Date(endRaw);
                            // 檢查是否為有效時間
                            return isNaN(d.getTime()) ? "" : d.toLocaleString();
                          })()}
                        </td>

                        <td>{order.site_name}</td>

                        {/* 顯示訂單狀態 badge（根據 order_status 或文字值） */}
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