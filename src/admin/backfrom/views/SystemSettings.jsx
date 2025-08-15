import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import ApiService from '../services/api';

const SystemSettings = () => {
  const [bankCards, setBankCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: '行動電源租借系統',
    rentalPrice: 50,
    maxRentalHours: 24,
    penaltyRate: 10,
    maintenanceMode: false
  });

  useEffect(() => {
    loadBankCards();
  }, []);

  const loadBankCards = async () => {
    try {
      setLoading(true);
      const cards = await ApiService.getBankCards();
      setBankCards(cards);
    } catch (error) {
      console.error('Failed to load bank cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // 這裡應該調用 API 保存設定
    alert('設定已保存！');
  };

  return (
    <div>
      <h2 className="mb-4">系統設定</h2>

      <Row>
        <Col lg={8}>
          {/* 系統參數設定 */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">系統參數設定</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>系統名稱</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.systemName}
                        onChange={(e) => handleSettingChange('systemName', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>租借價格 (NT$)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.rentalPrice}
                        onChange={(e) => handleSettingChange('rentalPrice', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>最大租借時間 (小時)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.maxRentalHours}
                        onChange={(e) => handleSettingChange('maxRentalHours', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>逾期罰金比率 (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.penaltyRate}
                        onChange={(e) => handleSettingChange('penaltyRate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="maintenance-mode"
                    label="維護模式"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                  <Form.Text className="text-muted">
                    啟用後，系統將進入維護模式，暫停服務
                  </Form.Text>
                </Form.Group>
                <Button variant="primary" onClick={handleSaveSettings}>
                  <i className="fas fa-save me-2"></i>保存設定
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* 銀行卡片管理 */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">銀行卡片資料</h5>
              <Button variant="outline-primary" onClick={loadBankCards}>
                <i className="fas fa-sync-alt me-2"></i>刷新
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">載入中...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>用戶ID</th>
                        <th>用戶姓名</th>
                        <th>卡號 (遮蔽)</th>
                        <th>有效期限</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankCards.map(card => (
                        <tr key={card.bankuser_id}>
                          <td>{card.bankuser_id}</td>
                          <td>{card.bankuser_name}</td>
                          <td>
                            <code>{card.credit_card_number_masked}</code>
                          </td>
                          <td>{card.credit_card_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* 系統狀態 */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">系統狀態</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>資料庫連線</span>
                <span className="badge bg-success">正常</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>API 服務</span>
                <span className="badge bg-success">運行中</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>系統負載</span>
                <span className="badge bg-warning">中等</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>磁碟空間</span>
                <span className="badge bg-success">充足</span>
              </div>
            </Card.Body>
          </Card>

          {/* 快速操作 */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">快速操作</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary">
                  <i className="fas fa-download me-2"></i>匯出資料
                </Button>
                <Button variant="outline-success">
                  <i className="fas fa-upload me-2"></i>匯入資料
                </Button>
                <Button variant="outline-warning">
                  <i className="fas fa-database me-2"></i>備份資料庫
                </Button>
                <Button variant="outline-info">
                  <i className="fas fa-chart-bar me-2"></i>生成報表
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemSettings;
