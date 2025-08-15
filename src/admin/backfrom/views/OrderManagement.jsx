import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_ID.toString().includes(searchTerm) ||
                         order.site_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    active: orders.filter(o => o.order_status === 'active').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>訂單管理</h2>
        <Button variant="outline-primary" onClick={loadOrders}>
          <i className="fas fa-sync-alt me-2"></i>刷新資料
        </Button>
      </div>

      {/* 統計卡片 */}
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

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col md={4}>
              <h5 className="mb-0">訂單列表 ({filteredOrders.length})</h5>
            </Col>
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="搜尋訂單ID、用戶或站點..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
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
