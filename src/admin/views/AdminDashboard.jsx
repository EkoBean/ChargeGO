import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { dashboardStats, loading, error, loadAllData } = useAdminData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  return (
    <div className="dashboard-content">
      <h2>系統總覽</h2>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{dashboardStats.totalUsers}</h3>
            <p>註冊用戶</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <h3>{dashboardStats.totalSites}</h3>
            <p>服務站點</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔋</div>
          <div className="stat-info">
            <h3>{dashboardStats.activeChargers}</h3>
            <p>可用充電器</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{dashboardStats.todayOrders}</h3>
            <p>點數商城訂單</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>系統狀態監控</h3>
          <div className="status-grid">
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "85%" }}></div>
              </div>
              <span>系統運行狀態 85%</span>
            </div>
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill warning" style={{ width: "72%" }}></div>
              </div>
              <span>設備使用率 72%</span>
            </div>
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill info" style={{ width: "91%" }}></div>
              </div>
              <span>用戶滿意度 91%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>快速操作</h3>
          <div className="quick-actions">
            <button className="action-btn primary" onClick={() => navigate('/users')}>
              👥 用戶管理
            </button>
            <button className="action-btn success" onClick={() => navigate('/sites')}>
              📍 站點管理
            </button>
            <button className="action-btn warning" onClick={() => navigate('/orders')}>
              🛒 點數商城訂單
            </button>
            <button className="action-btn info" onClick={loadAllData}>
              🔄 刷新數據
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;