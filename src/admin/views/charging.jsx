// 顯示和管理充電站及充電器的狀態
import React, { Component } from 'react';
import { Card, Table, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import ApiService from '../services/api';

class Charging extends Component {
    state = {
        sites: [],
        chargers: [],
        loading: true,
        error: null,
        selectedSite: null
    }

    componentDidMount() {
        this.loadChargingData();
    }

    // 載入充電站和充電器資料
    loadChargingData = async () => {
        try {
            this.setState({ loading: true, error: null });
            
            const [sites, chargers] = await Promise.all([
                ApiService.getSites(),
                ApiService.getChargers()
            ]);

            this.setState({
                sites,
                chargers,
                loading: false
            });
        } catch (error) {
            this.setState({
                error: '載入充電站資料失敗',
                loading: false
            });
        }
    }
    // 處理站點選擇
    handleSiteSelect = async (siteId) => {
        try {
            const siteChargers = await ApiService.getSiteChargers(siteId);
            this.setState({ selectedSite: siteId });
        } catch (error) {
            console.error('Failed to load site chargers:', error);
        }
    }
    // 根據狀態返回對應的徽章
    getStatusBadge = (status) => {
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
    }

    render() {
        const { sites, chargers, loading, error } = this.state;

        if (loading) {
            return (
                <div className="p-4 d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                    <div className="text-center">
                        <Spinner animation="border" role="status" className="mb-3" />
                        <p>載入充電站資料中...</p>
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
                        <button className="btn btn-outline-danger" onClick={this.loadChargingData}>
                            重新載入
                        </button>
                    </Alert>
                </div>
            );
        }

        // 計算統計資料
        const availableChargers = chargers.filter(c => c.status === 'available').length;
        const occupiedChargers = chargers.filter(c => c.status === 'occupied').length;
        const maintenanceChargers = chargers.filter(c => c.status === 'maintenance').length;

        return (
            <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>充電站管理</h2>
                    <button className="btn btn-outline-primary" onClick={this.loadChargingData}>
                        <i className="fas fa-sync-alt me-2"></i>刷新資料
                    </button>
                </div>

                {/* 統計卡片 */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h3 className="text-primary">{sites.length}</h3>
                                <p className="mb-0">總站點數</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h3 className="text-success">{availableChargers}</h3>
                                <p className="mb-0">可用充電器</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h3 className="text-warning">{occupiedChargers}</h3>
                                <p className="mb-0">使用中</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h3 className="text-danger">{maintenanceChargers}</h3>
                                <p className="mb-0">維護中</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* 充電站列表 */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white">
                        <h5 className="mb-0">充電站列表</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table hover>
                                <thead className="table-light">
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
                                                    <Badge bg={availableCount > 0 ? 'success' : 'danger'}>
                                                        {availableCount}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => this.handleSiteSelect(site.site_id)}
                                                    >
                                                        查看詳情
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-success">
                                                        管理
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default Charging;