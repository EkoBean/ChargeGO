import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import CreateEventModal from '../components/modals/CreateEventModal';
import SendEventModal from '../components/modals/SendEventModal';
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import { apiRoutes } from '../../components/apiRoutes';

// 活動管理頁面
const ActivityBroadcast = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState("all"); // values: all | active | ended
  const [eventSendCounts, setEventSendCounts] = useState({}); // 添加發送人數狀態

  // 載入活動列表
  useEffect(() => {
    fetchEvents();
    fetchEventSendCounts(); // 載入發送統計
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(''); // 清除之前的錯誤
      console.log('開始載入活動資料...'); // 加入 debug 日誌
      
      const data = await ApiService.request(apiRoutes.events);
      console.log('活動資料載入成功:', data); // 加入 debug 日誌
      
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('載入活動資料失敗:', err); // 詳細錯誤日誌
      setError(`載入活動資料失敗: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // 獲取活動發送統計
  const fetchEventSendCounts = async () => {
    try {
      const data = await ApiService.request(`${apiRoutes.events}/send-counts`);
      setEventSendCounts(data || {});
    } catch (err) {
      console.error('載入發送統計失敗:', err);
    }
  };

  // 搜尋功能
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.event_id?.toString().includes(searchTerm) || 
      (event.event_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const isActive = new Date() < new Date(event.event_end_date || new Date());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && isActive;
    if (statusFilter === "ended") return matchesSearch && !isActive;
    
    return matchesSearch;
  });

  // 處理創建成功
  const handleCreateSuccess = (message) => {
    setShowCreateModal(false);
    setSuccess(message);
    fetchEvents(); // 重新載入活動列表
    
    // 5秒後清除成功訊息
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  // 處理發送活動
  const handleSendEvent = (event) => {
    setSelectedEvent(event);
    setShowSendModal(true);
  };

  // 處理發送成功
  const handleSendSuccess = (message, sentCount) => {
    setShowSendModal(false);
    setSelectedEvent(null);
    setSuccess(message);
    
    // 更新發送人數統計
    if (selectedEvent && sentCount) {
      setEventSendCounts(prev => ({
        ...prev,
        [selectedEvent.event_id]: (prev[selectedEvent.event_id] || 0) + sentCount
      }));
    }
    
    // 5秒後清除成功訊息
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  // 修正日期顯示格式
  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchEvents} />;
  }

  return (
    <div className="admin-events-content">
      <div className="admin-content-header" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>活動管理</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input
            type="text"
            placeholder="請輸入活動名稱或編號"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 8 }}
            title="依狀態篩選"
          >
            <option value="all">全部狀態</option>
            <option value="active">已上線</option>
            <option value="ended">已結束</option>
          </select>

          <button className="btn admin-btn admin-primary" onClick={fetchEvents}>
            🔄 刷新資料
          </button>

          <button
            className="btn admin-btn admin-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + 建立活動
          </button>
        </div>
      </div>

      {success && (
        <div className="admin-alert admin-success" style={{
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          borderRadius: '4px', 
          color: 'green'
        }}>
          {success}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>活動編號</th>
              <th>活動標題</th>
              <th>活動時間</th>
              <th>活動類型</th>
              <th>狀態</th>
              <th>發送人數</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 12 }}>沒有找到活動</td>
              </tr>
            ) : (
              filteredEvents.map(event => (
                <tr key={event.event_id}>
                  <td>{event.event_id}</td>
                  <td>{event.event_title || '無標題'}</td>
                  <td>
                    {formatDate(event.event_start_date)} ~ {formatDate(event.event_end_date)}
                  </td>
                  <td>{event.site_name || '全站活動'}</td>
                  <td>
                    <span className={`admin-badge ${new Date() < new Date(event.event_end_date) ? "admin-success" : "admin-danger"}`}>
                      {new Date() < new Date(event.event_end_date) ? '已上線' : '已結束'}
                    </span>
                  </td>
                  <td className="admin-text-center">
                    {eventSendCounts[event.event_id] || 0}
                  </td>
                  <td>
                    <button 
                      className="btn admin-btn admin-small admin-primary"
                      onClick={() => handleSendEvent(event)}
                    >
                      發送通知
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginBottom: 8, color: "#666" }}>
        顯示 {filteredEvents.length} / {events.length} 筆
      </div>

      {/* 建立活動彈出視窗 */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* 發送活動彈出視窗 */}
      {showSendModal && selectedEvent && (
        <SendEventModal 
          event={selectedEvent}
          onClose={() => {
            setShowSendModal(false);
            setSelectedEvent(null);
          }} 
          onSuccess={handleSendSuccess}
        />
      )}
    </div>
  );
};

export default ActivityBroadcast;