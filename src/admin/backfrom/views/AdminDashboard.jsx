import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalChargers: 0,
    activeChargers: 0,
    todayOrders: 0,
    revenue: 0
  });
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, usersData, sitesData, chargersData, ordersData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getUsers(),
        ApiService.getSites(),
        ApiService.getChargers(),
        ApiService.getOrders()
      ]);

      setDashboardStats(statsData);
      setUsers(usersData);
      setSites(sitesData);
      setChargers(chargersData);
      setOrders(ordersData);
    } catch (err) {
      setError('載入資料失敗，請稍後再試');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const userOrders = await ApiService.getUserOrders(user.uid);
      setSelectedUser({ ...user, orders: userOrders });
      setShowUserModal(true);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    }
  };

  const renderDashboard = () => (
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
            <p>今日訂單</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>系統狀態監控</h3>
          <div className="status-grid">
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '85%'}}></div>
              </div>
              <span>系統運行狀態 85%</span>
            </div>
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill warning" style={{width: '72%'}}></div>
              </div>
              <span>設備使用率 72%</span>
            </div>
            <div className="status-item">
              <div className="progress-bar">
                <div className="progress-fill info" style={{width: '91%'}}></div>
              </div>
              <span>用戶滿意度 91%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>快速操作</h3>
          <div className="quick-actions">
            <button className="action-btn primary" onClick={() => setActiveTab('users')}>
              👥 用戶管理
            </button>
            <button className="action-btn success" onClick={() => setActiveTab('sites')}>
              📍 站點管理
            </button>
            <button className="action-btn warning" onClick={() => setActiveTab('orders')}>
              🛒 訂單管理
            </button>
            <button className="action-btn info" onClick={loadAllData}>
              🔄 刷新數據
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
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
            {users.map(user => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.user_name}</td>
                <td>{user.email}</td>
                <td>{user.telephone}</td>
                <td>NT$ {user.wallet}</td>
                <td>
                  <span className={`badge ${user.blacklist ? 'danger' : 'success'}`}>
                    {user.blacklist ? '黑名單' : '正常'}
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
    </div>
  );

  const renderSites = () => (
    <div className="sites-content">
      <div className="content-header">
        <h2>站點管理</h2>
        <button className="btn primary" onClick={loadAllData}>
          🔄 刷新資料
        </button>
      </div>

      <div className="stats-row">
        <div className="mini-stat primary">
          <span className="number">{sites.length}</span>
          <span className="label">總站點數</span>
        </div>
        <div className="mini-stat success">
          <span className="number">{chargers.filter(c => c.status === 'available').length}</span>
          <span className="label">可用充電器</span>
        </div>
        <div className="mini-stat warning">
          <span className="number">{chargers.filter(c => c.status === 'occupied').length}</span>
          <span className="label">使用中</span>
        </div>
        <div className="mini-stat danger">
          <span className="number">{chargers.filter(c => c.status === 'maintenance').length}</span>
          <span className="label">維護中</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>站點ID</th>
              <th>站點名稱</th>
              <th>地址</th>
              <th>充電器數量</th>
              <th>可用數量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sites.map(site => {
              const siteChargers = chargers.filter(c => c.site_id === site.site_id);
              const availableCount = siteChargers.filter(c => c.status === 'available').length;
              
              return (
                <tr key={site.site_id}>
                  <td>{site.site_id}</td>
                  <td>{site.site_name}</td>
                  <td>{site.address}</td>
                  <td>{siteChargers.length}</td>
                  <td>
                    <span className={`badge ${availableCount > 0 ? 'success' : 'danger'}`}>
                      {availableCount}
                    </span>
                  </td>
                  <td>
                    <button className="btn small primary">查看詳情</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-content">
      <div className="content-header">
        <h2>訂單管理</h2>
        <button className="btn primary" onClick={loadAllData}>
          🔄 刷新資料
        </button>
      </div>

      <div className="stats-row">
        <div className="mini-stat primary">
          <span className="number">{orders.length}</span>
          <span className="label">總訂單數</span>
        </div>
        <div className="mini-stat success">
          <span className="number">{orders.filter(o => o.order_status === 'completed').length}</span>
          <span className="label">已完成</span>
        </div>
        <div className="mini-stat warning">
          <span className="number">{orders.filter(o => o.order_status === 'active').length}</span>
          <span className="label">進行中</span>
        </div>
        <div className="mini-stat danger">
          <span className="number">{orders.filter(o => o.order_status === 'cancelled').length}</span>
          <span className="label">已取消</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>訂單ID</th>
              <th>用戶</th>
              <th>站點</th>
              <th>開始時間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 20).map(order => (
              <tr key={order.order_ID}>
                <td>{order.order_ID}</td>
                <td>{order.user_name}</td>
                <td>{order.site_name}</td>
                <td>{new Date(order.start_date).toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    order.order_status === 'completed' ? 'success' : 
                    order.order_status === 'active' ? 'warning' : 'danger'
                  }`}>
                    {order.order_status === 'completed' ? '已完成' : 
                     order.order_status === 'active' ? '進行中' : '已取消'}
                  </span>
                </td>
                <td>
                  <button className="btn small primary">查看詳情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return renderUsers();
      case 'sites': return renderSites();
      case 'orders': return renderOrders();
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h3>載入錯誤</h3>
          <p>{error}</p>
          <button className="btn primary" onClick={loadAllData}>
            重新載入
          </button>
        </div>
      </div>
    );
  }

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
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 總覽
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 用戶管理
            </button>
            <button 
              className={`nav-item ${activeTab === 'sites' ? 'active' : ''}`}
              onClick={() => setActiveTab('sites')}
            >
              📍 站點管理
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 訂單管理
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* 用戶詳情 Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>用戶詳情 - {selectedUser.user_name}</h3>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-section">
                  <h4>基本資料</h4>
                  <p><strong>用戶ID:</strong> {selectedUser.uid}</p>
                  <p><strong>姓名:</strong> {selectedUser.user_name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>電話:</strong> {selectedUser.telephone}</p>
                  <p><strong>地址:</strong> {selectedUser.address}</p>
                </div>
                
                <div className="detail-section">
                  <h4>帳戶資訊</h4>
                  <p><strong>錢包餘額:</strong> NT$ {selectedUser.wallet}</p>
                  <p><strong>點數:</strong> {selectedUser.point}</p>
                  <p><strong>碳足跡:</strong> {selectedUser.total_carbon_footprint}</p>
                  <p>
                    <strong>狀態:</strong>
                    <span className={`badge ${selectedUser.blacklist ? 'danger' : 'success'}`}>
                      {selectedUser.blacklist ? '黑名單' : '正常'}
                    </span>
                  </p>
                </div>

                <div className="detail-section">
                  <h4>最近訂單記錄</h4>
                  {selectedUser.orders && selectedUser.orders.length > 0 ? (
                    <table className="modal-table">
                      <thead>
                        <tr>
                          <th>訂單ID</th>
                          <th>開始時間</th>
                          <th>站點</th>
                          <th>狀態</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.orders.slice(0, 5).map(order => (
                          <tr key={order.order_ID}>
                            <td>{order.order_ID}</td>
                            <td>{new Date(order.start_date).toLocaleString()}</td>
                            <td>{order.site_name}</td>
                            <td>
                              <span className={`badge ${order.order_status === 'completed' ? 'success' : 'warning'}`}>
                                {order.order_status}
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
      )}
    </div>
  );
};

export default AdminDashboard;
