// 顯示和管理充電站及充電器的狀態 系統總覽管理

import React, { Component } from 'react';
import { Card, Table, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import ApiService from '../services/api';

class Charging extends Component {
    // state 儲存充電站、充電器資料及 UI 狀態
    state = {
        sites: [],         // 充電站列表
        chargers: [],      // 充電器列表
        loading: true,     // 是否載入中
        error: null,       // 錯誤訊息
        selectedSite: null // 使用者選擇的站點
    }

    // 元件掛載時載入資料
    componentDidMount() {
        this.loadChargingData();
    }

    // 從 API 載入充電站與充電器資料
    loadChargingData = async () => {
        try {
            this.setState({ loading: true, error: null });
            // 同時取得站點與充電器資料
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

    // 使用者點擊「查看詳情」時，載入該站點的充電器資料
    handleSiteSelect = async (siteId) => {
        try {
            const siteChargers = await ApiService.getSiteChargers(siteId);
            this.setState({ selectedSite: siteId });
            // 可在此擴充顯示該站點充電器詳情
        } catch (error) {
            console.error('Failed to load site chargers:', error);
        }
    }

    // 根據充電器狀態顯示不同顏色徽章
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

        // 載入中顯示 Spinner
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

        // 載入失敗顯示錯誤訊息
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

        // 統計各種充電器狀態數量
        const availableChargers = chargers.filter(c => c.status === 'available').length;
        const occupiedChargers = chargers.filter(c => c.status === 'occupied').length;
        const maintenanceChargers = chargers.filter(c => c.status === 'maintenance').length;

        return (
            <div className="p-4">
                {/* 頁面標題與刷新按鈕 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>充電站管理</h2>
                    <button className="btn btn-outline-primary" onClick={this.loadChargingData}>
                        <i className="fas fa-sync-alt me-2"></i>刷新資料
                    </button>
                </div>

                {/* 統計卡片：顯示站點數、各狀態充電器數量 */}
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

                {/* 充電站列表：顯示所有站點及其充電器狀態 */}
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
                                        // 計算該站點的充電器數量與可用數量
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
                                                    {/* 查看詳情與管理按鈕 */}
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