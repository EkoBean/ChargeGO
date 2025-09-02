import React, { useState, useMemo } from "react";
import { useAdminData } from "../context/AdminDataContext";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import UserDetailModal from "../components/modals/UserDetailModal";
import ApiService from "../services/api";

/**
 * 用戶管理頁 (Admin)
 *
 * 新增：
 * - 搜尋框：可搜尋 用戶ID / 姓名 / Email / 電話
 * - 狀態下拉：篩選 使用者狀態（全部 / 正常 / 黑名單）
 */

const UserManagement = () => {
  const { users, sites, setUsers, loading, error, loadAllData } = useAdminData(); // ← 取得資料庫order_record 的個人資料

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // 新增：搜尋與狀態篩選
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // values: all | normal | blacklist

  /**
   * handleViewUser
   * - 當使用者按下「查看詳情」時呼叫
   * - 取得該使用者的訂單 (ApiService.getUserOrders) 並合併到 selectedUser
   * - 將 editUser 初始化為 selectedUser 的複本，進入非編輯模式（modal 開啟）
   */
  const handleViewUser = async (user) => {
    try {
      const userOrders = await ApiService.getUserOrders(user.uid);
      const merged = { ...user, orders: userOrders };
      setSelectedUser(merged);
      // editUser 使用 merged 的複本，確保 input 為受控元件
      setEditUser(merged);
      setIsEditingUser(false);
      setShowUserModal(true);
    } catch (err) {
      // 簡單錯誤處理：記錄錯誤（可改成 toaster 提示）
      console.error("Failed to load user orders:", err);
    }
  };

  /**
   * handleUserFieldChange
   * - 通用欄位變更處理器，支援 checkbox 與其他 input
   * - 將變更寫入 editUser（暫存），不直接修改 selectedUser
   */
  const handleUserFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * handleSaveUser
   * - 從 editUser 組成 payload，呼叫 ApiService.updateUser 更新後端
   * - 成功後更新全域 users 與 modal 中的 selectedUser / editUser
   * - saving flag 防止重複提交
   */
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

      // 更新全域使用者清單中對應項目（保持引用不被直接操作）
      setUsers((prev) =>
        prev.map((u) => (u.uid === updated.uid ? { ...u, ...updated } : u))
      );

      // 更新 modal 顯示資料與編輯暫存
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

  // 計算篩選後的 users
  const filteredUsers = useMemo(() => {
    const q = String(searchQ || "").trim().toLowerCase();
    return (users || []).filter((u) => {
      // 狀態篩選
      if (statusFilter === "normal" && u.blacklist) return false;
      if (statusFilter === "blacklist" && !u.blacklist) return false;

      if (!q) return true;

      // 可搜尋欄位：uid, user_name, email, telephone
      const uid = String(u.uid ?? "").toLowerCase();
      const name = String(u.user_name ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const tel = String(u.telephone ?? "").toLowerCase();

      return (
        uid.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        tel.includes(q)
      );
    });
  }, [users, searchQ, statusFilter]);

  // 若 Context 還在 loading 或發生錯誤，顯示對應畫面
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  // 主畫面：使用者表格 + 刷新按鈕 + detail modal
  return (
    <div className="users-content">
      <div className="content-header" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>用戶管理</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input
            type="text"
            placeholder="搜尋：用戶ID / 姓名 / Email / 電話"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 8 }}
            title="依狀態篩選"
          >
            <option value="all">全部狀態</option>
            <option value="normal">正常</option>
            <option value="blacklist">黑名單</option>
          </select>

          <button className="btn primary" onClick={loadAllData}>
            🔄 刷新資料
          </button>
        </div>
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
            {filteredUsers.map((user) => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.user_name}</td>
                <td>{user.email}</td>
                <td>{user.telephone}</td>
                <td>NT$ {user.wallet}</td>
                <td>
                  <span className={`badge ${user.blacklist ? "danger" : "success"}`}>
                    {user.blacklist ? "黑名單" : "正常"}
                  </span>
                </td>
                <td>
                  <button className="btn small primary" onClick={() => handleViewUser(user)}>
                    查看詳情
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 12 }}>查無符合條件的用戶</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginBottom: 8, color: "#666" }}>
        顯示 {filteredUsers.length} / {users.length} 筆
      </div>

      {/* UserDetailModal：將 modal 所需狀態與 handler 傳入 */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          editUser={editUser}
          isEditing={isEditingUser}
          saving={saving}
          disablePersonalEditing={true}
          onEdit={() => {
            // 進入編輯模式時，確保 editUser 已初始化為 selectedUser 的複本
            setEditUser(selectedUser);
            setIsEditingUser(true);
          }}
          onCancel={() => {
            // 取消編輯：還原 editUser 為 selectedUser 的最新資料，關閉編輯模式
            setEditUser(selectedUser);
            setIsEditingUser(false);
          }}
          onSave={handleSaveUser}
          onChange={handleUserFieldChange}
          onClose={() => !saving && setShowUserModal(false)}
          sites={sites} // ← 傳入 sites
        />
      )}
    </div>
  );
};

export default UserManagement;
