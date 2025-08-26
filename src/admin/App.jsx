import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './views/AdminDashboard';
import UserManagement from './views/UserManagement';
import SiteManagement from './views/SiteManagement';
import OrderManagement from './views/OrderManagement';
import SystemSettings from './views/SystemSettings';
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
      </Route>
    </Routes>
  </AdminDataProvider>
);

export default App;
