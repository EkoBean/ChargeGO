import React from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h2>儀表板</h2>

      {/* 統計卡片 */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">總站點數</h6>
                  <h2 className="card-title text-primary mb-0">156</h2>
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
                  <h2 className="card-title text-success mb-0">892</h2>
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
                  <h2 className="card-title text-warning mb-0">234</h2>
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
                  <h2 className="card-title text-info mb-0">12,847</h2>
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
                    <tr>
                      <td>2024-01-15 14:30</td>
                      <td>張小明</td>
                      <td>租借行動電源</td>
                      <td><Badge bg="success">成功</Badge></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>2024-01-15 14:25</td>
                      <td>李小華</td>
                      <td>歸還行動電源</td>
                      <td><Badge bg="success">成功</Badge></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>2024-01-15 14:20</td>
                      <td>王大明</td>
                      <td>付款失敗</td>
                      <td><Badge bg="danger">失敗</Badge></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
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