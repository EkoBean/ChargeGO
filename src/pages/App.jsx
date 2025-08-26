// ======scss==========
import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import AppIndex from "./mapIndex/AppIndex";
import mberRegister from "./membersystem/mberregister";
import mberLogin from "./membersystem/mberlogin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<mberRegister />} />
        <Route path="/mberregister" element={<mberRegister />} />
        <Route path="/mberlogin" element={<mberLogin />} />
        <Route path="*" element={<mberRegister />} />
      </Routes>
    </>
  );
}

export default App;
