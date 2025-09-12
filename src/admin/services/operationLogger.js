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
      
      // 簡化日誌內容，移除不必要的資訊
      let logContent = action;
      
      if (details && Object.keys(details).length > 0) {
        const coreInfo = {};
        
        switch (action) {
          case 'LOGIN':
          case 'LOGIN_FAILED':
            if (details.email) coreInfo.email = details.email.substring(0, 20);
            if (details.status) coreInfo.status = details.status;
            break;
          case 'LOGOUT':
            // 移除會話時間顯示
            break;
          case 'UPDATE_USER':
          case 'CREATE_USER':
          case 'DELETE_USER':
            if (details.user_id || details.uid) coreInfo.id = details.user_id || details.uid;
            if (details.status) coreInfo.result = details.status;
            break;
          case 'UPDATE_ORDER':
          case 'CREATE_ORDER':
          case 'DELETE_ORDER':
          case 'VIEW_ORDER':
            // 只記錄訂單ID，移除其他資訊
            if (details.id || details.order_id) coreInfo.id = details.id || details.order_id;
            if (details.status) coreInfo.result = details.status;
            break;
          case 'CREATE_SITE':
          case 'UPDATE_SITE':
          case 'DELETE_SITE':
            if (details.site_id || details.id) coreInfo.id = details.site_id || details.id;
            if (details.status) coreInfo.result = details.status;
            break;
          case 'CREATE_CHARGER':
          case 'UPDATE_CHARGER':
          case 'DELETE_CHARGER':
            if (details.charger_id || details.id) coreInfo.id = details.charger_id || details.id;
            if (details.status) coreInfo.result = details.status;
            break;
          case 'CREATE_EVENT':
          case 'UPDATE_EVENT':
          case 'DELETE_EVENT':
          case 'SEND_EVENT':
          case 'VIEW_EVENT':
            if (details.event_id || details.id) coreInfo.id = details.event_id || details.id;
            if (details.status) coreInfo.result = details.status;
            break;
          default:
            // 對於其他操作，只記錄基本資訊
            if (details.id) coreInfo.id = details.id;
            if (details.status) coreInfo.result = details.status;
        }
        
        if (Object.keys(coreInfo).length > 0) {
          let infoStr = JSON.stringify(coreInfo);
          
          // 如果還是太長，只保留ID和結果
          if (infoStr.length > 50) {
            const simplified = {};
            if (coreInfo.id) simplified.id = coreInfo.id;
            if (coreInfo.result) simplified.result = coreInfo.result;
            infoStr = JSON.stringify(simplified);
          }
          
          logContent = `${action}-${infoStr}`;
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