//後台管理系統的整體頁面結構
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ApiService from '../services/api';
import '../../styles/scss/adminstyle/AdminDashboard.scss';

const AdminLayout = ({ children, onLogout }) => {
  const employeeName = localStorage.getItem('employeeName') || '系統管理員';

  // 修改 handleLogout 函數
  const handleLogout = async () => {
    try {
      // 先記錄登出操作
      await ApiService.logout();
      
      // 清除本地儲存的資訊
      localStorage.removeItem('employeeName');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('loginTime');
      
      // 通知父組件
      onLogout();
      
      // 修正：導向到正確的登入頁面
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('登出失敗:', error);
      
      // 即使記錄失敗，也要清除本地儲存並登出
      localStorage.removeItem('employeeName');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('loginTime');
      
      onLogout();
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-top-nav">
        <div className="admin-nav-brand">
          <span className="admin-nav-icon">⚙️</span>
          行動電源租借系統 - 後台管理
        </div>
        <div className="admin-nav-user">
          <span>👤 {employeeName}</span>
          <button className="admin-logout-btn" onClick={handleLogout}>
            🚪 登出
          </button>
        </div>
      </nav>

      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav">
            <NavLink 
              to="/admin/dashboard" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📊 總覽
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              👥 用戶管理
            </NavLink>
            <NavLink 
              to="/admin/sites" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📍 站點管理
            </NavLink>
            <NavLink 
              to="/admin/orders" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              🛒 租借紀錄
            </NavLink>
            <NavLink 
              to="/admin/events" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📣 活動發送
            </NavLink>
            <NavLink 
              to="/admin/employee-log" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              🧾 職員操作紀錄
            </NavLink>
            <NavLink 
              to="/admin/tasks" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              ✅ 任務管理
            </NavLink>
          </nav>
        </aside>

        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;