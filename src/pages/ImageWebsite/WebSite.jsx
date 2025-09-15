import React, { useEffect, useRef, useState } from 'react';
import NavBarWebsite from '../../components/NavBarWebsite.jsx';
import styles from '../../styles/scss/WebSite.module.scss';

const WebSite = () => {
  const logoSectionRef = useRef(null);
  const waveContainerRef = useRef(null);
  const yellowLineRef = useRef(null);
  const waveRef = useRef(null);
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
  const [showYellowLine, setShowYellowLine] = useState(false);

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
    const wave = waveRef.current;
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
      setShowYellowLine(true);
      const yellowLine = yellowLineRef.current;
      if (!yellowLine) return;
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
                setTimeout(() => {
                  setFadeOut(true);
                  setTimeout(() => {
                    setShowServiceIntro(true); // 註解這行，停留在動畫最後
                  }, 800); // 淡出動畫持續時間不變
                }, 2000); // 淡出動畫前停留 3 秒
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
    <>
      <div className={styles['page-container']}>

        {showServiceIntro && <NavBarWebsite className={`${styles['navbar-fixed']}`} />}
        <div className={`${styles.content}`}>
          {/* 將 showServiceIntro && <NavBarWebsite ... /> 移除，避免重複 */}
          {!showServiceIntro ? (
            // 前導動畫區域
            <div
              className={`${styles['logo-section']}${fadeOut ? ' animate__animated animate__fadeOut' : ''}`}
              ref={logoSectionRef}
            >
              <h1 className={`${styles['header-logo']} ${styles.akagi}`}>
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
              <div className={styles.taglineGroup}>
                <svg className={`${styles.tagline}`} ref={taglineRef} viewBox="0 0 1913.09 598.95" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <style>{`.cls-1 { fill: #fff; }`}</style>
                  </defs>
                  <path className="cls-1" d="M2.25,255.08C2.25,123.52,37.45,48.26,86.77,48.26c15.98,0,32.42,6.89,41.45,17.23l-6.02,99.39c-8.8-8.04-19.22-14.36-31.96-14.36-18.29,0-35.43,22.98-35.43,98.81,0,70.09,13.9,99.39,36.59,99.39,10.19,0,22-4.6,30.34-11.49l4.17,99.39c-7.41,8.04-23.39,15.51-40.53,15.51-62.3,0-83.14-99.39-83.14-197.05Z" />
                  <path className="cls-1" d="M150,28.72l50.25-2.3v158.56h.46c10.65-22.98,19.92-30.45,31.03-30.45,34.51,0,39.6,63.77,39.6,130.98v160.86h-50.25v-157.99c0-24.7-1.62-36.77-10.42-36.77-5.1,0-7.87,4.6-10.42,8.62v186.14h-50.25V28.72Z" />
                  <path className="cls-1" d="M292.88,359.63c0-45.38,10.42-82.15,33.58-82.15h31.73v-17.23c0-10.92-5.33-14.94-12.74-14.94-12.04,0-29.18,10.34-37.28,18.96l-8.11-86.17c11.12-9.19,29.87-23.55,56.27-23.55,33.58,0,51.87,22.98,51.87,89.62v138.45c0,25.85.23,49.98,1.16,63.77h-35.43l-11.58-30.45h-.69c-8.11,26.43-19.68,36.19-31.03,36.19-22,0-37.75-36.77-37.75-92.49ZM359.11,369.97v-32.17h-14.82c-3.71,0-5.09,8.62-5.09,18.96,0,10.92,3.24,17.23,10.19,17.23,2.08,0,6.72-1.72,9.73-4.02Z" />
                  <path className="cls-1" d="M434.37,260.25c0-44.24-.46-72.96-.69-98.81l42.38-2.87,4.17,46.53h.93c6.48-35.04,21.31-56.3,36.82-48.83v110.3c-11.58-14.36-26.4-20.68-33.35,4.02v175.79h-50.25v-186.14Z" />
                  <path className="cls-1" d="M527.23,509.58c0-22.41,8.11-53.43,19.68-64.92v-1.15c-6.25-10.34-8.11-24.7-8.11-37.92,0-23.55,7.41-47.11,16.67-63.19v-1.15c-8.11-9.77-19.68-41.36-19.68-76.41,0-66.07,25.24-110.88,56.04-110.88,8.34,0,21.07,5.17,27.33,12.64-.46-18.96,0-60.9,23.39-60.9h23.16v75.83h-19.92c-4.17,0-11.12,0-11.12,10.34,7.87,17.81,13.43,40.79,13.43,72.96,0,63.19-23.16,105.71-55.35,105.71-8.34,0-14.36-3.45-19.45-7.47-.69,3.45-1.16,6.32-1.16,8.62,0,9.19,5.33,12.64,9.26,13.79,49.1,12.06,79.2,14.36,79.2,95.94,0,43.66-12.74,114.32-75.96,116.05-10.42,0-57.43-1.72-57.43-87.9ZM618.48,479.7c0-7.47-28.95-10.34-42.38-14.94-2.55-.57-4.4-1.72-5.56-2.87-2.55,4.6-2.78,10.34-2.78,14.94,0,17.81,10.88,24.13,22.46,24.13,13.43,0,28.25-9.19,28.25-21.26ZM601.34,264.84c0-33.9-6.72-35.62-9.5-35.62-3.01,0-9.26,1.72-9.26,35.62s6.25,35.62,9.26,35.62c3.47,0,9.5-1.72,9.5-35.62Z" />
                  <path className="cls-1" d="M673.83,307.93c0-72.96,17.37-153.39,62.76-153.39s59.29,86.17,50.95,183.84h-64.84c.23,18.96,8.57,25.28,19.22,25.28,12.27,0,27.33-8.04,37.05-13.79l4.17,85.02c-15.28,13.79-33.12,17.23-45.85,17.23-39.83,0-63.45-47.68-63.45-144.2ZM743.76,267.14v-5.17c0-6.32-.93-25.28-9.5-25.28-6.02,0-11.58,14.36-11.58,30.45h21.07Z" />
                  <path className="cls-1" d="M924.62,306.78l-47.47-252.78h57.43l7.64,78.71,8.34,93.64h.46l8.34-93.64,7.64-78.71h57.43l-47.47,252.78v139.6h-52.34v-139.6Z" />
                  <path className="cls-1" d="M1021.19,303.33c0-118.92,33.81-148.79,63.45-148.79s63.45,31.6,63.45,148.79-33.81,148.79-63.45,148.79-63.45-29.87-63.45-148.79ZM1096.22,303.33c0-60.9-8.11-60.9-11.58-60.9s-11.35,0-11.35,60.9,7.87,60.9,11.35,60.9,11.58,0,11.58-60.9Z" />
                  <path className="cls-1" d="M1170.56,328.61v-167.18h50.25v157.99c0,24.7,1.85,36.19,9.96,36.19,5.33,0,10.65-10.34,10.65-18.96v-175.22h50.02v172.35c0,44.24.23,82.15,1.16,112.6h-34.51l-11.35-32.17h-.46c-6.95,23.55-16.67,37.92-35.43,37.92-33.12,0-40.3-56.3-40.3-123.52Z" />
                  <path className="cls-1" d="M1317.61,260.25c0-44.24-.46-72.96-.69-98.81l42.38-2.87,4.17,46.53h.93c6.48-35.04,21.31-56.3,36.82-48.83v110.3c-11.58-14.36-26.4-20.68-33.35,4.02v175.79h-50.25v-186.14Z" />
                  <path className="cls-1" d="M1500.09,54h50.48v288.4h59.29l-2.08,103.98h-107.69V54Z" />
                  <path className="cls-1" d="M1629.08,64.34C1629.08,28.72,1640.43,0,1654.79,0s25.94,28.72,25.94,64.34-11.58,63.77-25.94,63.77-25.71-28.72-25.71-63.77ZM1629.78,161.43l50.25-2.87v287.82h-50.25V161.43Z" />
                  <path className="cls-1" d="M1712.45,249.33h-12.74l2.32-83.3,10.42-4.6v-17.81c0-67.79,17.37-120.64,50.48-120.64,7.18,0,15.52.57,21.54,2.87l-3.47,93.07h-4.17c-9.96,0-14.36,10.34-14.36,30.45v12.06h18.29l-2.08,87.9h-15.98v197.05h-50.25v-197.05Z" />
                  <path className="cls-1" d="M1797.2,307.93c0-72.96,17.37-153.39,62.76-153.39s59.29,86.17,50.95,183.84h-64.84c.23,18.96,8.57,25.28,19.22,25.28,12.27,0,27.33-8.04,37.05-13.79l4.17,85.02c-15.28,13.79-33.12,17.23-45.85,17.23-39.83,0-63.45-47.68-63.45-144.2ZM1867.14,267.14v-5.17c0-6.32-.93-25.28-9.49-25.28-6.02,0-11.58,14.36-11.58,30.45h21.07Z" />
                </svg>
                <svg className={`${styles.taglineCover}`} ref={taglineCoverRef} viewBox="0 0 1913.09 598.95" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <style>{`.cls-2 { fill: #fff; }`}</style>
                  </defs>
                  <path className="cls-2" d="M150,29.46l50.25-2.3v158.56h.46c10.65-22.98,19.92-30.45,31.03-30.45,34.51,0,39.6,63.77,39.6,130.98v160.86h-50.25v-157.99c0-24.7-1.62-36.77-10.42-36.77-5.1,0-7.87,4.6-10.42,8.62v186.14h-50.25V29.46Z" />
                  <path className="cls-2" d="M527.23,510.31c0-22.41,8.11-53.43,19.68-64.92v-1.15c-6.25-10.34-8.11-24.7-8.11-37.92,0-23.55,7.41-47.11,16.67-63.19v-1.15c-8.11-9.77-19.68-41.36-19.68-76.41,0-66.07,25.24-110.88,56.04-110.88,8.34,0,21.07,5.17,27.33,12.64-.46-18.96,0-60.9,23.39-60.9h23.16v75.83h-19.92c-4.17,0-11.12,0-11.12,10.34,7.87,17.81,13.43,40.79,13.43,72.96,0,63.19-23.16,105.71-55.35,105.71-8.34,0-14.36-3.45-19.45-7.47-.69,3.45-1.16,6.32-1.16,8.62,0,9.19,5.33,12.64,9.26,13.79,49.1,12.06,79.2,14.36,79.2,95.94,0,43.66-12.74,114.32-75.96,116.05-10.42,0-57.43-1.72-57.43-87.9ZM618.48,480.44c0-7.47-28.95-10.34-42.38-14.94-2.55-.57-4.4-1.72-5.56-2.87-2.55,4.6-2.78,10.34-2.78,14.94,0,17.81,10.88,24.13,22.46,24.13,13.43,0,28.25-9.19,28.25-21.26ZM601.34,265.58c0-33.9-6.72-35.62-9.5-35.62-3.01,0-9.26,1.72-9.26,35.62s6.25,35.62,9.26,35.62c3.47,0,9.5-1.72,9.5-35.62Z" />
                  <path className="cls-2" d="M955.34,178.64l4.02-45.19,7.64-78.71h57.43l-23.27,123.9M900.42,178.64l-23.27-123.9h57.43l7.64,78.71,3.88,43.54" />
                  <path className="cls-2" d="M1021.19,304.07c0-118.92,33.81-148.79,63.45-148.79s63.45,31.6,63.45,148.79-33.81,148.79-63.45,148.79-63.45-29.87-63.45-148.79ZM1096.22,304.07c0-60.9-8.11-60.9-11.58-60.9s-11.35,0-11.35,60.9,7.87,60.9,11.35,60.9,11.58,0,11.58-60.9Z" />
                  <path className="cls-2" d="M1170.56,329.35v-167.18h50.25v157.99c0,24.7,1.85,36.19,9.96,36.19,5.33,0,10.65-10.34,10.65-18.96v-175.22h50.02v172.35c0,44.24.23,82.15,1.16,112.6h-34.51l-11.35-32.17h-.46c-6.95,23.55-16.67,37.92-35.43,37.92-33.12,0-40.3-56.3-40.3-123.52Z" />
                  <path className="cls-2" d="M1317.61,260.98c0-44.24-.46-72.96-.69-98.81l42.38-2.87,4.17,46.53h.93c6.48-35.04,21.31-56.3,36.82-48.83v110.3c-11.58-14.36-26.4-20.68-33.35,4.02v175.79h-50.25v-186.14Z" />
                  <path className="cls-2" d="M1500.09,54.74h50.48v288.4h59.29l-2.08,103.98h-107.69V54.74Z" />
                  <path className="cls-2" d="M1712.45,250.07h-12.74l2.32-83.3,10.42-4.6v-17.81c0-67.79,17.37-120.64,50.48-120.64,7.18,0,15.52.57,21.54,2.87l-3.47,93.07h-4.17c-9.96,0-14.36,10.34-14.36,30.45v12.06h18.29l-2.08,87.9h-15.98v197.05h-50.25v-197.05Z" />
                </svg>
                <svg
                  className={`${styles.yellowLine} ${showYellowLine ? styles.show : ''}`}
                  ref={yellowLineRef}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2018.44 375.25"
                >
                  <defs>
                    <style>{`.cls-3 { fill: none; stroke: #FFCC00; stroke-width: 20px; }`}</style>
                  </defs>
                  <path className="cls-3" d="M0,196.6c145.65,50.81,256.98,80.84,300.14,88.92,26.46,4.95,52.88,8.91,52.88,8.91,28.33,4.25,52.21,6.98,69.51,8.74,0,0,16.67,1.69,35.07,3.14,111.73,8.77,159.14,6.82,159.14,6.82,19.62-.42,55.62-1.27,95.23-6.73,23.75-3.27,112.72-17.01 222.03-75.32,66.53-35.49,166-88.55,165.26-153.14-.03-2.76-.37-16.02-8.16-29.68-21.93-38.39-88.72-55.11-124.94-27.97-23.57,17.65-27.17,48.61-27.73,54.37-7.22,73.34,75,148.9,149.16,178.37,0,0,98.08,34.2,231.19-18.61,2.05-.81,22.06-8.84,49.26-18.91,10.24-3.79,17.94-6.63,27.59-9.93,2.4-.82,28.92-9.85,52.8-16.02,44.78-11.59,85.55-14.54,90.48-14.88,16.3-1.11,84.99-4.9,170.74,19.89,23.07,6.67,40.1,13.3,52.32,18.1,54.21,21.28,92.02,44.16,118.35,60.26,45.8,28.01,78.51,53.75,99.95,70.73,15.87,12.57,28.87,23.55,38.18,31.61" />
                </svg>
              </div>
            </div>
          ) : null}
          {!showServiceIntro && (
            <>
              <div style={{ height: '50vh', background: 'transparent' }}></div>
              <div ref={waveContainerRef} className={`${styles['wave-container']}`} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '0%', background: '#51ff3e', zIndex: -1, overflow: 'visible', transition: 'height 0.1s ease-out' }}>
                <div ref={waveRef} className={`${styles.wave}`} style={{ position: 'absolute', top: -40, left: 0, width: '400%', height: 40, background: 'repeating-linear-gradient(90deg,#51ff3e 100%,#3ee851 100%,#51ff3e 100%,#3ee851 100%,#51ff3e 100%)', animation: 'waveFlowEnhanced 1.2s linear infinite alternate' }}></div>
              </div>
            </>
          )}
        </div>
        {showServiceIntro && (
          <div>

            <div>
              <img src="public/banner.png" alt="" className={styles.banner} />
            </div>

            {/* about-us 區塊，閃電在左，內容在右 */}
            <div className={styles['section-wrapper']}>
              <div className={styles['section-lightning']}>
                <img src="/lightning.png" alt="lightning-bg" />
              </div>
              <div className={styles['section-content']} id="about-us">
                <div className={styles['section-right']}>
                  <h2 className={styles.title}>關於我們</h2>
                  <div style={{ width: '100%', height: '4px', background: '#51ff3e', borderRadius: '2px', margin: '20px auto', marginBottom: '6%' }}></div>
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
            </div>

            {/* service-intro 區塊，閃電在右，內容在左，與 about-us 共用樣式 */}
            <div className={`${styles['section-wrapper']} ${styles['reverse']}`}>
              <div className={styles['section-content']} id="service-intro">
                <div className={styles['section-right']}>
                  <h2 className={styles.title}>服務據點</h2>
                  <div style={{ width: '100%', height: '4px', background: '#51ff3e', borderRadius: '2px', margin: '20px auto', marginBottom: '6%' }}></div>
                  <p>
                    ChargeGO 的服務目前專注於台灣各大城市，無論是台北的商圈、台中的百貨，還是高雄的熱門景點，我們都在持續拓展據點。
                    透過與便利商店、餐飲品牌、購物中心及交通節點的合作，我們致力於讓使用者在日常生活的每個角落，都能輕鬆租借行動電
                    源。未來，ChargeGO 也將不斷擴大服務範圍，打造全台最便利的行動充電網絡。
                  </p>
                </div>
              </div>
              <div className={styles['section-lightning']}>
                <img src="/lightning.png" alt="lightning-bg" />
              </div>
            </div>

            {/* how-to-rent 區塊，閃電在左，內容在右 */}
            <div className={styles['how-to-rent-wrapper']}>
              <div className={styles['section-lightning']}>
                <img src="/lightning.png" alt="lightning-bg" />
              </div>
              <div className={styles['how-to-rent']} id="how-to-rent">
                <h2 className={styles['how-title']}>HOW？<br />如何租借？</h2>
                <div style={{ width: '100%', height: '4px', background: '#51ff3e', borderRadius: '2px', margin: '20px auto', marginBottom: '6%' }}></div>
                <div className={styles['how-divider']} />
                <div className={styles['how-steps']}>
                  <div className={styles['how-step']}>
                    <div className={styles['how-step-num']}>1</div>
                    <div className={styles['how-step-content']}>下載<br />ChargeGo</div>
                  </div>
                  <div className={styles['how-arrow']}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106.45 69.72" width="60" height="40">
                      <line className="cls-1" y1="32.73" x2="89.06" y2="32.73" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                      <path className="cls-1" d="M68.96,1.92c.92,3.99,2.8,9.86,6.85,16.03,5.48,8.33,12.23,13.06,16.15,15.39-4.65,3.51-11.48,9.64-16.93,19.15-3.11,5.43-4.95,10.54-6.08,14.68" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                    </svg>
                  </div>
                  <div className={styles['how-step']}>
                    <div className={styles['how-step-num']}>2</div>
                    <div className={styles['how-step-content']}>註冊會員</div>
                  </div>
                  <div className={styles['how-arrow']}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106.45 69.72" width="60" height="40">
                      <line className="cls-1" y1="32.73" x2="89.06" y2="32.73" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                      <path className="cls-1" d="M68.96,1.92c.92,3.99,2.8,9.86,6.85,16.03,5.48,8.33,12.23,13.06,16.15,15.39-4.65,3.51-11.48,9.64-16.93,19.15-3.11,5.43-4.95,10.54-6.08,14.68" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                    </svg>
                  </div>
                  <div className={styles['how-step']}>
                    <div className={styles['how-step-num']}>3</div>
                    <div className={styles['how-step-content']}>查看地圖<br />尋找附近站點</div>
                  </div>
                  <div className={styles['how-arrow']}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106.45 69.72" width="60" height="40">
                      <line className="cls-1" y1="32.73" x2="89.06" y2="32.73" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                      <path className="cls-1" d="M68.96,1.92c.92,3.99,2.8,9.86,6.85,16.03,5.48,8.33,12.23,13.06,16.15,15.39-4.65,3.51-11.48,9.64-16.93,19.15-3.11,5.43-4.95,10.54-6.08,14.68" style={{ fill: 'none', stroke: '#51ff3e', strokeMiterlimit: 10, strokeWidth: 17 }} />
                    </svg>
                  </div>
                  <div className={styles['how-step']}>
                    <div className={styles['how-step-num']}>4</div>
                    <div className={styles['how-step-content']}>掃描該站點<br />QRCode</div>
                  </div>
                </div>
              </div>
            </div>

            {/* become-station 區塊，閃電在右，內容在左 */}
            <div className={`${styles['section-wrapper']} ${styles['reverse']}`}>
              <div className={styles['section-content']} id="become-station">
                <div className={styles['section-right']}>
                  <h2 className={styles.title}>成為站點</h2>
                  <div style={{ width: '100%', height: '4px', background: '#51ff3e', borderRadius: '2px', margin: '20px auto', marginBottom: '6%' }}></div>
                  <p>
                    歡迎各類商家、場館、公共空間加入 ChargeGO 站點行列！
                    成為合作站點，不僅能提升顧客便利性，增加來客流量，
                    還能共同打造智慧充電新生活。ChargeGO 提供彈性合作方案，
                    讓您的空間成為用戶的電力補給站，創造雙贏價值。
                    <br /><br />
                    填寫下方google表單，了解更多合作細節，攜手推動行動充電網絡的成長！
                  </p>
                </div>
              </div>
              <div className={styles['section-lightning']}>
                <img src="/taiwan-map.png" alt="taiwan-map" className={styles.taiwanMap} />
              </div>
            </div>
            <iframe className={styles['form-iframe']} src="https://docs.google.com/forms/d/e/1FAIpQLSffgv-xS8Qe40VGCWcUz4yhDgNgoySgi5VZquzczcJLlTaHRg/viewform?embedded=true" width="1000" height="1307" frameborder="0" marginheight="0" marginwidth="0">載入中…</iframe>
            <div className={styles.footer}>
              <div className={styles['footer-gradient-text']}>
                搶先體驗！首次租借享10點折扣碼！
              </div>
              <div className={styles['footer-download-btn-border']}>
                
                <button 
                onClick = {() => window.location.href = '/mapindex'}
                className={styles['footer-download-btn']}>開始使用</button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default WebSite;
