import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

// 發送活動通知給用戶
const SendEventModal = ({ event, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  
  // 篩選和選擇狀態
  const [statusFilter, setStatusFilter] = useState('normal'); // normal | blacklist | all
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('開始載入用戶資料...');
      
      const data = await ApiService.request('/api/users');
      console.log('用戶資料載入成功:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('API 返回的數據格式不正確');
      }
      
      setUsers(data);
    } catch (err) {
      console.error('載入用戶列表失敗:', err);
      setError(`載入用戶列表失敗: ${err.message || '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  // 根據狀態篩選用戶
  const filteredUsers = users.filter(user => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'normal') return user.status === 'normal';
    if (statusFilter === 'blacklist') return user.status === 'blacklist';
    return true;
  });

  // 處理全選/取消全選
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.user_id || user.uid));
    } else {
      setSelectedUsers([]);
    }
  };

  // 處理單個用戶選擇
  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setSelectAll(false);
    }
  };

  // 發送通知
  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      setError('請選擇至少一位用戶');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      // 準備要記錄的日誌內容：包含 event_id、title、event_title 與實際發送人數
      const logPayload = {
        event_id: event.event_id,
        title: event.event_title || event.title || '',
        event_title: event.event_title || '',
        user_count: selectedUsers.length
      };
      const logContent = `SEND_EVENT-${JSON.stringify(logPayload)}`;
      
      console.log('準備發送的日誌內容:', logContent);

      const response = await ApiService.request('/api/events/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          event_id: event.event_id,
          user_ids: selectedUsers,
          operator_id: localStorage.getItem('employeeId'),
          log_content: logContent
        })
      });

      // 以 API 回傳的 sent_count 為準，若無則 fallback 到 selectedUsers.length
      const sentCount = response?.sent_count ?? selectedUsers.length;
      console.log('發送結果:', response, 'sentCount:', sentCount);

      onSuccess?.(`成功發送通知給 ${sentCount} 位用戶`, sentCount);
      onClose?.();
    } catch (err) {
      console.error('發送通知失敗:', err);
      setError(err.message || '發送通知失敗');
    } finally {
      setSending(false);
    }
  };

  // 發送給所有用戶
  const handleSendAll = async () => {
    try {
      setSending(true);
      setError('');
      
      // 預估會發送的人數 (使用當前過濾後的數量)
      const estimatedCount = filteredUsers.length;

      // 準備日誌，標示為發送給所有（並包含篩選條件）
      const logPayload = {
        event_id: event.event_id,
        title: event.event_title || event.title || '',
        event_title: event.event_title || '',
        send_all: true,
        status_filter: statusFilter,
        user_count: estimatedCount
      };
      const logContent = `SEND_EVENT-${JSON.stringify(logPayload)}`;

      const response = await ApiService.request('/api/events/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          event_id: event.event_id,
          send_all: true,
          status_filter: statusFilter,
          operator_id: localStorage.getItem('employeeId'),
          log_content: logContent
        })
      });

      // 以 API 回傳的 sent_count 為準，若無則 fallback 到 filteredUsers.length
      const count = response?.sent_count ?? filteredUsers.length;

      onSuccess?.(`成功發送通知給所有用戶 (${count} 人)`, count);
      onClose?.();
    } catch (err) {
      console.error('發送通知失敗:', err);
      setError(`發送通知失敗: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !sending && onClose()}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>發送活動通知</h3>
          <button className="admin-close-btn" onClick={() => !sending && onClose()}>
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {/* 活動信息區塊 */}
          <div className="admin-detail-section">
            <h4>活動詳情</h4>
            <p><strong>活動名稱：</strong>{event.event_title}</p>
            <p><strong>活動ID：</strong>{event.event_id}</p>
          </div>

          {error && (
            <div className="admin-alert admin-danger">
              {error}
            </div>
          )}

          {/* 用戶篩選區塊 */}
          <div className="admin-detail-section">
            <h4>發送設定</h4>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>用戶狀態篩選</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setSelectedUsers([]);
                    setSelectAll(false);
                  }}
                >
                  <option value="normal">正常用戶</option>
                  <option value="blacklist">黑名單用戶</option>
                  <option value="all">所有用戶</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>符合條件用戶數</label>
                <input 
                  type="text" 
                  value={`${filteredUsers.length} 人`} 
                  disabled 
                />
              </div>
            </div>

            {/* 全選控制 */}
            {!loading && filteredUsers.length > 0 && (
              <div className="admin-checkbox" style={{ marginTop: '16px' }}>
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="selectAll">
                  全選 ({selectedUsers.length} / {filteredUsers.length})
                </label>
              </div>
            )}
          </div>

          {/* 用戶列表區塊 */}
          <div className="admin-detail-section">
            <h4>用戶列表</h4>
            
            {loading ? (
              <div className="admin-loading-screen" style={{ height: '200px' }}>
                <div className="admin-loading-spinner"></div>
                <p>載入中...</p>
              </div>
            ) : (
              <>
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
                    <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '16px' }}>👤</div>
                    <p>沒有符合條件的用戶</p>
                  </div>
                ) : (
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #e9ecef',
                    borderRadius: '4px'
                  }}>
                    {filteredUsers.map(user => (
                      <div 
                        key={user.user_id || user.uid} 
                        className="admin-checkbox"
                        style={{ 
                          padding: '12px 16px',
                          borderBottom: '1px solid #f8f9fa',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          id={`user-${user.user_id || user.uid}`}
                          checked={selectedUsers.includes(user.user_id || user.uid)}
                          onChange={(e) => handleUserSelect(user.user_id || user.uid, e.target.checked)}
                        />
                        <label htmlFor={`user-${user.user_id || user.uid}`} style={{ flex: 1, cursor: 'pointer' }}>
                          <div style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '2px' }}>
                            {user.user_name || `用戶 ${user.user_id || user.uid}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            ID: {user.user_id || user.uid} | 
                            狀態: <span style={{ color: user.status === 'blacklist' ? '#dc3545' : '#28a745' }}>
                              {user.status === 'blacklist' ? '黑名單' : '正常'}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 操作按鈕區塊 */}
          <div className="admin-form-actions">
            <button 
              className="btn admin-btn"
              onClick={() => !sending && onClose()}
              disabled={sending}
            >
              取消
            </button>
            <button 
              className="btn admin-btn admin-success"
              onClick={handleSendAll}
              disabled={sending || loading || filteredUsers.length === 0}
            >
              {sending ? '發送中...' : `發送給所有${statusFilter === 'normal' ? '正常' : statusFilter === 'blacklist' ? '黑名單' : ''}用戶`}
            </button>
            <button 
              className="btn admin-btn admin-primary"
              onClick={handleSend}
              disabled={sending || loading || selectedUsers.length === 0}
            >
              {sending ? '發送中...' : `發送給選中的用戶 (${selectedUsers.length})`}
            </button>
            
            {sending && (
              <span className="admin-save-success">
                正在發送通知...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEventModal;