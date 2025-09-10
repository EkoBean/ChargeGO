import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
// 職員操作紀錄 
const StaffLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 操作類型中文對照
  const actionLabels = {
    LOGIN: '登入系統',
    LOGOUT: '登出系統',
    LOGIN_FAILED: '登入失敗',
    CREATE_SITE: '新增站點',
    UPDATE_SITE: '更新站點',
    DELETE_SITE: '刪除站點',
    VIEW_SITE: '查看站點',
    CREATE_CHARGER: '新增充電器',
    UPDATE_CHARGER: '更新充電器',
    DELETE_CHARGER: '刪除充電器',
    VIEW_REPORTS: '查看報表',
    EXPORT_DATA: '匯出資料',
    UPDATE_USER: '修改用戶資訊',    
    CREATE_USER: '新增用戶',       
    DELETE_USER: '刪除用戶',
    // 新增訂單相關操作
    CREATE_ORDER: '新增訂單',
    UPDATE_ORDER: '修改訂單',
    DELETE_ORDER: '刪除訂單',
    VIEW_ORDER: '查看訂單',       
    'log in': '登入系統',
    'log out': '登出系統',
    'changed userinfo': '修改用戶資訊'
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getEmployeeLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('載入操作紀錄失敗', e);
        setError(e.message || '載入操作紀錄失敗');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const parseLogContent = (logContent) => {
    if (!logContent) return { action: '未知操作' };
    
    try {
      // 處理新的簡化格式 "ACTION-{...}" 或 "ACTION - {...}"
      if (logContent.includes('-{')) {
        const parts = logContent.split('-{');
        if (parts.length >= 2) {
          const action = parts[0].trim();
          const detailsStr = '{' + parts.slice(1).join('-{');
          let details = {};
          
          try {
            details = JSON.parse(detailsStr);
          } catch {
            details = {};
          }
          
          return { action, details };
        }
      }
      
      // 處理舊格式 "ACTION - {...}"
      const parts = logContent.split(' - ');
      if (parts.length >= 2) {
        const action = parts[0];
        const detailsStr = parts.slice(1).join(' - ');
        let details = {};
        
        try {
          details = JSON.parse(detailsStr);
        } catch {
          details = { content: detailsStr };
        }
        
        return { action, details };
      }
      
      // 如果只是簡單的操作名稱
      return { action: logContent };
    } catch {
      return { action: logContent || '未知操作' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未知時間';
    
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 搜尋功能
  const filteredLogs = logs.filter(log => {
    const { action } = parseLogContent(log.log);
    return (
      (log.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.employee_id || '').includes(searchTerm) ||
      (actionLabels[action] || action || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const refreshLogs = () => {
    setLoading(true);
    ApiService.getEmployeeLogs()
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="admin-tasks-content">
      <div className="admin-content-header" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>職員操作紀錄</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input
            type="text"
            placeholder="請輸入員工姓名、編號或操作..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />

          <button className="btn admin-btn admin-primary" onClick={refreshLogs}>
            🔄 刷新資料
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
          {filteredLogs.length === 0 ? (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>使用日期</th>
                    <th>員工編號</th>
                    <th>員工姓名</th>
                    <th>使用紀錄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" style={{ padding: 12 }}>
                      {searchTerm ? '沒有找到符合條件的操作紀錄' : '目前無操作紀錄'}
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
                    <th>使用日期</th>
                    <th>員工編號</th>
                    <th>員工姓名</th>
                    <th>使用紀錄</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const { action } = parseLogContent(log.log);
                    
                    return (
                      <tr key={index}>
                        <td>{formatDate(log.employee_log_date)}</td>
                        <td>{log.employee_id || 'N/A'}</td>
                        <td>{log.employee_name || '未知員工'}</td>
                        <td>{actionLabels[action] || action}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div style={{ marginBottom: 8, color: "#666" }}>
        顯示 {filteredLogs.length} / {logs.length} 筆
      </div>
    </div>
  );
};

export default StaffLogs;