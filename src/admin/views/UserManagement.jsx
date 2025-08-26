import React, { useState } from "react";
import { useAdminData } from "../context/AdminDataContext";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import UserDetailModal from "../components/modals/UserDetailModal";
import ApiService from "../services/api";

const UserManagement = () => {
  const { users, setUsers, loading, error, loadAllData } = useAdminData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleViewUser = async (user) => {
    try {
      const userOrders = await ApiService.getUserOrders(user.uid);
      const merged = { ...user, orders: userOrders };
      setSelectedUser(merged);
      setEditUser(merged);
      setIsEditingUser(false);
      setShowUserModal(true);
    } catch (err) {
      console.error("Failed to load user orders:", err);
    }
  };

  const handleUserFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
      setUsers((prev) =>
        prev.map((u) => (u.uid === updated.uid ? { ...u, ...updated } : u))
      );
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

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

      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          editUser={editUser}
          isEditing={isEditingUser}
          saving={saving}
          onEdit={() => setIsEditingUser(true)}
          onCancel={() => {
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
