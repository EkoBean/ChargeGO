import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
//發送活動表單
const SendEventModal = ({ event, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await ApiService.getActiveUsers();
      setUsers(data);
    } catch (err) {
      setError('載入用戶列表失敗');
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');

      const targetUsers = sendToAll ? 'all' : selectedUsers;
      
      if (!sendToAll && selectedUsers.length === 0) {
        setError('請選擇至少一位用戶');
        return;
      }

      const result = await ApiService.sendEventToUsers(event.event_id, targetUsers);
      
      onSuccess(`${result.message}`);
    } catch (err) {
      setError(err.message || '發送失敗');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (uid) => {
    setSelectedUsers(prev => 
      prev.includes(uid) 
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>發送活動通知</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <h4>活動資訊</h4>
            <p><strong>標題:</strong> {event.event_title}</p>
            <p><strong>內容:</strong> {event.event_content}</p>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
              />
              發送給所有用戶
            </label>
          </div>

          {!sendToAll && (
            <div className="form-group">
              <h4>選擇用戶 ({selectedUsers.length} 已選擇)</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                {users.map(user => (
                  <label key={user.uid} style={{ display: 'block', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.uid)}
                      onChange={() => toggleUserSelection(user.uid)}
                    />
                    {user.user_name} (ID: {user.uid}) - {user.email}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="alert error" style={{ marginTop: '10px' }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>取消</button>
          <button 
            className="btn primary" 
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? '發送中...' : '確認發送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEventModal;