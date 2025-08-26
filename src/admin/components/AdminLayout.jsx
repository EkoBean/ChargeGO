import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminLayout = () => {
  return (
    <div className="admin-dashboard">
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="nav-icon">⚙️</span>
          行動電源租借系統 - 後台管理
        </div>
        <div className="nav-user">
          <span>👤 系統管理員</span>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <NavLink 
              to="/" 
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
              🛒 訂單管理
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            >
              ⚙️ 系統設定
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;