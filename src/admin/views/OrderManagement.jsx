import React, { useState, useEffect } from "react";
import { useAdminData } from "../context/AdminDataContext";
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import LoadingScreen from "../components/LoadingScreen";// 載入中畫面
import ErrorScreen from "../components/ErrorScreen";// 錯誤畫面
import OrderDetailModal from "../components/modals/OrderDetailModal";
import CreateOrderModal from "../components/modals/CreateOrderModal";
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

  // debug: 印出 orders sample，確認 order_status 的實際格式（數字或字串）
  if (Array.isArray(orders) && orders.length > 0) {
    console.log('OrderManagement orders[0]:', orders[0]);
  }

  // normalizeOrderStatus：把資料庫 enum（數字，例如 -1/0/1）或字串統一成 'completed' / 'active' / 'cancelled'
  const normalizeOrderStatus = (order) => {
    const raw = order?.order_status ?? order?.status ?? "";
    const s = String(raw).trim();
    // 數字 enum 映射（根據你提供的 schema）
    if (s === "-1") return "cancelled";
    if (s === "0") return "active";
    if (s === "1") return "completed";
    // 若後端直接回傳字串
    const lower = s.toLowerCase();
    if (lower.includes("cancel")) return "cancelled";
    if (lower.includes("complete") || lower.includes("done") || lower === "finished") return "completed";
    if (lower.includes("active") || lower.includes("in_progress") || lower.includes("ongoing")) return "active";
    return lower || "unknown";
  };

  // 狀態管理：選取的訂單、顯示訂單對話框、編輯訂單狀態、建立訂單狀態、訂單相關充電器、儲存狀態
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      // 優先使用 context 提供的整體載入函式（如果有）
      if (typeof loadAllData === "function") {
        await loadAllData();
        return;
      }

      // fallback：單獨抓取訂單（避免使用未宣告的 setLoading/setError）
      const [ordersData] = await Promise.all([
        ApiService.getOrders(),
      ]);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  // 當選定站點變更時載入該站點充電器（保留，供新增/編輯 modal 變更時自動載入）
  useEffect(() => {
    const siteId = editOrder?.site_id;
    if (!showDetailModal || !siteId) {
      setOrderSiteChargers([]);
      return;
    }
    ApiService.getSiteChargers(siteId)
      .then(setOrderSiteChargers)
      .catch(() => setOrderSiteChargers([]));
  }, [showDetailModal, editOrder?.site_id]);

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

  // 根據搜尋字串和狀態篩選訂單（使用 normalized status）
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.order_ID || "").includes(searchTerm) ||
      (order.site_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const normalized = normalizeOrderStatus(order);
    const matchesStatus = statusFilter === "all" || normalized === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 訂單統計資料（使用 normalizeOrderStatus）
  const orderStats = orders.reduce(
    (acc, o) => {
      const ns = normalizeOrderStatus(o);
      acc.total++;
      if (ns === "completed") acc.completed++;
      else if (ns === "active") acc.active++;
      else if (ns === "cancelled") acc.cancelled++;
      else acc.other++;
      return acc;
    },
    { total: 0, completed: 0, active: 0, cancelled: 0, other: 0 }
  );

  // 查看訂單詳情（改為把現有欄位預載入 editOrder，並載入站點充電器清單）
  const handleViewOrder = (order) => {
    const mapped = {
      ...order,
      // 對應可能的欄位名稱
      site_id: order.rental_site_id ?? order.site_id ?? "",
      charger_id: order.charger_id ?? "",
      start_date: order.start_date ?? "",
      end: order.end ?? "",
      comment: order.comment ?? "",
    };
    setSelectedOrder(order);
    setEditOrder(mapped);
    setIsEditingOrder(false);
    setCreatingOrder(false);
    setShowDetailModal(true);

    // 立即載入該站點的 chargers，避免使用者還要重新選站
    const siteId = mapped.site_id;
    if (siteId) {
      ApiService.getSiteChargers(siteId)
        .then(setOrderSiteChargers)
        .catch(() => setOrderSiteChargers([]));
    } else {
      setOrderSiteChargers([]);
    }
  };

  // 新增訂單
  const handleAddOrder = () => {
    const defaultSite = sites[0]?.site_id || "";
    const blank = {
      uid: "",
      site_id: defaultSite,
      order_status: "0",
      charger_id: "",
      comment: "",
      start_date: "",
      end: "",
    };
    setSelectedOrder(blank);
    setEditOrder(blank);
    setIsEditingOrder(true);
    setCreatingOrder(true);
    setShowCreateModal(true);

    // 載入預設站點的充電器（若有）
    if (defaultSite) {
      ApiService.getSiteChargers(defaultSite)
        .then(setOrderSiteChargers)
        .catch(() => setOrderSiteChargers([]));
    } else {
      setOrderSiteChargers([]);
    }
  };

  // 訂單欄位變更處理
  const handleOrderFieldChange = (e) => {
    const { name, value } = e.target;
    setEditOrder((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "site_id") {
        // 切換站點時清空/預選 charger，並立刻載入新站點 chargers
        next.charger_id = "";
        const sid = value;
        if (sid) {
          ApiService.getSiteChargers(sid)
            .then(setOrderSiteChargers)
            .catch(() => setOrderSiteChargers([]));
        } else {
          setOrderSiteChargers([]);
        }
      }
      return next;
    });
  };

  // 儲存訂單
  const handleSaveOrder = async () => {
    setSaving(true);
    
    try {
      // 深拷貝訂單資料以進行處理
      const orderToSave = { ...editOrder };
      
      // 確保開始時間存在並格式正確
      if (!orderToSave.start_date) {
        throw new Error('開始時間不能為空');
      }
      
      // 確保日期格式正確 (ISO 字串)
      if (typeof orderToSave.start_date === 'string' && orderToSave.start_date) {
        // 確保是有效的 ISO 字串
        try {
          new Date(orderToSave.start_date).toISOString();
        } catch (e) {
          // 如果不是有效的日期字串，嘗試修正格式
          console.warn('開始時間格式錯誤，嘗試修正');
          orderToSave.start_date = new Date(orderToSave.start_date).toISOString();
        }
      }
      
      // 如果有結束時間，也確保其格式正確
      if (orderToSave.end) {
        try {
          orderToSave.end = new Date(orderToSave.end).toISOString();
        } catch (e) {
          console.error('結束時間格式錯誤');
          throw new Error('結束時間格式錯誤');
        }
      }
      
      // 執行儲存，並在提交前記錄最終資料
      console.log('準備儲存的訂單資料:', orderToSave);
      
      // 呼叫 API
      const response = await saveOrderData(orderToSave);
      console.log('儲存成功:', response);
      
      // 關閉模態框
      setShowCreateModal(false);
      
      // 重新載入訂單列表或其他後續處理...
      
    } catch (error) {
      console.error('儲存訂單失敗:', error);
      alert(`儲存失敗: ${error.message}`);
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

  if (error) {
    return <ErrorScreen message={error} onRetry={loadAllData} />;
  }

  function getSiteNameById(siteId) {
    const site = sites.find(s => String(s.site_id) === String(siteId));
    return site ? site.site_name : "-";
  }

  // 開啟新增訂單的 Modal
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    
    // 設定預設值，特別是確保開始時間有效
    const now = new Date();
    setEditOrder({
      order_status: "0", // 預設進行中
      start_date: now.toISOString(), // 使用 ISO 格式的當前時間
      site_id: "", // 初始化其他必填欄位
      uid: "",
      user_name: "",
      charger_id: ""
    });
  };

  return (
    <div className="orders-content">
      {/* 頁面標題與刷新按鈕 */}
      <div className="content-header">
        <h2>商城訂單管理</h2>
        <div>
          <button className="btn" onClick={loadOrders}>
            🔄 刷新資料
          </button>
          <button className="btn primary" onClick={handleOpenCreateModal}>
            ➕ 新增訂單
          </button>
        </div>
      </div>

      {/* 統計卡片：顯示訂單總數、各狀態數量（加上 onClick 互動） */}
      <Row className="mb-4">
        <Col md={3}>
          <Card
            className={`border-0 shadow-sm text-center ${statusFilter === "all" ? "card-selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter("all")}//顯示全部訂單
          >
            <Card.Body>
              <h3 className="text-primary">{orderStats.total}</h3>
              <p className="mb-0">總訂單數</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className={`border-0 shadow-sm text-center ${statusFilter === "completed" ? "card-selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter("completed")}//顯示已完成訂單
          >
            <Card.Body>
              <h3 className="text-success">{orderStats.completed}</h3>
              <p className="mb-0">已完成</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className={`border-0 shadow-sm text-center ${statusFilter === "active" ? "card-selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter("active")}//顯示進行中訂單
          >
            <Card.Body>
              <h3 className="text-warning">{orderStats.active}</h3>
              <p className="mb-0">進行中</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className={`border-0 shadow-sm text-center ${statusFilter === "cancelled" ? "card-selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter("cancelled")}//
          >
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
              <h5 className="mb-0">商城訂單列表 ({filteredOrders.length})</h5>
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
                  <th>租出站</th>
                  <th>歸還站</th>
                  <th>充電器</th>
                  <th>開始時間</th>
                  <th>結束時間</th>
                  <th>狀態</th>
                  <th>備註</th>
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
                    <td>{order.rental_site_name ?? order.site_name ?? order.rental_site_id ?? "-"}</td>
                    <td>{order.return_site_name ?? "-"}</td>
                    <td>{order.charger_id}</td>
                    <td>{order.start_date ? new Date(order.start_date).toLocaleString() : "-"}</td>
                    <td>{order.end ? new Date(order.end).toLocaleString() : "-"}</td>
                    <td>{getStatusBadge(normalizeOrderStatus(order))}</td>
                    <td>{order.comment ?? "-"}</td>
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
      {showDetailModal && selectedOrder && (
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
          onClose={() => !saving && setShowDetailModal(false)}
          getOrderStatusText={getOrderStatusText}
        />
      )}

      {/* 新增訂單 Modal */}
      {showCreateModal && (
        <CreateOrderModal
          editOrder={editOrder}
          saving={saving}
          sites={sites}
          siteChargers={orderSiteChargers}
          onCancel={() => setShowCreateModal(false)}
          onSave={handleSaveOrder}
          onChange={handleOrderFieldChange}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default OrderManagement;
