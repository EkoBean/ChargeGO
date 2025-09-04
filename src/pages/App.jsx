// ======scss==========
// import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import MapIndex from "./mapIndex/mapIndex";
// import Register from "./membersystem/register";
// import Login from "./membersystem/login";
import Mission from "./mall/mission";
import Shop from "./mall/shop";
import Login from './Login/Login';
import Mbre_login from './membersystem/mber_login';
import Mber_register from './membersystem/mber_register';
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/checkout_coupon";
import MemberLogin from "./MemberLogin";
import NavbarWebsite from "../components/NavbarWebsite";
import Task from "./Task";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<NavbarWebsite />} />
        <Route path="/MapIndex" element={<MapIndex />} />
        <Route path="/Mission" element={<Mission />} />
        <Route path="/Shop" element={<Shop />}></Route>
        <Route path="/Coupon" element={<Coupon />}></Route>
        <Route path="/CheckoutCoupons" element={<CheckoutCoupons />}></Route>
        <Route path="/Task" element={<Task />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/mber_login" element={<Mbre_login />} />
        <Route path="/mber_register" element={<Mber_register />} />
        <Route path="/MemberLogin" element={<MemberLogin />} />
        <Route path="/Task" element={<Task />} />
        {/* <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
