import React from "react";
import '../styles/scss/global.module.scss';

function NavBar() {
    return (
    <nav>
        <ul className="nav justify-content-center">
            <li className="nav-item">
                <a className="nav-link active" href="#" aria-current="page">Active link</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
                <a className="nav-link disabled" href="#">Disabled link</a>
            </li>
        </ul>


    </nav>)
}

export default NavBar;