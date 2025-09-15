import { useState } from "react";
import styles from "../styles/scss/ChargegoLogo.module.scss";
import 'animate.css';

function ChargegoLogo({ className = "" }) {
    const [hover, setHover] = useState(false);
    // 讓每次 hover 都能觸發動畫
    const handleMouseEnter = () => {
        setHover(false); // 先重置
        setTimeout(() => setHover(true), 10); // 再啟動動畫
    };
    return (
        <div className={`${styles['chargego-logo']} ${className}`}>
            <h1
                className={
                  `${styles.logoText} ${hover ? 'animate__animated animate__rubberBand' : ''}`
                }
                onMouseEnter={handleMouseEnter}
                onAnimationEnd={() => setHover(false)}
            >
                ChargeG
                <span className={styles.oWrap}>
                  O
                  {hover && (
                    <span className={styles.bolt}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H13L13 2Z" fill="#00ff3c" stroke="#00ff3c" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </span>
            </h1>
        </div>
    );
}

export default ChargegoLogo;
