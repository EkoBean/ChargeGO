import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
//後台「總覽」頁面的 React 元件，負責顯示儀表板統計、系統狀態與快速操作按鈕
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { dashboardStats, loading, error, loadAllData } = useAdminData();

  // 新增系統狀態監控資料
  const [systemStatus, setSystemStatus] = useState({
    systemStatus: 0,
    deviceUsage: 0,
    orderCompletion: 0,
  });

  useEffect(() => {
    // 載入系統狀態監控資料
    import('../services/api').then(({ default: ApiService }) => {
      ApiService.getSystemStatus().then(setSystemStatus);
    });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  return (
    <div className="admin-dashboard-content">
      <h2>系統總覽</h2>

      <div className="admin-stats-grid">
        <div className="admin-stat-card admin-primary" onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <h3>{dashboardStats.totalUsers}</h3>
            <p>註冊用戶</p>
          </div>
        </div>

        <div className="admin-stat-card admin-success" onClick={() => navigate('/sites')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon">📍</div>
          <div className="admin-stat-info">
            <h3>{dashboardStats.totalSites}</h3>
            <p>服務站點</p>
          </div>
        </div>

        <div className="admin-stat-card admin-warning" onClick={() => navigate('/sites')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon">🔋</div>
          <div className="admin-stat-info">
            <h3>{dashboardStats.activeChargers}</h3>
            <p>可用充電器</p>
          </div>
        </div>

        <div className="admin-stat-card admin-info" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon">🛒</div>
          <div className="admin-stat-info">
            <h3>{dashboardStats.todayOrders}</h3>
            <p>點數商城訂單</p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card">
          <h3>系統狀態監控</h3>
          <div className="admin-status-grid">
            <div className="admin-status-item">
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill"
                  style={{ width: `${Math.round(systemStatus.systemStatus * 100)}%` }}
                ></div>
              </div>
              <span>站點可用率 {Math.round(systemStatus.systemStatus * 100)}%</span>
            </div>
            <div className="admin-status-item">
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill admin-warning"
                  style={{ width: `${Math.round(systemStatus.deviceUsage * 100)}%` }}
                ></div>
              </div>
              <span>設備使用率 {Math.round(systemStatus.deviceUsage * 100)}%</span>
            </div>
            <div className="admin-status-item">
              <div className="admin-progress-bar">
                <div
                  className="admin-progress-fill admin-info"
                  style={{ width: `${Math.round(systemStatus.orderCompletion * 100)}%` }}
                ></div>
              </div>
              <span>訂單完成率 {Math.round(systemStatus.orderCompletion * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-card">
          <h3>快速操作</h3>
          <div className="admin-quick-actions">
            <button className="admin-action-btn admin-btn-blue" onClick={() => navigate('/users')}>
              👥 用戶管理
            </button>
            <button className="admin-action-btn admin-btn-green" onClick={() => navigate('/sites')}>
              📍 站點管理
            </button>
            <button className="admin-action-btn admin-btn-orange" onClick={() => navigate('/orders')}>
              🛒 點數商城訂單
            </button>
            <button className="admin-action-btn admin-btn-purple" onClick={() => navigate('/events')}>
              🎉 活動發送
            </button>
            <button className="admin-action-btn admin-btn-teal" onClick={() => navigate('/employee-log')}>
              📝 職員操作紀錄
            </button>
            <button className="admin-action-btn admin-btn-pink" onClick={() => navigate('/tasks')}>
              📋 任務管理
            </button>
            <button
              className="admin-action-btn admin-btn-gray admin-btn-large"
              onClick={loadAllData}
              style={{ gridColumn: "span 2" }}
            >
              🔄 刷新數據
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;