// 創建共享資料的 Context，供後台各頁面使用

import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

// 建立 Context 實例
const AdminDataContext = createContext();

// 提供自訂 hook，方便在元件中取得 Context 資料
export const useAdminData = () => useContext(AdminDataContext);

// Context 提供者元件，包住所有需要用到資料的子元件
export const AdminDataProvider = ({ children }) => {
  // 儀表板統計資料
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalChargers: 0,
    activeChargers: 0,
    todayOrders: 0,
    revenue: 0,
  });

  // 各類資料狀態
  const [users, setUsers] = useState([]);         // 用戶資料
  const [sites, setSites] = useState([]);         // 站點資料
  const [chargers, setChargers] = useState([]);   // 充電器資料
  const [orders, setOrders] = useState([]);       // 訂單資料

  // 載入狀態與錯誤訊息
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 一次載入所有資料（儀表板、用戶、站點、充電器、訂單）
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 並行取得所有資料
      const [statsData, usersData, sitesData, chargersData, ordersData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getUsers(),
        ApiService.getSites(),
        ApiService.getChargers(),
        ApiService.getOrders(),
      ]);

      // 更新狀態
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

  // 頁面載入時自動載入所有資料
  useEffect(() => {
    loadAllData();
  }, []);

  // 訂單狀態文字轉換
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

  // Context 提供的資料與方法
  const value = {
    dashboardStats,   // 儀表板統計
    users,            // 用戶列表
    sites,            // 站點列表
    chargers,         // 充電器列表
    orders,           // 訂單列表
    loading,          // 是否載入中
    error,            // 錯誤訊息
    loadAllData,      // 重新載入所有資料
    setUsers,         // 更新用戶資料
    setSites,         // 更新站點資料
    setOrders,        // 更新訂單資料
    setChargers,      // 更新充電器資料
    getOrderStatusText, // 訂單狀態文字轉換
  };

  // 將資料提供給所有子元件
  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};