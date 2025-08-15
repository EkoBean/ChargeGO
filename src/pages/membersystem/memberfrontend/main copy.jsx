import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./register";
import Login from "./login";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* 可加首頁或其他頁面 */}
        <Route path="*" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);