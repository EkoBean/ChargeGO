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
      console.log('載入訂單列表...');
      const ordersData = await ApiService.getOrders();
      console.log('訂單載入成功，數量:', ordersData.length);
      
      // 確保前端也按 order_ID 降序排序（雙重保險）
      const sortedOrders = ordersData.sort((a, b) => {
        const orderIdA = parseInt(a.order_ID) || 0;
        const orderIdB = parseInt(b.order_ID) || 0;
        return orderIdB - orderIdA; // 降序：大的在前面
      });
      
      console.log('訂單排序後:', sortedOrders.slice(0, 5).map(o => ({ 
        order_ID: o.order_ID, 
        start_date: o.start_date 
      })));
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('載入訂單失敗:', error);
      alert('載入訂單失敗: ' + error.message);
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

  // 儲存編輯後的訂單資料
  const handleSaveEditOrder = async () => {
    const status = editOrder?.order_status || "0";
    
    console.log('準備儲存編輯的訂單，當前 editOrder:', editOrder);
    
    // 基本必填欄位驗證
    const errors = [];
    if (!editOrder.uid) errors.push('用戶ID');
    if (!editOrder.start_date) errors.push('開始時間');
    if (!editOrder.rental_site_id) errors.push('租借站點');
    if (!editOrder.charger_id) errors.push('充電器');
    
    // 根據訂單狀態追加驗證
    if (status === "1" || status === "-1") { // 已完成或已取消
      if (!editOrder.return_site_id) errors.push('歸還站點');
      if (!editOrder.end) errors.push('結束時間');
    }
    
    if (errors.length > 0) {
      alert(`請填寫所有必要欄位: ${errors.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // 準備更新資料
      const updateData = {
        uid: Number(editOrder.uid),
        start_date: editOrder.start_date,
        end: (status === "1" || status === "-1") ? editOrder.end : null,
        rental_site_id: Number(editOrder.rental_site_id),
        return_site_id: (status === "1" || status === "-1") && editOrder.return_site_id ? Number(editOrder.return_site_id) : null,
        order_status: status,
        charger_id: Number(editOrder.charger_id),
        comment: editOrder.comment || '',
        total_amount: editOrder.total_amount || 0
      };
      
      console.log('準備傳送的更新資料:', updateData);
      
      // 呼叫更新 API
      const updatedOrder = await ApiService.updateOrder(selectedOrder.order_ID, updateData);
      console.log('訂單更新成功:', updatedOrder);
      
      // 更新訂單列表
      setOrders(prev => prev.map(order => 
        order.order_ID === selectedOrder.order_ID ? updatedOrder : order
      ));
      
      // 關閉編輯模式
      setIsEditingOrder(false);
      setShowDetailModal(false);
      setEditOrder(null);
      setSelectedOrder(null);
      
      alert('訂單更新成功！');
      
      // 重新載入訂單列表
      await loadOrders();
      
    } catch (error) {
      console.error('更新訂單失敗:', error);
      alert(`更新訂單失敗: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 查看訂單詳情 - 修正欄位對應
  const handleViewOrder = (order) => {
    const mapped = {
      ...order,
      rental_site_id: order.rental_site_id || "", // 使用正確欄位名稱
      return_site_id: order.return_site_id || "",
      charger_id: order.charger_id || "",
      start_date: order.start_date || "",
      end: order.end || "",
      comment: order.comment || "",
      user_name: order.user_name || "",
      total_amount: order.total_amount || 0,
    };
    
    console.log('查看訂單詳情:', mapped);
    
    setSelectedOrder(order);
    setEditOrder(mapped);
    setIsEditingOrder(false);
    setCreatingOrder(false);
    setShowDetailModal(true);

    // 載入該站點的充電器
    const siteId = mapped.rental_site_id;
    if (siteId) {
      console.log('載入站點充電器:', siteId);
      ApiService.getSiteChargers(siteId)
        .then(chargers => {
          console.log('載入充電器成功:', chargers);
          setOrderSiteChargers(chargers);
        })
        .catch(error => {
          console.error('載入充電器失敗:', error);
          setOrderSiteChargers([]);
        });
    } else {
      setOrderSiteChargers([]);
    }
  };

  // 新增訂單 - 修正欄位名稱
  const handleAddOrder = () => {
    const defaultSite = sites[0]?.site_id || "";
    const blank = {
      uid: "",
      rental_site_id: defaultSite, 
      return_site_id: "", 
      order_status: "0",
      charger_id: "",
      comment: "",
      start_date: new Date().toISOString().slice(0, 16),
      end: "",
    };
    
    setSelectedOrder(blank);
    setEditOrder(blank);
    setIsEditingOrder(true);
    setCreatingOrder(true);
    setShowCreateModal(true);

    if (defaultSite) {
      ApiService.getSiteChargers(defaultSite)
        .then(setOrderSiteChargers)
        .catch(() => setOrderSiteChargers([]));
    }
  };

  // 訂單欄位變更處理 - 修正欄位名稱
  const handleOrderFieldChange = (e) => {
    const { name, value } = e.target;
    setEditOrder(prev => ({
      ...prev,
      [name]: name === 'total_amount' || name === 'fee' || name === 'paid_amount'
        ? Number(value) || 0  // 確保金額欄位為數字
        : value
    }));
  };

  // 新增：處理用戶ID變更時自動帶入用戶名稱
  const handleUserIdChange = async (e) => {
    const { name, value } = e.target;
    
    // 更新用戶ID
    setEditOrder(prev => ({ ...prev, [name]: value, user_name: '' }));
    
    // 如果輸入的是有效的用戶ID，嘗試獲取用戶資訊
    if (name === 'uid' && value && /^\d+$/.test(value)) {
      try {
        const user = await ApiService.getUserById(Number(value));
        setEditOrder(prev => ({ ...prev, user_name: user.user_name }));
      } catch (error) {
        console.error('獲取用戶資訊失敗:', error);
        setEditOrder(prev => ({ ...prev, user_name: '用戶不存在' }));
      }
    }
  };

  // 儲存訂單 - 修正驗證邏輯
  const handleSaveOrder = async () => {
    const status = editOrder?.order_status || "0";
    
    console.log('準備儲存訂單，當前 editOrder:', editOrder);
    
    // 基本必填欄位驗證
    const errors = [];
    if (!editOrder.uid) errors.push('用戶ID');
    if (!editOrder.start_date) errors.push('開始時間');
    if (!editOrder.rental_site_id) errors.push('租借站點');
    if (!editOrder.charger_id) errors.push('充電器');
    
    // 根據訂單狀態追加驗證
    if (status === "1" || status === "-1") { // 已完成或已取消
      if (!editOrder.return_site_id) errors.push('歸還站點');
      if (!editOrder.end) errors.push('結束時間');
    }
    
    if (errors.length > 0) {
      alert(`請填寫所有必要欄位: ${errors.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // 準備資料
      const orderData = {
        uid: Number(editOrder.uid),
        start_date: editOrder.start_date,
        end: (status === "1" || status === "-1") ? editOrder.end : null, // 只有完成/取消時才傳送結束時間
        rental_site_id: Number(editOrder.rental_site_id),
        return_site_id: (status === "1" || status === "-1") && editOrder.return_site_id ? Number(editOrder.return_site_id) : null, // 只有完成/取消時才傳送歸還站點
        order_status: status,
        charger_id: Number(editOrder.charger_id),
        comment: editOrder.comment || '',
        total_amount: editOrder.total_amount || 0
      };
      
      console.log('準備傳送的訂單資料:', orderData);
      
      const savedOrder = await ApiService.createOrder(orderData);
      console.log('訂單建立成功:', savedOrder);
      
      // 將新訂單添加到列表最前面
      setOrders(prev => {
        const updatedOrders = [savedOrder, ...prev];
        // 重新按 order_ID 排序確保順序正確
        return updatedOrders.sort((a, b) => {
          const orderIdA = parseInt(a.order_ID) || 0;
          const orderIdB = parseInt(b.order_ID) || 0;
          return orderIdB - orderIdA;
        });
      });
      
      // 關閉模態框
      setShowCreateModal(false);
      setShowDetailModal(false);
      setIsEditingOrder(false);
      setCreatingOrder(false);
      setEditOrder(null);
      
      alert('訂單建立成功！');
      
      // 重新載入訂單列表
      await loadOrders();
      
    } catch (error) {
      console.error('儲存訂單失敗:', error);
      alert(`儲存訂單失敗: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 載入中顯示 Spinner
  if (loading) {
    return (
      <div className="admin-loading-screen text-center p-5">
        <div className="admin-loading-spinner"></div>
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

  // 開啟新增訂單的 Modal - 修正預設值
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    
    const now = new Date();
    setEditOrder({
      uid: "",
      user_name: "",
      start_date: now.toISOString(), // 使用完整的 ISO 格式
      end: "",
      rental_site_id: "", // 確保使用正確欄位名稱
      return_site_id: "", 
      order_status: "0", // 預設為進行中
      charger_id: "",
      comment: "",
      total_amount: 0,
    });
    
    setOrderSiteChargers([]);
  };

  return (
    <div className="admin-orders-content">
      {/* 頁面標題與刷新按鈕 */}
      <div className="admin-content-header">
        <h2>租借紀錄管理</h2>
        <div>
          <button className="btn admin-btn" onClick={loadOrders}>
            🔄 刷新資料
          </button>
          <button className="btn admin-btn admin-primary" onClick={handleOpenCreateModal}>
            ➕ 新增訂單
          </button>
        </div>
      </div>

      {/* 統計卡片：顯示訂單總數、各狀態數量（加上 onClick 互動） */}
      <Row className="mb-4">
        <Col md={3}>
          <Card
            className={`border-0 shadow-sm text-center ${statusFilter === "all" ? "admin-card-selected" : ""}`}
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
            className={`border-0 shadow-sm text-center ${statusFilter === "completed" ? "admin-card-selected" : ""}`}
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
            className={`border-0 shadow-sm text-center ${statusFilter === "active" ? "admin-card-selected" : ""}`}
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
            className={`border-0 shadow-sm text-center ${statusFilter === "cancelled" ? "admin-card-selected" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter("cancelled")}//顯示已取消訂單
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
              <h5 className="mb-0">租借紀錄列表 ({filteredOrders.length})</h5>
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
          <div className="admin-table-container table-responsive">
            <Table hover className="admin-data-table">
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
                  <th>總金額</th> {/* 新增這行 */}
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
                    <td>NT$ {order.total_amount || 0}</td> {/* 新增這行 */}
                    <td>{getStatusBadge(normalizeOrderStatus(order))}</td>
                    <td>{order.comment ?? "-"}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="admin-btn admin-small admin-primary" 
                        onClick={() => handleViewOrder(order)}
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

      {/* 訂單詳情對話框 */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          editOrder={editOrder}
          isEditing={isEditingOrder}
          saving={saving}
          sites={sites}
          siteChargers={orderSiteChargers}
          onEdit={() => setIsEditingOrder(true)}
          onCancel={() => {
            setIsEditingOrder(false);
            setEditOrder({ ...selectedOrder });
          }}
          onSave={handleSaveEditOrder} // 使用正確的函數名
          onChange={handleOrderFieldChange}
          onClose={() => {
            setShowDetailModal(false);
            setIsEditingOrder(false);
            setSelectedOrder(null);
            setEditOrder(null);
          }}
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
