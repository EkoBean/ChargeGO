import React, { useState } from "react";
import { useAdminData } from "../context/AdminDataContext";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import UserDetailModal from "../components/modals/UserDetailModal";
import ApiService from "../services/api";

// 後台「用戶管理」頁面的 React 元件
// 功能：列出所有使用者，開啟單一使用者詳細視窗並可觸發編輯/儲存
const UserManagement = () => {
  // 從 AdminDataContext 取得全域資料與操作方法
  const { users, setUsers, loading, error, loadAllData } = useAdminData();

  // 本地 state：
  // selectedUser: 當前檢視的使用者（包含 orders）
  // showUserModal: 是否顯示詳細 modal
  // isEditingUser: modal 是否處於編輯模式
  // editUser: 編輯時的暫存資料（避免直接改到 selectedUser）
  // saving: 是否正在儲存（用來disable關閉/按鈕）
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // handleViewUser:
  // - 取得該使用者的訂單（ApiService.getUserOrders）
  // - 將訂單合併到 user 物件，並 setSelectedUser / setEditUser（顯示 modal）
  const handleViewUser = async (user) => {
    try {
      const userOrders = await ApiService.getUserOrders(user.uid);
      // merged 包含使用者基本資料 + 取回的 orders
      const merged = { ...user, orders: userOrders };
      setSelectedUser(merged);
      // editUser 先同步成 merged，避免 editUser 為 null 時 input 顯示空白
      setEditUser(merged);
      setIsEditingUser(false);
      setShowUserModal(true);
    } catch (err) {
      // 基本錯誤處理，實務可改成 toaster 或 UI 顯示
      console.error("Failed to load user orders:", err);
    }
  };

  // handleUserFieldChange:
  // - 通用 input change handler，支援 checkbox（使用 checked）與其他 input（使用 value）
  // - 將變更寫入 editUser 的對應欄位（不直接修改 selectedUser）
  const handleUserFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // handleSaveUser:
  // - 組成 payload（從 editUser 取值）
  // - 呼叫 ApiService.updateUser，成功後更新 global users 與 local selectedUser/editUser
  // - 失敗時 log 並跳 alert，finally 關閉 saving flag
  const handleSaveUser = async () => {
    if (!editUser) return;
    try {
      setSaving(true);
      const payload = {
        user_name: editUser.user_name,
        email: editUser.email,
        telephone: editUser.telephone,
        address: editUser.address,
        wallet: Number(editUser.wallet ?? 0),
        point: Number(editUser.point ?? 0),
        blacklist: Boolean(editUser.blacklist),
      };
      const updated = await ApiService.updateUser(editUser.uid, payload);

      // 更新 users 列表中的該筆使用者
      setUsers((prev) =>
        prev.map((u) => (u.uid === updated.uid ? { ...u, ...updated } : u))
      );

      // 更新 modal 顯示的 selectedUser 與 editUser
      const merged = { ...selectedUser, ...updated };
      setSelectedUser(merged);
      setEditUser(merged);
      setIsEditingUser(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("更新失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  // loading / error handling：依據 context 展示 loading 或錯誤畫面
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  // 主畫面：顯示使用者表格，點「查看詳情」會呼叫 handleViewUser 開 modal
  return (
    <div className="users-content">
      <div className="content-header">
        <h2>用戶管理</h2>
        <button className="btn primary" onClick={loadAllData}>
          🔄 刷新資料
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>用戶ID</th>
              <th>姓名</th>
              <th>Email</th>
              <th>電話</th>
              <th>錢包餘額</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.user_name}</td>
                <td>{user.email}</td>
                <td>{user.telephone}</td>
                <td>NT$ {user.wallet}</td>
                <td>
                  {/* 顯示黑名單或正常 badge */}
                  <span
                    className={`badge ${
                      user.blacklist ? "danger" : "success"
                    }`}
                  >
                    {user.blacklist ? "黑名單" : "正常"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn small primary"
                    onClick={() => handleViewUser(user)}
                  >
                    查看詳情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UserDetailModal: 傳入 selectedUser, editUser 與各種 handler */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          editUser={editUser}
          isEditing={isEditingUser}
          saving={saving}
          // disablePersonalEditing = true 會讓姓名/Email/電話/地址在編輯時被鎖住
          disablePersonalEditing={true}
          onEdit={() => {
            // debug: 檢查 selectedUser 與 editUser 在按編輯時的狀態
            console.log('onEdit clicked', { selectedUser, editUser });
            // 確保編輯時有資料在 editUser（避免受控 input 為 undefined）
            setEditUser(selectedUser);
            setIsEditingUser(true);
          }}
          onCancel={() => {
            // 取消編輯：把 editUser 回復為 selectedUser 的最新資料，並關閉編輯模式
            setEditUser(selectedUser);
            setIsEditingUser(false);
          }}
          onSave={handleSaveUser}
          onChange={handleUserFieldChange}
          onClose={() => !saving && setShowUserModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
