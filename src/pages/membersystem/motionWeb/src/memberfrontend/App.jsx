import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./register";
import Login from "./login";

// 將 App 重構為正常的 React 元件，專門負責路由
function App() {
  return (
    <Routes>
      {/* 首頁顯示註冊頁面 */}
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      {/* 未匹配路由導向註冊頁面 */}
      <Route path="*" element={<Register />} />
    </Routes>
  );
}

export default App;
  