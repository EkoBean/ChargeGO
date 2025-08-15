//node charger_site.cjs
const API_BASE_URL = 'http://127.0.0.1:3000';

class ApiService {
  static async request(endpoint, options = {}) {
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
  }

  // 用戶相關 API
  static async getUsers() {
    return this.request('/user/list');
  }

  static async getUserOrders(uid) {
    const orders = await this.request('/api/orders');
    return orders.filter(order => order.uid === uid);
  }

  // 站點相關 API
  static async getSites() {
    return this.request('/api/sites');
  }

  static async getSiteChargers(siteId) {
    return this.request(`/api/sites/${siteId}/chargers`);
  }

  // 充電器相關 API
  static async getChargers() {
    return this.request('/api/chargers');
  }

  // 訂單相關 API
  static async getOrders() {
    return this.request('/api/orders');
  }

  // 銀行卡片相關 API
  static async getBankCards() {
    return this.request('/bank/cards');
  }

  static async getUserCardMatch(uid) {
    return this.request(`/user/${uid}/card/match`);
  }

  // 統計資料 API
  static async getDashboardStats() {
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
  }
}

export default ApiService;
