import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import CreateTaskModal from '../components/modals/CreateTaskModal';

//任務管理主畫面
const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getMissions();
        setTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('載入任務失敗', e);
        setError(e.message || '載入任務失敗');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 搜尋功能
  const filteredTasks = tasks.filter(task => {
    return (
      task.mission_id?.toString().includes(searchTerm) || 
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const refreshTasks = () => {
    setLoading(true);
    ApiService.getMissions()
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // 處理創建成功
  const handleCreateSuccess = (message) => {
    setShowCreateModal(false);
    setSuccess(message);
    // 重新載入任務列表
    const load = async () => {
      try {
        const data = await ApiService.getMissions();
        setTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('載入任務失敗', e);
      }
    };
    load();
    
    // 5秒後清除成功訊息
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  return (
    <div className="admin-tasks-content">
      <div className="admin-content-header" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>任務管理</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input
            type="text"
            placeholder="請輸入任務名稱、描述或編號"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />

          <button className="btn admin-btn admin-primary" onClick={refreshTasks}>
            🔄 刷新資料
          </button>

          <button
            className="btn admin-btn admin-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + 建立任務
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-danger" style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div className="admin-loading-screen">
          <div className="admin-loading-spinner"></div>
          <div>載入中...</div>
        </div>
      ) : (
        <>
          {filteredTasks.length === 0 ? (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>標題</th>
                    <th>描述</th>
                    <th>類型</th>
                    <th>獎勵</th>
                    <th>目標</th>
                    <th>時間範圍</th>
                    <th>建立時間</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" style={{ padding: 12 }}>
                      {searchTerm ? '沒有找到符合條件的任務' : '目前無任務'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>標題</th>
                    <th>描述</th>
                    <th>類型</th>
                    <th>獎勵</th>
                    <th>目標</th>
                    <th>時間範圍</th>
                    <th>建立時間</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.mission_id}>
                      <td>{t.mission_id}</td>
                      <td>{t.title}</td>
                      <td style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
                      <td>{t.type}</td>
                      <td>{t.reward_points}</td>
                      <td>{t.target_value} {t.target_unit}</td>
                      <td>{t.mission_start_date ? new Date(t.mission_start_date).toLocaleString() : '-'} ~ {t.mission_end_date ? new Date(t.mission_end_date).toLocaleString() : '-'}</td>
                      <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
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

      <div style={{ marginBottom: 8, color: "#666" }}>
        顯示 {filteredTasks.length} / {tasks.length} 筆
      </div>

      {/* 建立任務彈出視窗 */}
      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default TaskManagement;