//後台管理系統的整體頁面結構
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminLayout = ({ children, onLogout }) => {
  
  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      onLogout();
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="nav-icon">⚙️</span>
          行動電源租借系統 - 後台管理
        </div>
        <div className="nav-user">
          <span>👤 系統管理員</span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 登出
          </button>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              📊 總覽
            </NavLink>
            <NavLink 
              to="/users" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              👥 用戶管理
            </NavLink>
            <NavLink 
              to="/sites" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              📍 站點管理
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              🛒 點數商城訂單
            </NavLink>
            <NavLink 
              to="/events" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              📣 活動發送
            </NavLink>
            <NavLink 
              to="/employee-log" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              🧾 職員操作紀錄
            </NavLink>
            <NavLink 
              to="/tasks" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              ✅ 任務管理
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;