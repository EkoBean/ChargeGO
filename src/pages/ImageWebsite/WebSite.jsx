import React, { useEffect, useRef, useState } from 'react';
import NavBarWebsite from '../../components/Nav.jsx';
import styles from '../../styles/scss/WebSite.module.scss';

const WebSite = () => {
  const logoSectionRef = useRef(null);
  const waveContainerRef = useRef(null);
  const yellowLineRef = useRef(null);
  const chargeRef = useRef(null);
  const gRef = useRef(null);
  const oRef = useRef(null);
  const gradientLogoRef = useRef(null);
  const arrowRef = useRef(null);
  const taglineRef = useRef(null);
  const taglineCoverRef = useRef(null);
  const [showGradientLogo, setShowGradientLogo] = useState(false);
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // 動畫與初始化
  useEffect(() => {
    // 建立波浪動畫
    if (!document.getElementById('wave-styles')) {
      const style = document.createElement('style');
      style.id = 'wave-styles';
      style.textContent = `
        @keyframes waveFlowEnhanced {
          0% { transform: translateX(0); }
          100% { transform: translateX(-60%); }
        }
      `;
      document.head.appendChild(style);
    }

    // clip-path 波浪動畫
    let waveTick = 0;
    const wave = waveContainerRef.current?.querySelector('.wave');
    const waveInterval = setInterval(() => {
      waveTick += 0.1;
      let points = [];
      for (let i = 0; i <= 100; i += 3) {
        let base = 70 + 25 * Math.sin(waveTick + i * 0.18);
        let y = i === 0 ? 100 : base;
        points.push(`${i}% ${y}%`);
      }
      points.push('100% 100%');
      if (wave) wave.style.clipPath = `polygon(${points.join(',')})`;
    }, 24);

    // 依序播放 logo 動畫
    setTimeout(() => {
      if (logoSectionRef.current) {
        logoSectionRef.current.style.opacity = '1';
        logoSectionRef.current.style.visibility = 'visible';
        logoSectionRef.current.style.transform = 'translate(-50%, -50%)';
      }
      if (gRef.current) {
        gRef.current.style.opacity = '1';
        gRef.current.style.transform = 'translateX(0px) scale(1)';
        gRef.current.classList.add('animate__animated', 'animate__flash');
        setTimeout(() => {
          gRef.current.classList.remove('animate__flash');
          gRef.current.classList.add('animate__bounce');
          setTimeout(() => {
            if (chargeRef.current) {
              chargeRef.current.style.opacity = '1';
              chargeRef.current.style.transform = 'translateX(0px)';
              chargeRef.current.classList.add('animate__animated', 'animate__rubberBand');
              setTimeout(() => {
                if (oRef.current) {
                  oRef.current.style.opacity = '1';
                  oRef.current.style.transform = 'translateX(0px) scale(1)';
                }
              }, 600);
            }
          }, 600);
        }, 800);
      }
    }, 300);

    // 黃線動畫
    function animateYellowLine() {
      const yellowLine = yellowLineRef.current;
      if (!yellowLine) return;
      yellowLine.classList.add('show');
      const yellowLinePath = yellowLine.querySelector('.cls-1');
      if (!yellowLinePath) return;
      const length = yellowLinePath.getTotalLength();
      yellowLinePath.style.strokeDasharray = length;
      yellowLinePath.style.strokeDashoffset = length;
      yellowLinePath.style.transition = 'none';
      yellowLinePath.getBoundingClientRect();
      yellowLinePath.style.transition = 'stroke-dashoffset 2s ease';
      yellowLinePath.style.strokeDashoffset = '0';
    }

    // 綠色波浪上升動畫
    setTimeout(() => {
      let waveHeight = 0;
      const waveRiseInterval = setInterval(() => {
        waveHeight += 2;
        if (waveContainerRef.current) waveContainerRef.current.style.height = `${waveHeight}%`;
        if (waveHeight >= 100) {
          clearInterval(waveRiseInterval);
          // 波浪上升結束後播放 gradient-logo、tagline
          setShowGradientLogo(true); // 只顯示 gradient-logo
          if (logoSectionRef.current && gradientLogoRef.current) {
            logoSectionRef.current.classList.add('hide-text');
            gradientLogoRef.current.classList.add('show');
          }
          if (arrowRef.current) {
            arrowRef.current.style.opacity = '0';
            arrowRef.current.style.visibility = 'hidden';
            arrowRef.current.style.transform = 'scale(0)';
          }
          setTimeout(() => {
            if (taglineRef.current && taglineCoverRef.current && logoSectionRef.current) {
              logoSectionRef.current.style.transform = `translate(-50%, calc(-50% - 50px))`;
              taglineRef.current.style.opacity = '1';
              taglineRef.current.style.visibility = 'visible';
              taglineRef.current.classList.add('show-tagline');
              taglineCoverRef.current.style.opacity = '1';
              taglineCoverRef.current.style.visibility = 'visible';
              taglineCoverRef.current.classList.add('show-tagline');
              // 不再直接覆蓋 transform
              taglineRef.current.style.transform = 'translateY(200px)';
              setTimeout(() => {
                taglineRef.current.style.transform = 'translateY(0px)';
              }, 10);
              taglineCoverRef.current.style.transform = 'translateY(200px)';
              setTimeout(() => {
                taglineCoverRef.current.style.transform = 'translateY(0px)';
              }, 10);
              setTimeout(() => {
                animateYellowLine();
                // 動畫全部結束後，先淡出動畫
                //setTimeout(() => {
                //  setFadeOut(true);
                //  setTimeout(() => {
                //    setShowServiceIntro(true); // 註解這行，停留在動畫最後
                //  }, 800); // 淡出動畫持續時間不變
                //}, 3000); // 淡出動畫前停留 3 秒
              }, 800);
            }
          }, 1000);
        }
      }, 30);
    }, 1800);

    return () => {
      clearInterval(waveInterval);
    };
  }, []);

  return (
    <div className={`${styles.content}`}>
      {showServiceIntro && <NavBarWebsite className={`${styles['navbar-fixed']}`} />}
      {!showServiceIntro ? (
        // 前導動畫區域
        <div
          className={`${styles['logo-section']}${fadeOut ? ' animate__animated animate__fadeOut' : ''}`}
          ref={logoSectionRef}
        >
          <h1 className={`${styles['header-logo']}`}>
            {!showGradientLogo && (
              <>
                <span className={`${styles['logo-Charge']}`} ref={chargeRef}>Charge</span>
                <span className={`${styles['logo-G']}`} ref={gRef}>G</span>
                <span className={`${styles['logo-O']}`} ref={oRef}>O</span>
              </>
            )}
            <div
              className={`${styles['gradient-logo']}${showGradientLogo ? ' ' + styles.show : ''}`}
              ref={gradientLogoRef}
              style={{ display: showGradientLogo ? 'block' : 'none' }}
            >
              ChargeGO
            </div>
          </h1>
          <img className={`${styles.arrow}`} ref={arrowRef} src="/arrow.png" alt="" />
          <img className={`${styles.tagline}`} ref={taglineRef} src="/charge%20Your%20Life.png" alt="Charge Your Life" />
          <img className={`${styles.taglineCover}`} ref={taglineCoverRef} src="/tagline-cover.png" alt="Charge Your Life cover" />
          <svg
            id="yellowLine"
            ref={yellowLineRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2018.44 375.25"
          >
            <defs>
              <style>{`.cls-1 { fill: none; stroke: #FFCC00; stroke-width: 20px; }`}</style>
            </defs>
            <path className="cls-1" d="M0,196.6c145.65,50.81,256.98,80.84,300.14,88.92,26.46,4.95,52.88,8.91,52.88,8.91,28.33,4.25,52.21,6.98,69.51,8.74,0,0,16.67,1.69,35.07,3.14,111.73,8.77,159.14,6.82,159.14,6.82,19.62-.42,55.62-1.27,95.23-6.73,23.75-3.27,112.72-17.01 222.03-75.32,66.53-35.49,166-88.55,165.26-153.14-.03-2.76-.37-16.02-8.16-29.68-21.93-38.39-88.72-55.11-124.94-27.97-23.57,17.65-27.17,48.61-27.73,54.37-7.22,73.34,75,148.9,149.16,178.37,0,0,98.08,34.2,231.19-18.61,2.05-.81,22.06-8.84,49.26-18.91,10.24-3.79,17.94-6.63,27.59-9.93,2.4-.82,28.92-9.85,52.8-16.02,44.78-11.59,85.55-14.54,90.48-14.88,16.3-1.11,84.99-4.9,170.74,19.89,23.07,6.67,40.1,13.3,52.32,18.1,54.21,21.28,92.02,44.16,118.35,60.26,45.8,28.01,78.51,53.75,99.95,70.73,15.87,12.57,28.87,23.55,38.18,31.61" />
          </svg>
        </div>
      ) : (
        <div className={`${styles['service-intro']}`}>
          <div className={`${styles['service-intro-left']}`}>
            <img
              src="/lightning.png"
              alt="lightning"
              style={{ width: '100px', height: '100px', display: 'block' }}
            />
          </div>
          <div className={`${styles['service-intro-right']}`}>
            <h2 className={`${styles.title}`}>關於我們</h2>
            <p>
              在這個隨時隨地都需要保持聯繫的時代，電量就是行動力。ChargeGO 誕生的初衷，就是希望讓每一位使用者在任何場景中，
              都能輕鬆找到電力補給站。無論是在商場逛街、餐廳用餐，還是旅行途中，ChargeGO 都提供便利、快速又安心的行動電源租
              借服務，讓「沒電焦慮」不再是你的日常。
              <br /><br />
              我們秉持「即借即用，隨借隨還」的理念，透過遍布各地的合作店家據點，以及智慧化的租還系統，打造最貼近生活的充電解決
              方案。ChargeGO 不只是補充電量，更希望成為你生活節奏中的可靠夥伴，隨時隨地，助你前行。
            </p>
          </div>
        </div>
      )}
      {!showServiceIntro && (
        <>
          <div style={{ height: '50vh', background: 'transparent' }}></div>
          <div ref={waveContainerRef} className={`${styles['wave-container']}`} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '0%', background: '#51ff3e', zIndex: -1, overflow: 'visible', transition: 'height 0.1s ease-out' }}>
            <div className={`${styles.wave}`} style={{ position: 'absolute', top: -40, left: 0, width: '400%', height: 40, background: 'repeating-linear-gradient(90deg,#51ff3e 100%,#3ee851 100%,#51ff3e 100%,#3ee851 100%,#51ff3e 100%)', animation: 'waveFlowEnhanced 1.2s linear infinite alternate' }}></div>
          </div>
        </>
      )}
    </div>
  );
}

export default WebSite;
