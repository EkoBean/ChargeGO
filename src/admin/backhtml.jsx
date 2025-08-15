// import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './backfrom/views/AdminDashboard';
// import UserManagement from './backfrom/views/UserManagement';
// import OrderManagement from './backfrom/views/OrderManagement';
// import SiteManagement from './backfrom/views/SiteManagement';
// import SystemSettings from './backfrom/views/SystemSettings';
import Charging from './backfrom/views/charging';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <Routes>
        {/* 後台管理路由 */}
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* <Route path="/users" element={<UserManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/sites" element={<SiteManagement />} />
        <Route path="/charging" element={<Charging />} />
        <Route path="/settings" element={<SystemSettings />} /> */}
      </Routes>
    </>
  );
}

export default App;
