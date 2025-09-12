//創建操作日誌工具函數
//功能：記錄員工的各種操作行為到後端數據庫
class OperationLogger {
  static async log(action, details = {}) {
    try {
      const employeeName = localStorage.getItem('employeeName') || '未知員工';
      let employeeId = localStorage.getItem('employeeId');
      
      // 檢查是否有 employeeId
      if (!employeeId) {
        if (action === 'LOGIN_FAILED') {
          employeeId = null;
        } else {
          console.warn('沒有 employee_id，無法記錄操作日誌');
          return;
        }
      } else {
        employeeId = parseInt(employeeId);
        if (isNaN(employeeId)) {
          console.warn('employee_id 不是有效數字:', localStorage.getItem('employeeId'));
          return;
        }
      }
      
      // 修改：直接使用中文格式的 logContent
      let logContent = '';
      if (action === 'CREATE_ORDER' && details.order_ID) {
        logContent = `新增租借訂單 #${details.order_ID}`;
      } else if (action === 'CREATE_EVENT' && details.event_title) {
        logContent = `建立活動 ${details.event_title}`;
      } else if (action === 'UPDATE_USER') {
        logContent = `修改用戶資訊`;
      } else if (action === 'LOGIN') {
        logContent = `登入系統`;
      } else if (action === 'LOGOUT') {
        logContent = `登出系統`;
      } else {
        // 通用中文格式：動作 + 詳細資訊
        const actionText = {
          'CREATE_SITE': '新增站點',
          'UPDATE_SITE': '更新站點',
          'DELETE_SITE': '刪除站點',
          'CREATE_CHARGER': '新增充電器',
          'UPDATE_CHARGER': '更新充電器',
          'DELETE_CHARGER': '刪除充電器',
          'VIEW_REPORTS': '查看報表',
          'EXPORT_DATA': '匯出資料',
          'CREATE_USER': '新增用戶',
          'DELETE_USER': '刪除用戶',
          'UPDATE_ORDER': '修改租借訂單',
          'DELETE_ORDER': '刪除租借訂單',
          'VIEW_ORDER': '查看租借訂單',
          'UPDATE_EVENT': '修改活動',
          'DELETE_EVENT': '刪除活動',
          'SEND_EVENT': '發送活動通知',
          'VIEW_EVENT': '查看活動',
          'LOGIN_FAILED': '登入失敗'
        }[action] || action;
        
        if (details && Object.keys(details).length > 0) {
          const detailsStr = Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ');
          logContent = `${actionText} (${detailsStr})`;
        } else {
          logContent = actionText;
        }
      }

      // 嚴格限制總長度
      if (logContent.length > 100) {
        logContent = logContent.substring(0, 97) + '...';
      }
      
      const logData = {
        employee_id: employeeId,
        log: logContent
      };

      console.log('準備發送日誌數據:', logData);

      const response = await fetch('http://127.0.0.1:3000/api/employee_log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API 回應錯誤:', errorData);
        throw new Error(`記錄日誌失敗: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('日誌記錄成功:', result);
      return result;
    } catch (err) {
      console.error('記錄操作日誌失敗:', err);
    }
  }

  // 預定義的操作類型
  static ACTIONS = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    CREATE_SITE: 'CREATE_SITE',
    UPDATE_SITE: 'UPDATE_SITE',
    DELETE_SITE: 'DELETE_SITE',
    VIEW_SITE: 'VIEW_SITE',
    CREATE_CHARGER: 'CREATE_CHARGER',
    UPDATE_CHARGER: 'UPDATE_CHARGER',
    DELETE_CHARGER: 'DELETE_CHARGER',
    VIEW_REPORTS: 'VIEW_REPORTS',
    EXPORT_DATA: 'EXPORT_DATA',
    UPDATE_USER: 'UPDATE_USER',
    CREATE_USER: 'CREATE_USER',
    DELETE_USER: 'DELETE_USER',
    // 新增訂單相關操作
    CREATE_ORDER: 'CREATE_ORDER',
    UPDATE_ORDER: 'UPDATE_ORDER',
    DELETE_ORDER: 'DELETE_ORDER',
    VIEW_ORDER: 'VIEW_ORDER',
    // 新增活動相關操作
    CREATE_EVENT: 'CREATE_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',
    SEND_EVENT: 'SEND_EVENT',
    VIEW_EVENT: 'VIEW_EVENT'
  };
}

export default OperationLogger;