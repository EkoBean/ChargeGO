import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./register";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ...existing routes... */}
        <Route path="/register" element={<Register />} />
        {/* ...existing routes... */}
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
