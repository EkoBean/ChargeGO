// ======scss==========
import "../styles/scss/global.scss";
import React, { useEffect } from "react";
import WebSite from "./ImageWebsite/WebSite";

// =========== Routers =================
import { Routes, Route } from "react-router-dom";

// =========== elements ==================
import NavBar from "../components/nav";
import AppIndex from "./mapIndex/AppIndex";
// import Register from "./membersystem/register";
// import Login from "./membersystem/login";
import Mission from "./mall/mission";
import Shop from "./mall/shop";
import Login from './Login/Login';
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/checkout_coupon";
import MemberLogin from "./MemberLogin";
import NavbarWebsite from "../components/NavbarWebsite";
import Task from "./Task";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AppIndex" element={<AppIndex />} />
        <Route path="/Mission" element={<Mission />} />
        <Route path="/Shop" element={<Shop />}></Route>
        <Route path="/Coupon" element={<Coupon />}></Route>
        <Route path="/CheckoutCoupons" element={<CheckoutCoupons />}></Route>
        <Route
          path="/"
          element={
            <>
              <Task />
            </>
          }
        />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/MemberLogin" element={<MemberLogin />} />
        <Route path="/Task" element={<Task />} />
        {/* <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
