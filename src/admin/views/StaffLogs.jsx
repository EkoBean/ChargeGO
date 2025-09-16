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
    CREATE_ORDER: '新增租借訂單',
    UPDATE_ORDER: '修改租借訂單',
    DELETE_ORDER: '刪除租借訂單',
    VIEW_ORDER: '查看租借訂單',
    // 新增活動相關操作
    CREATE_EVENT: '建立活動',
    UPDATE_EVENT: '修改活動',
    DELETE_EVENT: '刪除活動',
    SEND_EVENT: '發送活動通知',
    VIEW_EVENT: '查看活動',
    // 新增任務相關操作
    CREATE_MISSION: '新增任務',      
    UPDATE_MISSION: '修改任務',      
    DELETE_MISSION: '刪除任務',      
    VIEW_MISSION: '查看任務',        
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
      // 找到第一個 '-' 作為 action 與 JSON 的分隔
      const dashIndex = logContent.indexOf('-');
      if (dashIndex > 0) {
        const action = logContent.substring(0, dashIndex);
        const jsonStr = logContent.substring(dashIndex + 1);
        let details;
        try {
          details = JSON.parse(jsonStr);
        } catch (e) {
          console.warn('無法解析日誌JSON部分:', jsonStr);
          details = { raw: jsonStr };
        }
        
        // 新增：任務類型中文對照
        const taskTypeLabels = {
          'accumulated_hours': '累積時間',
          'monthly_rentals': '月租借次數',
          'daily_task': '每日任務',
          'weekly_task': '每週任務',
          'special_event': '特殊活動'
        };
        
        // 根據不同操作類型，格式化描述
        let description = '';
        switch (action) {
          case 'CREATE_ORDER':
            // 優先顯示用戶名稱和訂單ID
            const orderInfo = details.user_name ? `用戶: ${details.user_name}` : `用戶ID: ${details.uid || '未知'}`;
            description = `訂單 #${details.order_id || '未知'} (${orderInfo})`;
            break;
          case 'UPDATE_ORDER':
            // 修正：確保使用 details.order_id
            const updateOrderId = details.order_id || details.id || '未知';
            description = `訂單 #${updateOrderId}`;
            break;
          case 'DELETE_ORDER':
            description = `訂單 #${details.order_id || '未知'}`;
            break;
          case 'UPDATE_USER':
            description = `用戶 #${details.uid || details.id || '未知'}`;
            break;
          case 'CREATE_USER':
            description = `用戶 #${details.uid || details.id || '未知'}`;
            break;
          case 'DELETE_USER':
            description = `用戶 #${details.uid || details.id || '未知'}`;
            break;
          case 'CREATE_SITE':
          case 'UPDATE_SITE':
          case 'DELETE_SITE':
            // 使用 details.site_id
            description = `站點 #${details.site_id || '未知'}`;
            break;
          case 'CREATE_CHARGER':
          case 'UPDATE_CHARGER':
          case 'DELETE_CHARGER':
            description = `充電器 #${details.id || '未知'}`;
            break;
          case 'CREATE_EVENT':
          case 'UPDATE_EVENT':
          case 'DELETE_EVENT':
          case 'SEND_EVENT':
          case 'VIEW_EVENT':
            // 優先顯示活動標題，若沒有則顯示活動ID
            const evTitle = details.title || details.event_title;
            description = evTitle ? `活動：${evTitle}` : `活動 #${details.id || '未知'}`;
            break;
          // 修改任務相關操作的解析 - 加入中文任務類型
          case 'CREATE_MISSION':
          case 'UPDATE_MISSION':
          case 'DELETE_MISSION':
          case 'VIEW_MISSION':
            // 優先顯示任務標題，若沒有則顯示任務ID
            const missionTitle = details.title;
            // 將英文任務類型轉換為中文
            const missionTypeZh = details.type ? taskTypeLabels[details.type] || details.type : '';
            const missionType = missionTypeZh ? ` (${missionTypeZh})` : '';
            description = missionTitle ? `任務：${missionTitle}${missionType}` : `任務 #${details.mission_id || details.id || '未知'}`;
            break;
          default:
            // 對於其他操作，只顯示基本ID資訊
            if (details.id) {
              description = `#${details.id}`;
            } else if (details.order_id) {
              description = `#${details.order_id}`;
            } else if (details.mission_id) {
              description = `#${details.mission_id}`;
            } else {
              description = '';
            }
        }
        
        return {
          action: action,
          details: details,
          description: description
        };
      }
      
      // 如果不是我們預期的格式，直接返回原內容
      return { action: logContent, description: '' };
    } catch (error) {
      console.error('解析日誌內容錯誤:', error);
      return { action: logContent || '未知操作', description: '解析錯誤' };
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
                    const { action, description } = parseLogContent(log.log);
                    
                    return (
                      <tr key={index}>
                        <td>{formatDate(log.employee_log_date)}</td>
                        <td>{log.employee_id || 'N/A'}</td>
                        <td>{log.employee_name || '未知員工'}</td>
                        <td>
                          {actionLabels[action] || action}
                          {description && (
                            <span style={{ marginLeft: '8px', color: '#666' }}>
                              {description}
                            </span>
                          )}
                        </td>
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