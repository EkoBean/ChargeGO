import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/AdminLayout';
import Login from './components/Login';
import OperationLogger from '../../backend/operationLogger'; // 新增這行

import AdminDashboard from './views/AdminDashboard';
import UserManagement from './views/UserManagement';
import SiteManagement from './views/SiteManagement';
import OrderManagement from './views/OrderManagement';
import ActivityBroadcast from './views/ActivityBroadcast';
import StaffLogs from './views/StaffLogs';
import TaskManagement from './views/TaskManagement';

// 先載入 Bootstrap，再載入自定義樣式，確保自定義樣式優先
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../styles/scss/adminstyle/frontend.scss';
import '../styles/scss/adminstyle/AdminDashboard.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 只要 localStorage 有 employeeName 就保持登入
    const employeeName = localStorage.getItem('employeeName');
    if (employeeName) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  // 計算會話持續時間
  const calculateSessionDuration = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const duration = Date.now() - new Date(loginTime).getTime();
      return Math.floor(duration / 1000); // 回傳秒數
    }
    return 0;
  };

  // 修改登出處理函數，加入操作記錄
  const handleLogout = async () => {
    try {
      // 記錄登出操作
      await OperationLogger.log(OperationLogger.ACTIONS.LOGOUT, {
        employee_name: localStorage.getItem('employeeName') || '未知員工',
        logout_time: new Date().toISOString(),
        session_duration: calculateSessionDuration(),
        status: 'success'
      });
    } catch (err) {
      console.warn('記錄登出操作失敗:', err);
    } finally {
      // 清除本地儲存
      localStorage.removeItem('employeeName');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('loginTime');
      
      // 執行登出
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AdminDataProvider>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          {/*/dashboard 管理員儀表板 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} /> 
          <Route path="/users" element={<UserManagement />} />
          <Route path="/sites" element={<SiteManagement />} />
          <Route path="/chargers" element={<SiteManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/events" element={<ActivityBroadcast />} />
          <Route path="/employee-log" element={<StaffLogs />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </AdminDataProvider>
  );
}

export default App;
