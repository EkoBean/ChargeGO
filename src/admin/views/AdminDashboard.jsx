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
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // 站點 Modal 狀態
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [isEditingSite, setIsEditingSite] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [creatingSite, setCreatingSite] = useState(false);

  // 訂單 Modal 狀態
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSiteChargers, setOrderSiteChargers] = useState([]);

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

  // 當選定站點變更時載入該站點充電器
  useEffect(() => {
    const siteId = editOrder?.site_id;
    if (!showOrderModal || !siteId) { setOrderSiteChargers([]); return; }
    ApiService.getSiteChargers(siteId).then(setOrderSiteChargers).catch(() => setOrderSiteChargers([]));
  }, [showOrderModal, editOrder?.site_id]);

  // === 用戶 ===
  const handleViewUser = async (user) => {
    try {
      const userOrders = await ApiService.getUserOrders(user.uid);
      const merged = { ...user, orders: userOrders };
      setSelectedUser(merged);
      setEditUser(merged);
      setIsEditingUser(false);
      setShowUserModal(true);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    }
  };

  const handleUserFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        blacklist: Boolean(editUser.blacklist)
      };
      const updated = await ApiService.updateUser(editUser.uid, payload);
      setUsers(prev => prev.map(u => (u.uid === updated.uid ? { ...u, ...updated } : u)));
      const merged = { ...selectedUser, ...updated };
      setSelectedUser(merged);
      setEditUser(merged);
      setIsEditingUser(false);
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('更新失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // === 站點 ===
  const handleViewSite = async (site) => {
    // 可選：若需要即時充電器列表，可呼叫 ApiService.getSiteChargers(site.site_id)
    setSelectedSite(site);
    setEditSite(site);
    setIsEditingSite(false);
    setCreatingSite(false);
    setShowSiteModal(true);
  };

  const handleAddSite = () => {
    const blank = { site_name: '', address: '' };
    setSelectedSite(blank);
    setEditSite(blank);
    setIsEditingSite(true);
    setCreatingSite(true);
    setShowSiteModal(true);
  };

  const handleSiteFieldChange = (e) => {
    const { name, value } = e.target;
    setEditSite(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSite = async () => {
    if (!editSite) return;
    try {
      setSaving(true);
      const payload = { site_name: editSite.site_name, address: editSite.address };
      if (creatingSite || !editSite.site_id) {
        const created = await ApiService.createSite(payload);
        setSites(prev => [...prev, created]);
        setSelectedSite(created);
        setEditSite(created);
        setCreatingSite(false);
      } else {
        const updated = await ApiService.updateSite(editSite.site_id, payload);
        setSites(prev => prev.map(s => (s.site_id === updated.site_id ? { ...s, ...updated } : s)));
        setSelectedSite(updated);
        setEditSite(updated);
      }
      setIsEditingSite(false);
    } catch (err) {
      console.error('Failed to save site:', err);
      alert('站點儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // === 訂單 ===
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setEditOrder(order);
    setIsEditingOrder(false);
    setCreatingOrder(false);
    setShowOrderModal(true);
  };

  const handleOrderFieldChange = (e) => {
    const { name, value } = e.target;
    setEditOrder(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'site_id') {
        // 切換站點時清空/預選 charger
        next.charger_id = '';
      }
      return next;
    });
  };

  const handleAddOrder = () => {
    const defaultSite = sites[0]?.site_id || '';
    const blank = { uid: '', site_id: defaultSite, order_status: 'active', charger_id: '' };
    setSelectedOrder(blank);
    setEditOrder(blank);
    setIsEditingOrder(true);
    setCreatingOrder(true);
    setShowOrderModal(true);
  };

  const handleSaveOrder = async () => {
    if (!editOrder) return;
    try {
      setSaving(true);
      if (creatingOrder || !editOrder.order_ID) {
        const payload = {
          uid: editOrder.uid,
          site_id: Number(editOrder.site_id),
          charger_id: Number(editOrder.charger_id) || undefined,
          order_status: editOrder.order_status || 'active',
        };
        await ApiService.createOrder(payload);
        await loadAllData();
        setIsEditingOrder(false);
        setCreatingOrder(false);
        setShowOrderModal(false);
      } else {
        const payload = {
          site_id: Number(editOrder.site_id),
          charger_id: Number(editOrder.charger_id) || undefined,
          order_status: editOrder.order_status,
        };
        await ApiService.updateOrder(editOrder.order_ID, payload);
        await loadAllData();
        setIsEditingOrder(false);
      }
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('訂單儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
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
        <div>
          <button className="btn" onClick={loadAllData}>🔄 刷新資料</button>
          <button className="btn primary" onClick={handleAddSite} style={{ marginLeft: 8 }}>➕ 新增站點</button>
        </div>
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
                    <button className="btn small primary" onClick={() => handleViewSite(site)}>
                      查看詳情
                    </button>
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
        <div>
          <button className="btn" onClick={loadAllData}>🔄 刷新資料</button>
          <button className="btn primary" onClick={handleAddOrder} style={{ marginLeft: 8 }}>➕ 新增訂單</button>
        </div>
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
                  <button className="btn small primary" onClick={() => handleViewOrder(order)}>
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
        <div
          className="modal-overlay"
          onClick={() => !saving && setShowUserModal(false)}
        >
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>用戶詳情 - {selectedUser.user_name}</h3>
              <div>
                {!isEditingUser ? (
                  <button
                    className="btn small primary"
                    onClick={() => setIsEditingUser(true)}
                  >
                    編輯
                  </button>
                ) : (
                  <>
                    <button
                      className="btn small"
                      onClick={() => {
                        setEditUser(selectedUser);
                        setIsEditingUser(false);
                      }}
                      disabled={saving}
                    >
                      取消
                    </button>
                    <button
                      className="btn small primary"
                      onClick={handleSaveUser}
                      disabled={saving}
                    >
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                  </>
                )}
                <button
                  className="close-btn"
                  onClick={() => !saving && setShowUserModal(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="user-details">
                <div className="detail-section">
                  <h4>基本資料</h4>

                  {!isEditingUser ? (
                    <>
                      <p><strong>用戶ID:</strong> {selectedUser.uid}</p>
                      <p><strong>姓名:</strong> {selectedUser.user_name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>電話:</strong> {selectedUser.telephone}</p>
                      <p><strong>地址:</strong> {selectedUser.address}</p>
                    </>
                  ) : (
                    <div className="form-grid">
                      <div className="form-group">
                        <label>用戶ID</label>
                        <input value={selectedUser.uid} disabled />
                      </div>
                      <div className="form-group">
                        <label>姓名</label>
                        <input
                          name="user_name"
                          value={editUser?.user_name || ''}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editUser?.email || ''}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>電話</label>
                        <input
                          name="telephone"
                          value={editUser?.telephone || ''}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                      <div className="form-group form-col-2">
                        <label>地址</label>
                        <input
                          name="address"
                          value={editUser?.address || ''}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>帳戶資訊</h4>

                  {!isEditingUser ? (
                    <>
                      <p><strong>錢包餘額:</strong> NT$ {selectedUser.wallet}</p>
                      <p><strong>點數:</strong> {selectedUser.point}</p>
                      <p>
                        <strong>狀態:</strong>
                        <span className={`badge ${selectedUser.blacklist ? 'danger' : 'success'}`}>
                          {selectedUser.blacklist ? '黑名單' : '正常'}
                        </span>
                      </p>
                      <p><strong>碳足跡:</strong> {selectedUser.total_carbon_footprint}</p>
                    </>
                  ) : (
                    <div className="form-grid">
                      <div className="form-group">
                        <label>錢包餘額</label>
                        <input
                          type="number"
                          name="wallet"
                          step="1"
                          value={editUser?.wallet ?? 0}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>點數</label>
                        <input
                          type="number"
                          name="point"
                          step="1"
                          value={editUser?.point ?? 0}
                          onChange={handleUserFieldChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            name="blacklist"
                            checked={!!editUser?.blacklist}
                            onChange={handleUserFieldChange}
                          />
                          黑名單
                        </label>
                      </div>
                      <div className="form-group">
                        <label>碳足跡</label>
                        <input value={selectedUser.total_carbon_footprint} disabled />
                      </div>
                    </div>
                  )}
                </div>

                {/* 最近訂單記錄維持唯讀 */}
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

      {/* 站點詳情/新增 Modal */}
      {showSiteModal && selectedSite && (
        <div className="modal-overlay" onClick={() => !saving && setShowSiteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{creatingSite ? '新增站點' : `站點詳情 - ${selectedSite.site_name || ''}`}</h3>
              <div>
                {!isEditingSite ? (
                  <button className="btn small primary" onClick={() => setIsEditingSite(true)}>
                    編輯
                  </button>
                ) : (
                  <>
                    <button
                      className="btn small"
                      onClick={() => {
                        setEditSite(selectedSite);
                        setIsEditingSite(false);
                        setCreatingSite(false);
                      }}
                      disabled={saving}
                    >
                      取消
                    </button>
                    <button className="btn small primary" onClick={handleSaveSite} disabled={saving}>
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                  </>
                )}
                <button className="close-btn" onClick={() => !saving && setShowSiteModal(false)}>×</button>
              </div>
            </div>
            <div className="modal-body">
              {!isEditingSite ? (
                <div className="user-details">
                  <div className="detail-section">
                    <h4>站點資料</h4>
                    {selectedSite.site_id && <p><strong>ID:</strong> {selectedSite.site_id}</p>}
                    <p><strong>名稱:</strong> {selectedSite.site_name}</p>
                    <p><strong>地址:</strong> {selectedSite.address}</p>
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  {selectedSite.site_id && (
                    <div className="form-group">
                      <label>站點ID</label>
                      <input value={selectedSite.site_id} disabled />
                    </div>
                  )}
                  <div className="form-group">
                    <label>站點名稱</label>
                    <input name="site_name" value={editSite?.site_name || ''} onChange={handleSiteFieldChange} />
                  </div>
                  <div className="form-group form-col-2">
                    <label>地址</label>
                    <input name="address" value={editSite?.address || ''} onChange={handleSiteFieldChange} />
                  </div>
                  <div className="form-group">
                    <label>經度</label>
                    <input name="longitude" value={editSite?.longitude ?? ''} onChange={handleSiteFieldChange} />
                  </div>
                  <div className="form-group">
                    <label>緯度</label>
                    <input name="latitude" value={editSite?.latitude ?? ''} onChange={handleSiteFieldChange} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 訂單詳情/新增 Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => !saving && setShowOrderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{creatingOrder ? '新增訂單' : `訂單詳情 - ${selectedOrder.order_ID || ''}`}</h3>
              <div>
                {!isEditingOrder ? (
                  <button className="btn small primary" onClick={() => setIsEditingOrder(true)}>
                    編輯
                  </button>
                ) : (
                  <>
                    <button
                      className="btn small"
                      onClick={() => {
                        setEditOrder(selectedOrder);
                        setIsEditingOrder(false);
                        setCreatingOrder(false);
                      }}
                      disabled={saving}
                    >
                      取消
                    </button>
                    <button className="btn small primary" onClick={handleSaveOrder} disabled={saving}>
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                  </>
                )}
                <button className="close-btn" onClick={() => !saving && setShowOrderModal(false)}>×</button>
              </div>
            </div>
            <div className="modal-body">
              {!isEditingOrder ? (
                <div className="user-details">
                  <div className="detail-section">
                    <h4>訂單資料</h4>
                    {selectedOrder.order_ID && <p><strong>ID:</strong> {selectedOrder.order_ID}</p>}
                    <p><strong>用戶:</strong> {selectedOrder.user_name || selectedOrder.uid}</p>
                    <p><strong>站點:</strong> {selectedOrder.site_name || selectedOrder.site_id}</p>
                    <p><strong>開始時間:</strong> {selectedOrder.start_date ? new Date(selectedOrder.start_date).toLocaleString() : '-'}</p>
                    <p>
                      <strong>狀態:</strong>
                      <span className={`badge ${
                        selectedOrder.order_status === 'completed' ? 'success' :
                        selectedOrder.order_status === 'active' ? 'warning' : 'danger'
                      }`}>
                        {selectedOrder.order_status}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  {!creatingOrder && selectedOrder.order_ID && (
                    <div className="form-group">
                      <label>訂單ID</label>
                      <input value={selectedOrder.order_ID} disabled />
                    </div>
                  )}
                  <div className="form-group">
                    <label>用戶UID</label>
                    <input
                      name="uid"
                      value={editOrder?.uid || ''}
                      onChange={handleOrderFieldChange}
                      disabled={!creatingOrder}
                    />
                  </div>
                  <div className="form-group">
                    <label>站點</label>
                    <select name="site_id" value={editOrder?.site_id ?? ''} onChange={handleOrderFieldChange}>
                      <option value="" disabled>請選擇站點</option>
                      {sites.map(s => (
                        <option key={s.site_id} value={s.site_id}>{s.site_name} ({s.site_id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>充電器</label>
                    <select
                      name="charger_id"
                      value={editOrder?.charger_id ?? ''}
                      onChange={handleOrderFieldChange}
                    >
                      <option value="" disabled>請選擇充電器</option>
                      {orderSiteChargers.map(c => (
                        <option key={c.charger_id} value={c.charger_id}>
                          #{c.charger_id}（{c.status}）
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>狀態</label>
                    <select name="order_status" value={editOrder?.order_status || 'active'} onChange={handleOrderFieldChange}>
                      <option value="active">active</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
