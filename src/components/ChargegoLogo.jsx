import { useState } from "react";
import styles from "../styles/scss/ChargegoLogo.module.scss";
import 'animate.css';

function ChargegoLogo({ className = "" }) {
    const [logoHover, setLogoHover] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const handleMouseEnter = () => {
        setLogoHover(true);
        setAnimKey(prev => prev + 1); // 每次 hover 都改變 key
    };

    return (
        <div className={`${styles.logo} ${className}`}>
            <img
                key={animKey}
                src={logoHover ? "/home-button-hover.png" : "/home-button.png"}
                alt="Chargego Logo"
                className={logoHover ? `${styles.animateAnimated} ${styles.animateRubberBand}` : ""}
                onMouseEnter={handleMouseEnter}
                onAnimationEnd={() => setLogoHover(false)}
                onMouseLeave={() => setLogoHover(false)}
            />
        </div>
    );
}

export default ChargegoLogo;
