import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await ApiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError('載入用戶資料失敗');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    try {
      setSelectedUser(user);
      const orders = await ApiService.getUserOrders(user.uid);
      setUserOrders(orders);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
        <p className="mt-3">載入用戶資料中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>載入錯誤</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={loadUsers}>
          重新載入
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>用戶管理</h2>
        <Button variant="outline-primary" onClick={loadUsers}>
          <i className="fas fa-sync-alt me-2"></i>刷新資料
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">用戶列表 ({filteredUsers.length})</h5>
            </Col>
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="搜尋用戶姓名、Email 或 ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>用戶ID</th>
                  <th>姓名</th>
                  <th>Email</th>
                  <th>電話</th>
                  <th>錢包餘額</th>
                  <th>點數</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.uid}>
                    <td>{user.uid}</td>
                    <td>{user.user_name}</td>
                    <td>{user.email}</td>
                    <td>{user.telephone}</td>
                    <td>NT$ {user.wallet}</td>
                    <td>{user.point}</td>
                    <td>
                      {user.blacklist ? (
                        <Badge bg="danger">黑名單</Badge>
                      ) : (
                        <Badge bg="success">正常</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
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

      {/* 用戶詳情 Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>用戶詳情 - {selectedUser?.user_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>基本資料</h6>
                      <p><strong>用戶ID:</strong> {selectedUser.uid}</p>
                      <p><strong>姓名:</strong> {selectedUser.user_name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>電話:</strong> {selectedUser.telephone}</p>
                      <p><strong>地址:</strong> {selectedUser.address}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>帳戶資訊</h6>
                      <p><strong>錢包餘額:</strong> NT$ {selectedUser.wallet}</p>
                      <p><strong>點數:</strong> {selectedUser.point}</p>
                      <p><strong>碳足跡:</strong> {selectedUser.total_carbon_footprint}</p>
                      <p>
                        <strong>狀態:</strong>{' '}
                        {selectedUser.blacklist ? (
                          <Badge bg="danger">黑名單</Badge>
                        ) : (
                          <Badge bg="success">正常</Badge>
                        )}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h6>最近訂單記錄</h6>
              {userOrders.length > 0 ? (
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>訂單ID</th>
                      <th>開始時間</th>
                      <th>站點</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.slice(0, 5).map(order => (
                      <tr key={order.order_ID}>
                        <td>{order.order_ID}</td>
                        <td>{new Date(order.start_date).toLocaleString()}</td>
                        <td>{order.site_name}</td>
                        <td>
                          <Badge 
                            bg={order.order_status === 'completed' ? 'success' : 'warning'}
                          >
                            {order.order_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">暫無訂單記錄</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
