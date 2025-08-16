// import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './views/AdminDashboard'
// import Charging from './views/charging'
// import OrderManagement from './views/OrderManagement'
// import SiteManagement from './views/SiteManagement'
// import SystemSettings from './views/SystemSettings'
import UserManagement from './views/UserManagement'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* <Route path="/charging" element={<Charging />} /> */}
        {/* <Route path="/orders" element={<OrderManagement />} /> */}
        {/* <Route path="/sites" element={<SiteManagement />} /> */}
        {/* <Route path="/settings" element={<SystemSettings />} /> */}
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </>
  )
}

export default App
