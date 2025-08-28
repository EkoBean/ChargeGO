import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './views/AdminDashboard';
import UserManagement from './views/UserManagement';
import SiteManagement from './views/SiteManagement';
import OrderManagement from './views/OrderManagement';
import SystemSettings from './views/SystemSettings';
import ActivityBroadcast from './views/ActivityBroadcast'; // 新增 import
import StaffLogs from './views/StaffLogs';                 // 新增 import
import TaskManagement from './views/TaskManagement';       // 新增 import
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/AdminDashboard.css';  
import './App.css';  

const App = () => (
  <AdminDataProvider>
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="sites" element={<SiteManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="broadcast" element={<ActivityBroadcast />} />
        <Route path="staff-logs" element={<StaffLogs />} />
        <Route path="tasks" element={<TaskManagement />} />
      </Route>
    </Routes>
  </AdminDataProvider>
);

export default App;
