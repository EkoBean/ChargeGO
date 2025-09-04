// ======scss==========
// import "../styles/scss/global.scss";
import React, { useEffect } from "react";

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// =========== elements ==================
<<<<<<< HEAD


import Mber_Register from "./membersystem/mber_register";
import Mber_Login from "./membersystem/mber_login";
import Mber_Profile from "./membersystem/mber_profile";
import Mber_Info from "./membersystem/mber_info";
import Task from "./membersystem/Task";
=======
import NavBar from "../components/nav";
import MapIndex from "./mapIndex/mapIndex";
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
>>>>>>> main

function App() {
  return (
    <>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Mber_Login />} />
        <Route path="/mber_register" element={<Mber_Register />} />
        <Route path="/mber_info" element={<Mber_Info />} />
        <Route path="/mber_login" element={<Mber_Login />} />
        <Route path="/mber_profile" element={<Mber_Profile />} />
        <Route path="/task" element={<Task />} />
        <Route path="*" element={<Mber_Register />} />
=======
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<NavbarWebsite />} />
        <Route path="/MapIndex" element={<MapIndex />} />
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
>>>>>>> main
      </Routes>
    </>
  );
}

export default App;
