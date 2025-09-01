import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/AdminLayout';
import Login from './components/Login';

// 導入所有頁面
import AdminDashboard from './views/AdminDashboard';
import UserManagement from './views/UserManagement';
import SiteManagement from './views/SiteManagement';
import OrderManagement from './views/OrderManagement';
import ActivityBroadcast from './views/ActivityBroadcast';
import StaffLogs from './views/StaffLogs';
import TaskManagement from './views/TaskManagement';
import SystemSettings from './views/SystemSettings';

import './App.css';
import './styles/AdminDashboard.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'admin_logged_in') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AdminDataProvider>
      <Routes>
        <Route 
          path="/*" 
          element={
            <AdminLayout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/sites" element={<SiteManagement />} />
                <Route path="/chargers" element={<SiteManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/events" element={<ActivityBroadcast />} />
                <Route path="/employee-log" element={<StaffLogs />} />
                <Route path="/tasks" element={<TaskManagement />} />
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          } 
        />
      </Routes>
    </AdminDataProvider>
  );
}

export default App;
