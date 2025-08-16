//node charger_site.cjs
const API_BASE_URL = 'http://127.0.0.1:3000';

const ApiService = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
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

  // 站點 CRUD
  async updateSite(site_id, payload) {
    return this.request(`/api/sites/${site_id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async createSite(payload) {
    return this.request(`/api/sites`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 訂單 CRUD
  async updateOrder(order_ID, payload) {
    return this.request(`/api/orders/${order_ID}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async createOrder(payload) {
    return this.request(`/api/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default ApiService;
