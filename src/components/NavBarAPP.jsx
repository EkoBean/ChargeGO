import React from 'react';
import '../styles/scss/NavBarAPP.scss';

export default function NavBarAPP() {
    const navigateTo = (path) => {
        window.location.href = `/${path}`;
    }
    return (
        <div className="navbar-phone-container">
            <div className="icon" onClick={() => navigateTo("mber_profile")}>
                <img id="myprofile" src="../public/myprofile.png" alt="user" />
               
            </div>
            <div className="icon" onClick={() => navigateTo("mber_discount")}>
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