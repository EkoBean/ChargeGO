// ======scss==========
import "../styles/scss/global.scss";
import React, { useEffect } from "react";
import WebSite from './ImageWebsite/WebSite';

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import AppIndex from "./mapIndex/AppIndex";
// import Register from "./membersystem/register";
// import Login from "./membersystem/login";
import Mission from "./mall/mission";
import Shop from "./mall/shop";
import Login from './Login/Login';
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AppIndex" element={<AppIndex />} />
        {/* <Route path="/Mission" element={<Mission />} />
        <Route path="/Shop" element={<Shop />}></Route> */}
        {/* <Route path="/" element={<WebSite />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} />
        <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
