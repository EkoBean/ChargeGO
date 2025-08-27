// ======scss==========
import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import AppIndex from "./mapIndex/AppIndex";
import Mber_Register from "./membersystem/mber_register";
import Mber_Login from "./membersystem/mber_login";
import Mber_Profile from "./membersystem/mber_profile";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Mber_Profile />} />
        <Route path="/mber_register" element={<Mber_Register />} />
        <Route path="/mber_login" element={<Mber_Login />} />
        <Route path="/mber_profile" element={<Mber_Profile />} />
        <Route path="*" element={<Mber_Register />} />
      </Routes>
    </>
  );
}

export default App;
