import React from 'react';
import styles from '../styles/scss/NavBarAPP.module.scss';

export default function NavBarAPP() {
    
    return (
        <div className="navbar-phone-container">
            <div className="icon">
                <a href="">
                <img id="myprofile" src="../public/myprofile.png" alt="user" />
                </a>
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