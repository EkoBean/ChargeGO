// 前端呼叫後端 API

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000';

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json'
  }
};

const ApiService = {
  basePath: '/api/admin',

  // 添加 request 方法
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${this.basePath}${endpoint}`;
    const config = { ...defaultOptions, ...options };
    
    try {
      console.log('Requesting URL:', url);  // 添加日誌以便調試
      const response = await fetch(url, config);
      console.log('Response status:', response.status);  // 添加日誌
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  // 添加 getDashboardStats 方法（前端計算統計）
  async getDashboardStats() {
    // 由於後端沒有專用統計 API，這裡返回預設值
    // 前端會在 AdminDataContext 中從載入的資料計算實際統計
    return {
      totalUsers: 0,
      totalSites: 0,
      totalChargers: 0,
      activeChargers: 0,
      todayOrders: 0,
      totalOrders: 0,
      revenue: 0,
    };
  },

  // 添加 updateUser 方法
  async updateUser(uid, payload) {
    return this.request(`/user/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 用戶相關 API
  async getUsers() {
    return this.request('/user/list');  // ✅ 正確：對應 /api/admin/user/list
  },

  async getUserOrders(uid) {
    const orders = await this.request('/orders');  // ✅ 修正：移除多餘的 /api
    return orders.filter(order => order.uid === uid);
  },

  // 站點相關 API
  async getSites() {
    return this.request('/sites');  // ✅ 修正：對應 /api/admin/sites
  },

  async getSiteChargers(siteId) {
    try {
      const data = await this.request(`/sites/${siteId}/chargers`);  // ✅ 修正

      // 確保每個充電器對象都有租借信息字段，即使後端沒有返回
      return data.map(charger => ({
        ...charger,
        is_rented: charger.is_rented || 0,
        current_renter: charger.current_renter || null,
        current_renter_uid: charger.current_renter_uid || null,
        rented_since: charger.rented_since || null,
        current_order_id: charger.current_order_id || null,
        current_order_status: charger.current_order_status || null
      }));
    } catch (error) {
      console.error(`無法獲取站點 ${siteId} 的充電器:`, error);
      throw error;
    }
  },

  // 充電器相關 API
  async getChargers() {
    return this.request('/chargers');  // ✅ 修正：對應 /api/admin/chargers
  },

  // 訂單相關 API
  async getOrders() {
    return this.request('/orders');  // ✅ 修正：對應 /api/admin/orders
  },

  // 職員紀錄 API
  async getEmployeeLogs() {
    return this.request('/employee_log');  // ✅ 修正：對應 /api/admin/employee_log
  },

  async getEmployees() {
    return this.request('/employees');  // ✅ 修正：對應 /api/admin/employees
  },

  // 系統狀態
  async getSystemStatus() {
    return this.request('/system-status');  // ✅ 修正
  },

  // 活動相關 API
  async getEvents() {
    return this.request('/events');  // ✅ 修正：對應 /api/admin/events
  },

  async getEventById(eventId) {
    return this.request(`/events/${eventId}`);  // ✅ 修正
  },

  // 修改 createEvent 方法
  async createEvent(payload) {
    console.log('Creating event with payload:', payload);

    // 確保日期格式正確
    const formatDate = (date) => {
      if (!date) return null;
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return date;
    };

    const body = {
      event_title: String(payload.event_title || "").trim(),
      event_content: String(payload.event_content || "").trim(),
      site_id: payload.site_id || null,
      event_start_date: formatDate(payload.event_start_date),
      event_end_date: formatDate(payload.event_end_date),
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)
    };

    // 驗證必填欄位
    const errors = [];
    if (!body.event_title) errors.push("活動標題不能為空");
    if (!body.event_content) errors.push("活動內容不能為空");
    if (!body.event_start_date) errors.push("開始時間不能為空");
    if (!body.event_end_date) errors.push("結束時間不能為空");

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    console.log('Normalized event body:', body);

    try {
      const result = await this.request('/events', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      console.log('Event created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw new Error(`建立活動失敗: ${error.message}`);
    }
  },

  async updateEvent(eventId, payload) {
    const body = {
      event_title: payload.event_title,
      event_content: payload.event_content,
      site_id: payload.site_id || null,
      event_start_date: payload.event_start_date,
      event_end_date: payload.event_end_date
    };

    // 移除 undefined 欄位
    Object.keys(body).forEach(key =>
      body[key] === undefined && delete body[key]
    );

    return this.request(`/events/${eventId}`, {  // ✅ 修正
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {  // ✅ 修正
      method: 'DELETE',
    });
  },

  // 訂單 CRUD start_date取今天
  async updateOrder(order_ID, payload) {
    console.log(`更新訂單 #${order_ID}，原始資料:`, payload);
    
    // 格式化日期時間欄位
    const normalizedPayload = {
      ...payload
    };
    
    // 處理 start_date
    if (payload.start_date) {
      normalizedPayload.start_date = this._formatDateTimeForMySQL(payload.start_date);
      console.log(`start_date 格式化: ${payload.start_date} -> ${normalizedPayload.start_date}`);
    }
    
    // 處理 end
    if (payload.end) {
      normalizedPayload.end = this._formatDateTimeForMySQL(payload.end);
      console.log(`end 格式化: ${payload.end} -> ${normalizedPayload.end}`);
    }
    
    console.log('格式化後的資料:', normalizedPayload);
    
    try {
      const data = await this.request(`/orders/${order_ID}`, {  // ✅ 修正
        method: 'PUT',
        body: JSON.stringify(normalizedPayload)
      });
      
      console.log(`訂單 #${order_ID} 更新成功:`, data);
      return data;
    } catch (error) {
      console.error(`更新訂單 #${order_ID} 失敗:`, error);
      throw error;
    }
  },

  // 獲取單個用戶資訊 - 加強錯誤處理
  async getUserById(uid) {
    console.log('API: 查詢用戶 ID:', uid, typeof uid); // 加入 debug 日誌

    if (!uid) {
      throw new Error('用戶ID不能為空');
    }

    try {
      const result = await this.request(`/users/${uid}`);  // ✅ 修正
      console.log('API: 查詢用戶成功:', result); // 加入 debug 日誌
      return result;
    } catch (error) {
      console.error('API: 查詢用戶失敗:', error);

      // 提供更友善的錯誤訊息
      if (error.status === 404) {
        throw new Error('用戶不存在');
      } else if (error.status >= 500) {
        throw new Error('伺服器錯誤，請稍後再試');
      }

      throw error;
    }
  },

  // 訂單 CRUD - 修正新增訂單（這個要改）
  async createOrder(payload) {
    console.log('Creating order with payload:', payload);

    // 驗證必填欄位 - 修正為 rental_site_id
    const errors = [];
    if (!payload.uid || Number.isNaN(Number(payload.uid))) {
      errors.push("用戶 ID 不能為空且必須為數字");
    }
    if (!payload.start_date) {
      errors.push("開始時間不能為空");
    }
    if (!payload.rental_site_id || Number.isNaN(Number(payload.rental_site_id))) {
      errors.push("租借站點不能為空且必須為數字");
    }
    if (payload.order_status === undefined || payload.order_status === null || payload.order_status === '') {
      errors.push("訂單狀態不能為空");
    }
    if (!payload.charger_id || Number.isNaN(Number(payload.charger_id))) {
      errors.push("充電器不能為空且必須為數字");
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    // 確保包含操作者ID
    const body = {
      uid: Number(payload.uid),
      start_date: this._normalizeDateTime(payload.start_date),
      end: payload.end ? this._normalizeDateTime(payload.end) : null,
      rental_site_id: Number(payload.rental_site_id),
      return_site_id: payload.return_site_id ? Number(payload.return_site_id) : null,
      order_status: String(payload.order_status),
      charger_id: Number(payload.charger_id),
      comment: payload.comment || null,
      total_amount: payload.total_amount || 0,
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)  // 確保操作者ID
    };

    console.log('Normalized order body:', body);

    try {
      const result = await this.request(`/orders`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('Order created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  // 任務相關 API
  async getMissions() {
    return this.request('/missions');  // ✅ 修正
  },

  async getMissionById(missionId) {
    return this.request(`/missions/${missionId}`);
  },

  // 修正 createMission 方法 - 參考 createSite 的邏輯
  async createMission(payload) {
    console.log('Creating mission with payload:', payload);

    const body = {
      title: String(payload.title || "").trim(),
      description: String(payload.description || "").trim(),
      type: payload.type || 'accumulated_hours',
      reward_points: parseInt(payload.reward_points) || 0,
      target_value: parseInt(payload.target_value) || 0,
      target_unit: payload.target_unit || 'Hours',
      mission_start_date: payload.mission_start_date || null,
      mission_end_date: payload.mission_end_date || null,
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)  // 確保操作者ID
    };

    // 驗證必填欄位
    const errors = [];
    if (!body.title) errors.push("任務標題不能為空");
    if (!body.description) errors.push("任務描述不能為空");
    if (!body.reward_points || body.reward_points <= 0) errors.push("獎勵點數必須大於 0");
    if (!body.target_value || body.target_value <= 0) errors.push("目標數值必須大於 0");

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    console.log('Normalized mission body:', body);

    try {
      const result = await this.request(`/missions`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('Mission created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create mission:', error);
      throw error;
    }
  },

  async updateMission(missionId, payload) {
    const body = {
      mission_title: payload.mission_title,
      mission_content: payload.mission_content,
      site_id: payload.site_id || null,
      mission_start_date: payload.mission_start_date,
      mission_end_date: payload.mission_end_date
    };

    // 移除 undefined 欄位
    Object.keys(body).forEach(key =>
      body[key] === undefined && delete body[key]
    );

    return this.request(`/missions/${missionId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteMission(missionId) {
    return this.request(`/missions/${missionId}`, {
      method: 'DELETE',
    });
  },

  // 添加日期格式化方法
  _formatDateTimeForMySQL(dateValue) {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      
      // 轉換為 MySQL DATETIME 格式: YYYY-MM-DD HH:MM:SS
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return null;
    }
  },

  // 修改 createSite 方法
  async createSite(payload) {
    console.log('Creating site with payload:', payload);
    
    const body = {
      site_name: String(payload.site_name || "").trim(),
      address: String(payload.address || "").trim(),
      longitude: payload.longitude,
      latitude: payload.latitude,
      country: payload.country || "",
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)  // 添加操作者ID
    };
    
    // 驗證必填欄位
    const errors = [];
    if (!body.site_name) errors.push("站點名稱不能為空");
    if (!body.address) errors.push("地址不能為空");
    if (!body.longitude) errors.push("經度不能為空");
    if (!body.latitude) errors.push("緯度不能為空");
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
    
    console.log('Normalized site body:', body);
    
    try {
      const result = await this.request('/sites', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('Site created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create site:', error);
      throw error;
    }
  },

  // 修改 updateSite 方法
  async updateSite(siteId, payload) {
    console.log('Updating site with payload:', payload);
    
    const body = {
      site_name: String(payload.site_name || "").trim(),
      address: String(payload.address || "").trim(),
      longitude: payload.longitude,
      latitude: payload.latitude,
      country: payload.country || "",
      site_id: siteId,  // 後端 PATCH 需要 site_id
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)  // 添加操作者ID
    };
    
    // 驗證必填欄位
    const errors = [];
    if (!body.site_name) errors.push("站點名稱不能為空");
    if (!body.address) errors.push("地址不能為空");
    if (!body.longitude) errors.push("經度不能為空");
    if (!body.latitude) errors.push("緯度不能為空");
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
    
    console.log('Normalized site body:', body);
    
    try {
      const result = await this.request('/sites', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      console.log('Site updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to update site:', error);
      throw error;
    }
  },

  // 讓日期格式化方法可重用
  _normalizeDateTime(dateValue) {
    return this._formatDateTimeForMySQL(dateValue);
  },

  // 新增登出方法
  async logout() {
    const employeeId = localStorage.getItem('employeeId');
    const employeeName = localStorage.getItem('employeeName');
    
    if (employeeId) {
      try {
        // 記錄登出操作
        await this.request('/employee_log', {
          method: 'POST',
          body: JSON.stringify({
            employee_id: employeeId,
            log: `LOGOUT-${JSON.stringify({
              id: employeeId,
              name: employeeName,
              timestamp: new Date().toISOString(),
              status: 'success'
            })}`
          })
        });
      } catch (error) {
        console.error('記錄登出操作失敗:', error);
      }
    }

    // 清除本地儲存的登入資訊
    localStorage.removeItem('adminToken');
    localStorage.removeItem('employeeName');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('loginTime');
  },

  // 新增充電器相關 API
  async createCharger(payload) {
    console.log('Creating charger with payload (raw):', payload);

    // 確保狀態值為字串
    const status = String(payload.status);
    
    // 驗證狀態值
    const validStatuses = ['-1', '0', '1', '2', '3', '4'];
    if (!validStatuses.includes(status)) {
      throw new Error(`無效的狀態值: ${payload.status}`);
    }

    const body = {
      charger_id: parseInt(payload.charger_id, 10),
      site_id: payload.site_id,
      status: status,  // 使用字串形式的狀態值
      operator_id: payload.operator_id || parseInt(localStorage.getItem('employeeId'), 10)
    };

    console.log('Creating charger - normalized body (to send):', body);

    try {
      const result = await this.request('/chargers', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      console.log('Charger created successfully (response):', result);
      return result;
      
    } catch (error) {
      console.error('Failed to create charger:', error);
      throw new Error(`建立充電器失敗: ${error.message}`);
    }
  },

  async updateCharger(chargerId, payload) {
    return this.request(`/chargers/${chargerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteCharger(chargerId) {
    return this.request(`/chargers/${chargerId}`, {
      method: 'DELETE',
    });
  },

};

// 訂單相關 API 函數
export const saveOrderData = async (orderData) => {
  // 修正必要欄位檢查
  const requiredFields = ['uid', 'rental_site_id', 'charger_id', 'start_date']; // 改這裡
  for (const field of requiredFields) {
    if (!orderData[field]) {
      const fieldName = {
        'uid': '用戶ID',
        'rental_site_id': '租借站點', // 改這裡
        'charger_id': '充電器',
        'start_date': '開始時間'
      }[field] || field;
      throw new Error(`${fieldName} 不能為空`);
    }
  }

  console.log('發送訂單資料到後端:', orderData);

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {  // ✅ 修正：使用完整路徑
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '儲存訂單失敗');
    }

    return await response.json();
  } catch (error) {
    console.error('API 請求失敗:', error);
    throw error;
  }
};


export default ApiService;
