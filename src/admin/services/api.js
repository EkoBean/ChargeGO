//前端
const API_BASE_URL = 'http://127.0.0.1:3000';

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json'
  }
};

const ApiService = {
  async request(endpoint, options = {}) {
    try {
      console.log('發送 API 請求:', `${API_BASE_URL}${endpoint}`); // 加入 debug

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      });

      const responseText = await response.text();
      console.log('API 回應狀態:', response.status); // 加入 debug
      console.log('API 回應內容:', responseText); // 加入 debug

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error('JSON 解析失敗:', e);
        data = responseText;
      }

      if (!response.ok) {
        const message = (data && data.message) ? data.message : `API Error: ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.response = response;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // 用戶相關 API
  async getUsers() {
    return this.request('/user/list');
  },

  async getUserOrders(uid) {
    const orders = await this.request('/api/orders');
    return orders.filter(order => order.uid === uid);
  },

  // 站點相關 API
  async getSites() {
    return this.request('/api/sites');
  },

  async getSiteChargers(siteId) {
    return this.request(`/api/sites/${siteId}/chargers`);
  },

  // 充電器相關 API
  async getChargers() {
    return this.request('/api/chargers');
  },

  // 訂單相關 API
  async getOrders() {
    return this.request('/api/orders');
  },

  // === 新增：職員紀錄 API ===
  async getEmployeeLogs() {
    return this.request('/api/employee_log');
  },

  async getEmployees() {
    return this.request('/api/employees');
  },

  // 銀行卡片相關 API
  async getBankCards() {
    return this.request('/bank/cards');
  },

  async getUserCardMatch(uid) {
    return this.request(`/user/${uid}/card/match`);
  },

  // 統計資料 API
  async getDashboardStats() {
    try {
      const [users, sites, chargers, orders] = await Promise.all([
        this.getUsers(),
        this.getSites(),
        this.getChargers(),
        this.getOrders()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order =>
        order.start_date && order.start_date.startsWith(today)
      ).length;
      //判斷 active 狀態 2:使用中 3:預約中 會顯示在總覽
      const activeChargers = chargers.filter(c => c.status === '2' || c.status === '3').length;

      return {
        totalUsers: users.length,
        totalSites: sites.length,
        totalChargers: chargers.length,
        activeChargers,
        todayOrders,
        revenue: orders.length * 50 // 假設平均收入
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },

  async updateUser(uid, payload) {
    // 與 getUsers('/user/list') 同風格，假設後端為 PUT /user/:uid
    return this.request(`/user/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 通用工具方法
  _parseCoordinate(value) {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    // 若已是數字則直接回傳
    if (typeof value === 'number') {
      return value;
    }

    // 嘗試轉換成數字
    const num = parseFloat(String(value).trim());
    return Number.isNaN(num) ? undefined : num;
  },

  _normalizeDateTime(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  },

  // ========== update sites ======================
  async updateSite(site_id, payload) {
    const body = {
      site_id: Number(site_id),
      country: payload.country,
      site_name: payload.site_name ?? payload.siteName,
      address: payload.address,
      longitude: this._parseCoordinate(payload.longitude ?? payload.lng),
      latitude: this._parseCoordinate(payload.latitude ?? payload.lat),
    };

    // 移除 undefined 欄位
    Object.keys(body).forEach(key =>
      body[key] === undefined && delete body[key]
    );

    return this.request(`/api/sites`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  // ===========  create site ======================
  async createSite(payload) {
    console.log('Creating site with payload:', payload);

    const body = {
      country: payload.country,
      site_name: payload.site_name ?? payload.siteName,
      address: payload.address,
      longitude: this._parseCoordinate(payload.longitude ?? payload.lng),
      latitude: this._parseCoordinate(payload.latitude ?? payload.lat),
    };


    try {
      const result = await this.request(`/api/sites`, {
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

  // 訂單 CRUD start_date取今天
  async updateOrder(order_ID, payload) {
    const body = {
      uid: payload.uid != null ? Number(payload.uid) : undefined,
      start_date: payload.start_date ? this._normalizeDateTime(payload.start_date) : undefined,
      end: payload.end === '' ? null : this._normalizeDateTime(payload.end),
      rental_site_id: payload.rental_site_id != null ? Number(payload.rental_site_id) : undefined, // 改這裡
      return_site_id: payload.return_site_id != null ? Number(payload.return_site_id) : undefined, // 新增這裡
      order_status: payload.order_status,
      charger_id: payload.charger_id != null ? Number(payload.charger_id) : undefined,
      comment: typeof payload.comment !== 'undefined' ? String(payload.comment) : undefined,
      total_amount: payload.total_amount != null ? Number(payload.total_amount) : undefined, // 新增這裡
    };

    // 移除 undefined 欄位
    Object.keys(body).forEach(key =>
      body[key] === undefined && delete body[key]
    );

    return this.request(`/api/orders/${order_ID}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // 獲取單個用戶資訊 - 加強錯誤處理
  async getUserById(uid) {
    console.log('API: 查詢用戶 ID:', uid, typeof uid); // 加入 debug 日誌

    if (!uid) {
      throw new Error('用戶ID不能為空');
    }

    try {
      const result = await this.request(`/api/users/${uid}`);
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
    if (!payload.rental_site_id || Number.isNaN(Number(payload.rental_site_id))) { // 改這裡
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

    const body = {
      uid: Number(payload.uid),
      start_date: this._normalizeDateTime(payload.start_date),
      end: payload.end ? this._normalizeDateTime(payload.end) : null,
      rental_site_id: Number(payload.rental_site_id), // 改這裡
      return_site_id: payload.return_site_id ? Number(payload.return_site_id) : null, // 新增這裡
      order_status: String(payload.order_status),
      charger_id: Number(payload.charger_id),
      comment: payload.comment || null,
      total_amount: payload.total_amount || 0 // 新增這裡
    };

    console.log('Normalized order body:', body);

    try {
      const result = await this.request(`/api/orders`, {
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

  async getSystemStatus() {
    return this.request('/api/system-status');
  },

  // 假設這是您的 API 呼叫函數
  async saveOrderData(orderData) {
    // 複製一份數據進行處理
    const data = { ...orderData };

    // 確保關鍵字段存在
    if (!data.start_date) {
      throw new Error("開始時間不能為空");
    }

    if (!data.uid) {
      throw new Error("用戶ID不能為空");
    }

    if (!data.rental_site_id) { // 改這裡
      throw new Error("租借站點不能為空");
    }

    if (!data.charger_id) {
      throw new Error("充電器不能為空");
    }

    // 發送請求 - 修正 URL
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, { // 加入完整 URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '儲存訂單失敗');
      }

      return await response.json();
    } catch (error) {
      console.error('API 錯誤:', error);
      throw error;
    }
  },

  // 活動相關 API - 新增這些方法
  async getEvents() {
    return this.request('/api/events');
  },

  async getEventById(eventId) {
    return this.request(`/api/events/${eventId}`);
  },

  async createEvent(payload) {
    console.log('Creating event with payload:', payload);

    const body = {
      event_title: String(payload.event_title || "").trim(),
      event_content: String(payload.event_content || "").trim(),
      site_id: payload.site_id || null,
      event_start_date: payload.event_start_date,
      event_end_date: payload.event_end_date
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
      const result = await this.request(`/api/events`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('Event created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
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

    return this.request(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteEvent(eventId) {
    return this.request(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // 發送活動給用戶
  async sendEventToUsers(eventId, targetUsers) {
    return this.request(`/api/events/${eventId}/send`, {
      method: 'POST',
      body: JSON.stringify({ targetUsers }),
    });
  },

  // 獲取活躍用戶列表
  async getActiveUsers() {
    return this.request('/api/users/active');
  },

  // 任務 / missions
  async getMissions() {
    return this.request('/api/missions');
  },

  async getMissionById(missionId) {
    return this.request(`/api/missions/${missionId}`);
  },

  async createMission(payload) {
    console.log('Creating mission with payload:', payload);

    const body = {
      mission_title: String(payload.mission_title || "").trim(),
      mission_content: String(payload.mission_content || "").trim(),
      site_id: payload.site_id || null,
      mission_start_date: payload.mission_start_date,
      mission_end_date: payload.mission_end_date
    };

    // 驗證必填欄位
    const errors = [];
    if (!body.mission_title) errors.push("任務標題不能為空");
    if (!body.mission_content) errors.push("任務內容不能為空");
    if (!body.mission_start_date) errors.push("開始時間不能為空");
    if (!body.mission_end_date) errors.push("結束時間不能為空");

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    console.log('Normalized mission body:', body);

    try {
      const result = await this.request(`/api/missions`, {
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

    return this.request(`/api/missions/${missionId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteMission(missionId) {
    return this.request(`/api/missions/${missionId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
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
