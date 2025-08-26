//創建共享資料的 Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AdminDataContext = createContext();

export const useAdminData = () => useContext(AdminDataContext);

export const AdminDataProvider = ({ children }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalChargers: 0,
    activeChargers: 0,
    todayOrders: 0,
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData, sitesData, chargersData, ordersData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getUsers(),
        ApiService.getSites(),
        ApiService.getChargers(),
        ApiService.getOrders(),
      ]);

      setDashboardStats(statsData);
      setUsers(usersData);
      setSites(sitesData);
      setChargers(chargersData);
      setOrders(ordersData);
    } catch (err) {
      setError("載入資料失敗，請稍後再試");
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 其他資料處理函數
  const getOrderStatusText = (status) => {
    switch (String(status)) {
      case "-1": return "已取消";
      case "0": return "進行中";
      case "1": return "已完成";
      case "active": return "進行中";
      case "completed": return "已完成";
      case "cancelled": return "已取消";
      default: return status;
    }
  };

  const value = {
    dashboardStats,
    users,
    sites,
    chargers,
    orders,
    loading,
    error,
    loadAllData,
    setUsers,
    setSites,
    setOrders,
    setChargers,
    getOrderStatusText,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};