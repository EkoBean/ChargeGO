//後台管理系統的整體頁面結構
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../../styles/scss/adminstyle/AdminDashboard.scss';

const AdminLayout = ({ children, onLogout }) => {
  const employeeName = localStorage.getItem('employeeName') || '系統管理員';

  const handleLogout = () => {
    localStorage.removeItem('employeeName');
    onLogout();
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
              to="/dashboard" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📊 總覽
            </NavLink>
            <NavLink 
              to="/users" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              👥 用戶管理
            </NavLink>
            <NavLink 
              to="/sites" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📍 站點管理
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              🛒 點數商城訂單
            </NavLink>
            <NavLink 
              to="/events" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              📣 活動發送
            </NavLink>
            <NavLink 
              to="/employee-log" 
              className={({isActive}) => `admin-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              🧾 職員操作紀錄
            </NavLink>
            <NavLink 
              to="/tasks" 
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