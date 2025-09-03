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
<<<<<<< HEAD
import NavbarWebsite from "../components/NavBarWebsite";
=======
import Coupon from "./mall/coupon";
import CheckoutCoupons from "./mall/checkout_coupon";
import MemberLogin from "./MemberLogin";
import NavbarWebsite from "../components/NavbarWebsite";
import Task from "./Task";

>>>>>>> 2b727fd355963d6bc4e87fbf41773dc92a3832e1
function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<NavbarWebsite />} />
        <Route path="/AppIndex" element={<AppIndex />} />
<<<<<<< HEAD
        {/* <Route path="/Mission" element={<Mission />} />
        <Route path="/Shop" element={<Shop />}></Route> */}
        <Route path="/" element={<WebSite />} />
=======
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
>>>>>>> 2b727fd355963d6bc4e87fbf41773dc92a3832e1
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
