//創建操作日誌工具函數
//功能：記錄員工的各種操作行為到後端數據庫
class OperationLogger {
  static async log(action, details = {}) {
    try {
      const employeeName = localStorage.getItem('employeeName') || '未知員工';
      let employeeId = localStorage.getItem('employeeId');
      
      // 檢查是否有 employeeId
      if (!employeeId) {
        // 對於某些操作（如登入失敗），仍然要記錄，但使用 null 作為 employeeId
        if (action === 'LOGIN_FAILED') {
          employeeId = null;
        } else {
          console.warn('沒有 employee_id，無法記錄操作日誌');
          return;
        }
      } else {
        // 確保 employee_id 是數字
        employeeId = parseInt(employeeId);
        if (isNaN(employeeId)) {
          console.warn('employee_id 不是有效數字:', localStorage.getItem('employeeId'));
          return;
        }
      }
      
      // 大幅縮短日誌內容，確保不超過資料庫限制
      let logContent = action;
      
      // 只記錄最核心的資訊，避免超長
      if (details && Object.keys(details).length > 0) {
        const coreInfo = {};
        
        switch (action) {
          case 'LOGIN':
          case 'LOGIN_FAILED':
            if (details.email) coreInfo.email = details.email.substring(0, 20); // 限制長度
            if (details.status) coreInfo.status = details.status;
            break;
          case 'LOGOUT':
            if (details.session_duration) {
              const minutes = Math.floor(details.session_duration / 60);
              coreInfo.duration = `${minutes}min`;
            }
            break;
          case 'UPDATE_USER':
            if (details.user_id) coreInfo.uid = details.user_id;
            if (details.user_name) coreInfo.name = details.user_name.substring(0, 10);
            // 只記錄變更數量，不記錄具體內容
            if (details.changed_fields && Array.isArray(details.changed_fields)) {
              coreInfo.changes = `${details.changed_fields.length}項`;
            }
            if (details.status) coreInfo.result = details.status;
            break;
          case 'CREATE_SITE':
          case 'UPDATE_SITE':
          case 'DELETE_SITE':
            if (details.site_id) coreInfo.id = details.site_id;
            if (details.site_name) coreInfo.name = details.site_name.substring(0, 15);
            if (details.status) coreInfo.result = details.status;
            break;
          case 'CREATE_CHARGER':
          case 'UPDATE_CHARGER':
          case 'DELETE_CHARGER':
            if (details.charger_id) coreInfo.id = details.charger_id;
            if (details.status) coreInfo.result = details.status;
            break;
          default:
            // 對於其他操作，只記錄最基本資訊
            if (details.id) coreInfo.id = details.id;
            if (details.status) coreInfo.result = details.status;
        }
        
        if (Object.keys(coreInfo).length > 0) {
          // 進一步縮短 JSON 字串
          let infoStr = JSON.stringify(coreInfo);
          
          // 如果還是太長，只保留操作結果
          if (infoStr.length > 50) {
            if (coreInfo.result) {
              infoStr = `{"result":"${coreInfo.result}"}`;
            } else {
              infoStr = '{}';
            }
          }
          
          logContent = `${action}-${infoStr}`;
        }
      }
      
      // 嚴格限制總長度在 100 字符以內（假設資料庫是 varchar(100)）
      if (logContent.length > 100) {
        logContent = logContent.substring(0, 97) + '...';
      }
      
      const logData = {
        employee_id: employeeId,
        log: logContent
      };

      console.log('準備發送日誌數據:', logData);
      console.log('日誌長度:', logContent.length);

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
      // 不拋出錯誤，避免影響主要功能
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
    DELETE_USER: 'DELETE_USER'
  };
}

export default OperationLogger;