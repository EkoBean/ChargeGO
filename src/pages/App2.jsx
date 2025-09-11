// ======scss==========
// import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================

import Notify from "../components/notify";
import Mbre_login from "./membersystem/mber_login";
import Mber_Profile from "./membersystem/mber_profile";
import Mber_info from "./membersystem/mber_info";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Notify />} />
        <Route path="/mber_login" element={<Mbre_login />} />
        <Route path="/mber_profile" element={<Mber_Profile />} />
        <Route path="/mber_info" element={<Mber_info />} />
      </Routes>
    </>
  );
}

export default App;
