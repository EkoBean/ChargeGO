import { useState } from "react";
import "./Chargegologo.css";
import 'animate.css';

function ChargegoLogo({ className = "" }) {
    const [logoHover, setLogoHover] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const handleMouseEnter = () => {
        setLogoHover(true);
        setAnimKey(prev => prev + 1); // 每次 hover 都改變 key
    };

    return (
        <div className={`logo ${className}`}>
            <img
                key={animKey}
                src={logoHover ? "/home-button-hover.png" : "/home-button.png"}
                alt="Chargego Logo"
                className={logoHover ? "animate__animated animate__rubberBand" : ""}
                onMouseEnter={handleMouseEnter}
                onAnimationEnd={() => setLogoHover(false)}
                onMouseLeave={() => setLogoHover(false)}
            />
        </div>
    );
}

export default ChargegoLogo;
