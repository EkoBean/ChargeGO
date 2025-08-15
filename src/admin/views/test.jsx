import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import ApiService from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSites: 0,
    activeChargers: 0,
    todayOrders: 0,
    registeredUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 並行獲取所有需要的資料
      const [sites, chargers, orders, users] = await Promise.all([
        ApiService.getSites(),
        ApiService.getChargers(),
        ApiService.getOrders(),
        ApiService.getUsers()
      ]);

      // 計算統計數據
      const activeChargers = chargers.filter(c => c.status === 'available').length;
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => 
        o.start_date && o.start_date.startsWith(today)
      ).length;

      setDashboardData({
        totalSites: sites.length,
        activeChargers: activeChargers,
        todayOrders: todayOrders,
        registeredUsers: users.length
      });

      // 設置最近活動（取最新的5筆訂單）
      const recentOrders = orders.slice(0, 5).map(order => ({
        time: new Date(order.start_date).toLocaleString(),
        user: order.user_name,
        activity: order.order_status === 'completed' ? '租借行動電源' : '租借中',
        status: order.order_status === 'completed' ? 'success' : 'warning',
        orderId: order.order_ID
      }));

      setRecentActivities(recentOrders);
    } catch (err) {
      setError('載入資料失敗，請稍後再試');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3" />
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>載入錯誤</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={loadDashboardData}>
            重新載入
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>儀表板</h2>
        <button className="btn btn-outline-primary" onClick={loadDashboardData}>
          <i className="fas fa-sync-alt me-2"></i>刷新資料
        </button>
      </div>

      {/* 統計卡片 */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">總站點數</h6>
                  <h2 className="card-title text-primary mb-0">{dashboardData.totalSites}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-map-marker-alt text-primary fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">活躍裝置</h6>
                  <h2 className="card-title text-success mb-0">{dashboardData.activeChargers}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="fas fa-charging-station text-success fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">今日訂單</h6>
                  <h2 className="card-title text-warning mb-0">{dashboardData.todayOrders}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="fas fa-shopping-cart text-warning fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">註冊用戶</h6>
                  <h2 className="card-title text-info mb-0">{dashboardData.registeredUsers.toLocaleString()}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="fas fa-users text-info fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 最近活動 */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">最近活動</h5>
              <button className="btn btn-sm btn-outline-primary">查看全部</button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      <th>時間</th>
                      <th>用戶</th>
                      <th>活動</th>
                      <th>狀態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.time}</td>
                          <td>{activity.user}</td>
                          <td>{activity.activity}</td>
                          <td>
                            <Badge bg={activity.status === 'success' ? 'success' : 'warning'}>
                              {activity.status === 'success' ? '成功' : '進行中'}
                            </Badge>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          暫無活動記錄
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;