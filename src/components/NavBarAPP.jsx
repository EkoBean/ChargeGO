import React from 'react';
import './NavBarAPP.scss';

export default function NavBarPhone() {
    return (
        <div className="navbar-phone-container">
            <div className="icon">
                <img id="myprofile" src="../public/myprofile.png" alt="user" />
            </div>
            <div className="icon">
                <img id="gift" src="../public/gift.png" alt="bell" />
                {/* <span className="navbar-phone-notification">1</span> */}
            </div>
            <div className="icon">
                <img id="map" src="../public/map.png" alt="energy" />
            </div>
            <div className="icon">
                <img id="CustomerService" src="../public/customer service.png" alt="chat" />
            </div>
            <div className="icon">
                <img id="points" src="/../public/points.png" alt="parking" />
            </div>
        </div>
    );
}