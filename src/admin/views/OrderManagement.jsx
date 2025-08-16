import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

// 訂單管理頁面
const OrderManagement = () => {
  // 狀態管理：訂單資料、載入狀態、錯誤訊息、搜尋字串、狀態篩選
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 元件掛載時自動載入訂單資料
  useEffect(() => {
    loadOrders();
  }, []);

  // 從 API 載入訂單資料
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await ApiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('載入訂單資料失敗');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // 根據訂單狀態回傳不同顏色的 Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">已完成</Badge>;
      case 'active':
        return <Badge bg="warning">進行中</Badge>;
      case 'cancelled':
        return <Badge bg="danger">已取消</Badge>;
      default:
        return <Badge bg="secondary">未知</Badge>;
    }
  };

  // 根據搜尋字串和狀態篩選訂單
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_ID.toString().includes(searchTerm) ||
                         order.site_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 訂單統計資料
  const orderStats = {
    total: orders.length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    active: orders.filter(o => o.order_status === 'active').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length
  };

  // 載入中顯示 Spinner
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
        <p className="mt-3">載入訂單資料中...</p>
      </div>
    );
  }

  // 載入失敗顯示錯誤訊息
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>載入錯誤</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={loadOrders}>
          重新載入
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      {/* 頁面標題與刷新按鈕 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>訂單管理</h2>
        <Button variant="outline-primary" onClick={loadOrders}>
          <i className="fas fa-sync-alt me-2"></i>刷新資料
        </Button>
      </div>

      {/* 統計卡片：顯示訂單總數、各狀態數量 */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-primary">{orderStats.total}</h3>
              <p className="mb-0">總訂單數</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-success">{orderStats.completed}</h3>
              <p className="mb-0">已完成</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-warning">{orderStats.active}</h3>
              <p className="mb-0">進行中</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-danger">{orderStats.cancelled}</h3>
              <p className="mb-0">已取消</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 訂單列表卡片：搜尋、狀態篩選、訂單表格 */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col md={4}>
              <h5 className="mb-0">訂單列表 ({filteredOrders.length})</h5>
            </Col>
            <Col md={4}>
              {/* 搜尋框：可依訂單ID、用戶、站點搜尋 */}
              <Form.Control
                type="text"
                placeholder="搜尋訂單ID、用戶或站點..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              {/* 狀態篩選下拉選單 */}
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">所有狀態</option>
                <option value="completed">已完成</option>
                <option value="active">進行中</option>
                <option value="cancelled">已取消</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>訂單ID</th>
                  <th>用戶</th>
                  <th>聯絡方式</th>
                  <th>站點</th>
                  <th>充電器</th>
                  <th>開始時間</th>
                  <th>結束時間</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {/* 依篩選結果顯示訂單資料 */}
                {filteredOrders.map(order => (
                  <tr key={order.order_ID}>
                    <td>{order.order_ID}</td>
                    <td>{order.user_name}</td>
                    <td>
                      <div>
                        <small className="text-muted">{order.telephone}</small>
                        <br />
                        <small className="text-muted">{order.email}</small>
                      </div>
                    </td>
                    <td>{order.site_name}</td>
                    <td>{order.charger_id}</td>
                    <td>{new Date(order.start_date).toLocaleString()}</td>
                    <td>{order.end ? new Date(order.end).toLocaleString() : '-'}</td>
                    <td>{getStatusBadge(order.order_status)}</td>
                    <td>
                      <Button variant="outline-primary" size="sm">
                        查看詳情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderManagement;
