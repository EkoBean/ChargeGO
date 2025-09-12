//node charger_site.cjs
const API_BASE_URL = import.meta.env.VITE_API_BASE;

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json'
  }
};

const ApiService = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
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

      const activeChargers = chargers.filter(c => c.status === 'available').length;

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
    const s = String(value).trim();
    if (s.includes('T')) {
      const [d, t] = s.split('T');
      return `${d} ${t.length === 5 ? `${t}:00` : t}`;
    }
    return s;
  },

  // 站點 CRUD
  async updateSite(site_id, payload) {
    const body = {
      site_name: payload.site_name ?? payload.siteName,
      address: payload.address,
      longitude: this._parseCoordinate(payload.longitude ?? payload.lng),
      latitude: this._parseCoordinate(payload.latitude ?? payload.lat),
    };

    // 移除 undefined 欄位
    Object.keys(body).forEach(key => 
      body[key] === undefined && delete body[key]
    );

    return this.request(`/api/sites/${site_id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async createSite(payload) {
    console.log('Creating site with payload:', payload);

    const body = {
      site_name: String(payload.site_name ?? payload.siteName ?? "").trim(),
      address: String(payload.address ?? "").trim(),
      longitude: this._parseCoordinate(payload.longitude ?? payload.lng),
      latitude: this._parseCoordinate(payload.latitude ?? payload.lat),
    };

    console.log('Normalized body:', body);

    // 驗證必填欄位（包含經緯度）
    const errors = [];
    if (!body.site_name) errors.push("站點名稱不能為空");
    if (!body.address) errors.push("地址不能為空");
    if (body.longitude === undefined || body.longitude === null || Number.isNaN(body.longitude)) {
      errors.push("經度不能為空且必須為數字");
    }
    if (body.latitude === undefined || body.latitude === null || Number.isNaN(body.latitude)) {
      errors.push("緯度不能為空且必須為數字");
    }

    // 範圍檢查
    if (typeof body.longitude === 'number') {
      if (body.longitude < -180 || body.longitude > 180) {
        errors.push("經度必須在 -180 到 180 之間");
      }
    }
    if (typeof body.latitude === 'number') {
      if (body.latitude < -90 || body.latitude > 90) {
        errors.push("緯度必須在 -90 到 90 之間");
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

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

  // 訂單 CRUD
  async updateOrder(order_ID, payload) {
    const body = {
      uid: payload.uid != null ? Number(payload.uid) : undefined,
      start_date: payload.start_date ? this._normalizeDateTime(payload.start_date) : undefined,
      end: payload.end === '' ? null : this._normalizeDateTime(payload.end),
      site_id: payload.site_id != null ? Number(payload.site_id) : undefined,
      order_status: payload.order_status,
      charger_id: payload.charger_id != null ? Number(payload.charger_id) : undefined,
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

  async createOrder(payload) {
    const body = {
      uid: Number(payload.uid),
      start_date: this._normalizeDateTime(payload.start_date),
      end: payload.end ? this._normalizeDateTime(payload.end) : null,
      site_id: Number(payload.site_id),
      order_status: String(payload.order_status ?? "").trim(),
      charger_id: Number(payload.charger_id),
    };

    // 驗證必填欄位
    if (!body.uid || Number.isNaN(body.uid)) {
      throw new Error("用戶 ID 不能為空且必須為數字");
    }
    if (!body.start_date) {
      throw new Error("開始時間不能為空");
    }
    if (!body.site_id || Number.isNaN(body.site_id)) {
      throw new Error("站點 ID 不能為空且必須為數字");
    }
    if (!body.order_status) {
      throw new Error("訂單狀態不能為空");
    }
    if (!body.charger_id || Number.isNaN(body.charger_id)) {
      throw new Error("充電器 ID 不能為空且必須為數字");
    }

    return this.request(`/api/orders`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export default ApiService;
