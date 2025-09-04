// ======scss==========
import React, { useEffect } from "react";
import WebSite from "./ImageWebsite/WebSite";

// =========== Routers =================
import { Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import MapIndex from "./mapIndex/mapIndex";
// import Register from "./membersystem/register";
// import Login from "./membersystem/login";
import Mission from "./mall/mission";
import Shop from "./mall/shop";
import Login from './Login/Login';
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/checkout_coupon";
import MemberLogin from "./membersystem/login";
import NavbarWebsite from "../components/NavBarWebsite";

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

        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/MemberLogin" element={<MemberLogin />} />
        {/* <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
