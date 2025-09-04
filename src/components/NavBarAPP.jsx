import React from 'react';
import '../styles/scss/NavBarAPP.scss';

<<<<<<< HEAD:src/components/NavBarPhone.jsx
export default function NavBarPhone() {

    const navigateTo = (path) => {
       window.location.href = `/${path}`;
    };
    
    return (
        <div className="navbar-phone-container">
            <div className="icon" onClick={() => navigateTo("mber_profile")}>
=======
export default function NavBarAPP() {
    
    return (
        <div className="navbar-phone-container">
            <div className="icon">
                <a href="">
>>>>>>> main:src/components/NavBarAPP.jsx
                <img id="myprofile" src="../public/myprofile.png" alt="user" />
                </a>
            </div>
            <div className="icon" onClick={() => navigateTo("gift")}>
                <img id="gift" src="../public/gift.png" alt="bell" />
                {/* <span className="navbar-phone-notification">1</span> */}
            </div>
            <div className="icon" onClick={() => navigateTo("map")}>
                <img id="map" src="../public/map.png" alt="energy" />
            </div>
            <div className="icon" onClick={() => navigateTo("CustomerService")}>
                <img id="CustomerService" src="../public/customer service.png" alt="chat" />
            </div>
            <div className="icon" onClick={() => navigateTo("Task")}>
                <img id="points" src="/../public/points.png" alt="parking" />
            </div>
        </div>
    );
}