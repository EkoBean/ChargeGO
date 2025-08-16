import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

// 站點管理頁面元件
const SiteManagement = () => {
  // 狀態管理：站點、充電器、載入狀態、錯誤、Modal顯示、選取站點、該站點充電器
  const [sites, setSites] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteChargers, setSiteChargers] = useState([]);

  // 元件掛載時自動載入站點與充電器資料
  useEffect(() => {
    loadSiteData();
  }, []);

  // 從 API 載入站點與充電器資料
  const loadSiteData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sitesData, chargersData] = await Promise.all([
        ApiService.getSites(),
        ApiService.getChargers()
      ]);
      setSites(sitesData);
      setChargers(chargersData);
    } catch (err) {
      setError('載入站點資料失敗');
      console.error('Failed to load site data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 點擊「查看詳情」時，載入該站點的充電器資料並顯示 Modal
  const handleViewSite = async (site) => {
    try {
      setSelectedSite(site);
      const siteChargersData = await ApiService.getSiteChargers(site.site_id);
      setSiteChargers(siteChargersData);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load site chargers:', err);
    }
  };

  // 根據充電器狀態顯示不同顏色徽章
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">可用</Badge>;
      case 'occupied':
        return <Badge bg="warning">使用中</Badge>;
      case 'maintenance':
        return <Badge bg="danger">維護中</Badge>;
      default:
        return <Badge bg="secondary">未知</Badge>;
    }
  };

  // 載入中顯示 Spinner
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
        <p className="mt-3">載入站點資料中...</p>
      </div>
    );
  }

  // 載入失敗顯示錯誤訊息
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>載入錯誤</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={loadSiteData}>
          重新載入
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      {/* 頁面標題與刷新按鈕 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>站點管理</h2>
        <Button variant="outline-primary" onClick={loadSiteData}>
          <i className="fas fa-sync-alt me-2"></i>刷新資料
        </Button>
      </div>

      {/* 統計卡片：顯示站點數、各狀態充電器數量 */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-primary">{sites.length}</h3>
              <p className="mb-0">總站點數</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-success">
                {chargers.filter(c => c.status === 'available').length}
              </h3>
              <p className="mb-0">可用充電器</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-warning">
                {chargers.filter(c => c.status === 'occupied').length}
              </h3>
              <p className="mb-0">使用中</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-danger">
                {chargers.filter(c => c.status === 'maintenance').length}
              </h3>
              <p className="mb-0">維護中</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 站點列表：顯示所有站點及其充電器狀態 */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">站點列表</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>站點ID</th>
                  <th>站點名稱</th>
                  <th>地址</th>
                  <th>座標</th>
                  <th>充電器數量</th>
                  <th>可用數量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {sites.map(site => {
                  // 計算該站點的充電器數量與可用數量
                  const siteChargers = chargers.filter(c => c.site_id === site.site_id);
                  const availableCount = siteChargers.filter(c => c.status === 'available').length;
                  
                  return (
                    <tr key={site.site_id}>
                      <td>{site.site_id}</td>
                      <td>{site.site_name}</td>
                      <td>{site.address}</td>
                      <td>
                        <small>
                          {site.latitude}, {site.longitude}
                        </small>
                      </td>
                      <td>{siteChargers.length}</td>
                      <td>
                        <Badge bg={availableCount > 0 ? 'success' : 'danger'}>
                          {availableCount}
                        </Badge>
                      </td>
                      <td>
                        {/* 查看詳情按鈕，點擊後顯示 Modal */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewSite(site)}
                        >
                          查看詳情
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 站點詳情 Modal：顯示該站點的詳細資訊與充電器狀態 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>站點詳情 - {selectedSite?.site_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSite && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>站點資訊</h6>
                      <p><strong>站點ID:</strong> {selectedSite.site_id}</p>
                      <p><strong>站點名稱:</strong> {selectedSite.site_name}</p>
                      <p><strong>地址:</strong> {selectedSite.address}</p>
                      <p><strong>經度:</strong> {selectedSite.longitude}</p>
                      <p><strong>緯度:</strong> {selectedSite.latitude}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>充電器狀態統計</h6>
                      <p>
                        <strong>總數:</strong> {siteChargers.length}
                      </p>
                      <p>
                        <strong>可用:</strong> {' '}
                        <Badge bg="success">
                          {siteChargers.filter(c => c.status === 'available').length}
                        </Badge>
                      </p>
                      <p>
                        <strong>使用中:</strong> {' '}
                        <Badge bg="warning">
                          {siteChargers.filter(c => c.status === 'occupied').length}
                        </Badge>
                      </p>
                      <p>
                        <strong>維護中:</strong> {' '}
                        <Badge bg="danger">
                          {siteChargers.filter(c => c.status === 'maintenance').length}
                        </Badge>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h6>充電器列表</h6>
              {siteChargers.length > 0 ? (
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>充電器ID</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteChargers.map(charger => (
                      <tr key={charger.charger_id}>
                        <td>{charger.charger_id}</td>
                        <td>{getStatusBadge(charger.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">此站點暫無充電器</p>
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

export default SiteManagement;
