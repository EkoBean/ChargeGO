// ======scss==========
// import "../styles/scss/global.scss";
import React, { useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================

import MapIndex from "./mapIndex/mapIndex";
import MissionWrapper from "./mall/mission";
import ShopWrapper from "./mall/shop";
import Mbre_login from "./membersystem/mber_login";
import Mber_ForgotPwd from "./membersystem/mber_forgotpwd";
import Mber_register from "./membersystem/mber_register";
import Mber_Profile from "./membersystem/mber_profile";
import Mber_info from "./membersystem/mber_info";
import Mber_contact from "./membersystem/mber_contact";
import Mber_edit from "./membersystem/mber_edit";
import Mber_RentRecord from "./membersystem/mber_rentRecord";
import Mber_addCreditcard from "./membersystem/mber_addCreditcard";
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/checkout_coupon";
import Task from "./membersystem/Task";

// index
import WebSite from "./ImageWebsite/WebSite";

// nav
import NavBarWebsite from '../components/NavBarWebsite'

function App() {
  return (
    <>
      {/* <NavBarWebsite /> */}
      <Routes>
        {/* index */}
        <Route path="/Website" element={<WebSite />} />

        {/* map index */}
        <Route path="/MapIndex" element={<MapIndex />} />

        {/* store system */}
        <Route path="/Mission" element={<MissionWrapper />} />
        <Route path="/Shop" element={<ShopWrapper />}></Route>
        <Route path="/Coupon" element={<Coupon />}></Route>
        <Route path="/CheckoutCoupons" element={<CheckoutCoupons />}></Route>
        <Route path="/Task" element={<Task />} />

        {/* membersystem */}
        <Route path="/" element={<Mbre_login />} />
        <Route path="/mber_login" element={<Mbre_login />} />
        <Route path="/mber_forgotpwd" element={<Mber_ForgotPwd />} />
        <Route path="/mber_register" element={<Mber_register />} />
        <Route path="/mber_profile" element={<Mber_Profile />} />
        <Route path="/mber_info" element={<Mber_info />} />
        <Route path="/mber_contact" element={<Mber_contact />} />
        <Route path="/mber_edit" element={<Mber_edit />} />
        <Route path="/mber_rentRecord" element={<Mber_RentRecord />} />
        <Route path="/mber_addCreditcard" element={<Mber_addCreditcard />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/Task" element={<Task />} />
        {/* <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
