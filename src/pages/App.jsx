// ======scss==========
// import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================

import MapIndex from "./mapIndex/mapIndex";
// import Register from "./membersystem/register";
// import Login from "./membersystem/login";
import Mission from "./mall/mission";
import Shop from "./mall/shop";
import Login from './Login/Login';
import Mbre_login from './membersystem/mber_login';
import Mber_register from './membersystem/mber_register';
import Mber_discount from "./membersystem/mber_discount";
import Mber_Profile from "./membersystem/mber_profile";
import Mber_info from "./membersystem/mber_info";
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/coupon";
import NavbarWebsite from "../components/NavbarWebsite";
import Task from "./membersystem/Task";
import Mber_RentRecord from "./membersystem/mber_rentRecord";

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
        <Route path="/mber_profile" element={<Mber_Profile />} />
        <Route path="/mber_info" element={<Mber_info />} />
        <Route path="/Mber_discount" element={<Mber_discount />} />
        <Route path="/mber_rentRecord" element={<Mber_RentRecord />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/mber_login" element={<Mbre_login />} />
        <Route path="/mber_register" element={<Mber_register />} />
        <Route path="/Task" element={<Task />} />
        {/* <Route path="*" element={<Register />} /> */}
        {/* 這個以後可以來寫個no Found頁 */}
      </Routes>
    </>
  );
}

export default App;
