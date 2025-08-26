import React, { useState, useEffect } from "react";
import { useAdminData } from "../context/AdminDataContext";
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import OrderDetailModal from "../components/modals/OrderDetailModal";
import ApiService from "../services/api";

// 訂單管理頁面
const OrderManagement = () => {
  const {
    orders,
    sites,
    setOrders,
    getOrderStatusText,
    loading,
    error,
    loadAllData,
  } = useAdminData();
  // 狀態管理：選取的訂單、顯示訂單對話框、編輯訂單狀態、建立訂單狀態、訂單相關充電器、儲存狀態
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSiteChargers, setOrderSiteChargers] = useState([]);
  const [saving, setSaving] = useState(false);

  // 新增：搜尋與狀態篩選的 state（原先缺少，導致 ReferenceError）
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 元件掛載時自動載入訂單和站點資料
  useEffect(() => {
    loadOrders();
  }, []);

  // 從 API 載入訂單和站點資料
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, sitesData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getSites(),
      ]);
      setOrders(ordersData);
    } catch (err) {
      setError("載入訂單資料失敗");
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // 當選定站點變更時載入該站點充電器
  useEffect(() => {
    const siteId = editOrder?.site_id;
    if (!showOrderModal || !siteId) {
      setOrderSiteChargers([]);
      return;
    }
    ApiService.getSiteChargers(siteId)
      .then(setOrderSiteChargers)
      .catch(() => setOrderSiteChargers([]));
  }, [showOrderModal, editOrder?.site_id]);

  // 根據訂單狀態回傳不同顏色的 Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge bg="success">已完成</Badge>;
      case "active":
        return <Badge bg="warning">進行中</Badge>;
      case "cancelled":
        return <Badge bg="danger">已取消</Badge>;
      default:
        return <Badge bg="secondary">未知</Badge>;
    }
  };

  // 根據搜尋字串和狀態篩選訂單
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_ID.toString().includes(searchTerm) ||
      order.site_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 訂單統計資料
  const orderStats = {
    total: orders.length,
    completed: orders.filter((o) => o.order_status === "completed").length,
    active: orders.filter((o) => o.order_status === "active").length,
    cancelled: orders.filter((o) => o.order_status === "cancelled").length,
  };

  // 查看訂單詳情
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setEditOrder(order);
    setIsEditingOrder(false);
    setCreatingOrder(false);
    setShowOrderModal(true);
  };

  // 新增訂單
  const handleAddOrder = () => {
    const defaultSite = sites[0]?.site_id || "";
    const blank = { uid: "", site_id: defaultSite, order_status: "active", charger_id: "" };
    setSelectedOrder(blank);
    setEditOrder(blank);
    setIsEditingOrder(true);
    setCreatingOrder(true);
    setShowOrderModal(true);
  };

  // 訂單欄位變更處理
  const handleOrderFieldChange = (e) => {
    const { name, value } = e.target;
    setEditOrder((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "site_id") {
        // 切換站點時清空/預選 charger
        next.charger_id = "";
      }
      return next;
    });
  };

  // 儲存訂單
  const handleSaveOrder = async () => {
    if (!editOrder) return;
    try {
      setSaving(true);
      if (creatingOrder || !editOrder.order_ID) {
        const payload = {
          uid: editOrder.uid,
          site_id: Number(editOrder.site_id),
          charger_id: Number(editOrder.charger_id) || undefined,
          order_status: editOrder.order_status || "active",
          end: editOrder.end || null,
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
          end: editOrder.end || null,
        };
        await ApiService.updateOrder(editOrder.order_ID, payload);
        await loadAllData();
        setIsEditingOrder(false);
      }
    } catch (err) {
      console.error("Failed to save order:", err);
      alert("訂單儲存失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
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
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  return (
    <div className="orders-content">
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
                {filteredOrders.map((order) => (
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
                    <td>{order.end ? new Date(order.end).toLocaleString() : "-"}</td>
                    <td>{getStatusBadge(order.order_status)}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleViewOrder(order)}>
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

      {/* 訂單詳情對話框 */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          editOrder={editOrder}
          isEditing={isEditingOrder}
          creating={creatingOrder}
          saving={saving}
          sites={sites}
          siteChargers={orderSiteChargers}
          onEdit={() => setIsEditingOrder(true)}
          onCancel={() => {
            setEditOrder(selectedOrder);
            setIsEditingOrder(false);
            setCreatingOrder(false);
          }}
          onSave={handleSaveOrder}
          onChange={handleOrderFieldChange}
          onClose={() => !saving && setShowOrderModal(false)}
          getOrderStatusText={getOrderStatusText}
        />
      )}
    </div>
  );
};

export default OrderManagement;
