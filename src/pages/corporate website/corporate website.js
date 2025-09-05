document.addEventListener('DOMContentLoaded', function () {
    const logoSection = document.querySelector('.logo-section');

    // 創建分離的logo元素
    function createAnimatedLogo() {
        const logo = document.querySelector('.logo');
        logo.innerHTML = '';

        const chargeSpan = document.createElement('span');
        chargeSpan.className = 'logo-Charge';
        chargeSpan.textContent = 'Charge';

        const gSpan = document.createElement('span');
        gSpan.className = 'logo-G';
        gSpan.textContent = 'G';

        const oSpan = document.createElement('span');
        oSpan.className = 'logo-O';
        oSpan.textContent = 'O';

        logo.appendChild(chargeSpan);
        logo.appendChild(gSpan);
        logo.appendChild(oSpan);

        // 創建gradient-logo並添加到logo-section
        const gradientLogo = document.createElement('div');
        gradientLogo.className = 'gradient-logo';
        gradientLogo.textContent = 'ChargeGO';
        logo.appendChild(gradientLogo);

        // 創建波浪容器
        const waveContainer = document.createElement('div');
        waveContainer.className = 'wave-container';
        waveContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0%;
            background: #51ff3e;
            z-index: -1;
            overflow: visible;
            transition: height 0.1s ease-out;
        `;

        // 創建波浪元素
        const wave = document.createElement('div');
        wave.className = 'wave';
        wave.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            width: 200%;
            height: 40px;
            background: repeating-linear-gradient(
                90deg,
                #51ff3e 100%,
                #3ee851 100%,
                #51ff3e 100%,
                #3ee851 100%,
                #51ff3e 100%
            );
            clip-path: polygon(
                0% 100%, 
                0% 85%,
                3% 70%,
                6% 55%,
                9% 40%,
                12% 30%,
                15% 40%,
                18% 55%,
                21% 70%,
                24% 85%,
                27% 70%,
                30% 55%,
                33% 40%,
                36% 30%,
                39% 40%,
                42% 55%,
                45% 70%,
                48% 85%,
                51% 70%,
                54% 55%,
                57% 40%,
                60% 30%,
                63% 40%,
                66% 55%,
                69% 70%,
                72% 85%,
                75% 70%,
                78% 55%,
                81% 40%,
                84% 30%,
                87% 40%,
                90% 55%,
                93% 70%,
                96% 85%,
                100% 70%,
                100% 100%
            );
            animation: waveFlow 3s linear infinite;
        `;

        // 添加CSS動畫樣式
        if (!document.querySelector('#wave-styles')) {
            const style = document.createElement('style');
            style.id = 'wave-styles';
            style.textContent = `
                @keyframes waveFlow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `;
            document.head.appendChild(style);
        }

        waveContainer.appendChild(wave);
        document.body.appendChild(waveContainer);
    }

    createAnimatedLogo();

    // 滾動事件處理
    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const maxScroll = windowHeight;

        const scrollProgress = Math.min(scrollY / maxScroll, 1);

        // 波浪高度控制
        const waveContainer = document.querySelector('.wave-container');
        if (waveContainer) {
            const waveProgress = Math.min(scrollProgress / 0.9, 1); // 在90%滾動進度時波浪達到頂部
            const waveHeight = waveProgress * 100;
            waveContainer.style.height = `${waveHeight}%`;
        }

        // Logo section 顯示控制
        if (scrollProgress > 0.1) {
            logoSection.style.opacity = '1';
            logoSection.style.visibility = 'visible';
            const logoRiseProgress = Math.min((scrollProgress - 0.1) / 0.15, 1);
            const logoTranslateY = -50 + (logoRiseProgress * 50);
            logoSection.style.transform = `translate(-50%, ${logoTranslateY}%)`;
        }

        // G 字母動畫
        const gElement = document.querySelector('.logo-G');
        if (scrollProgress > 0.25) {
            const gProgress = Math.min((scrollProgress - 0.25) / 0.15, 1);
            const gOpacity = gProgress;
            const gTranslateX = 300 * (1 - gProgress);
            const gScale = 1.5 - (0.5 * gProgress);

            gElement.style.opacity = gOpacity;
            gElement.style.transform = `translateX(${gTranslateX}px) scale(${gScale})`;

            // 當G字母完全出現後觸發閃爍彈跳動畫
            if (gProgress >= 1) {
                gElement.classList.remove('animate__flash', 'animate__bounce');
                gElement.offsetHeight; // 強制重排
                gElement.classList.add('animate__animated', 'animate__flash');

                // 閃爍後添加彈跳效果
                setTimeout(() => {
                    gElement.classList.remove('animate__flash');
                    gElement.classList.add('animate__bounce');
                }, 800);
            }
        }

        // O 字母動畫
        const oElement = document.querySelector('.logo-O');
        if (scrollProgress > 0.45) {
            const oProgress = Math.min((scrollProgress - 0.45) / 0.15, 1);
            const oOpacity = oProgress;
            const oTranslateX = 400 * (1 - oProgress);
            const oScale = 1.5 - (0.5 * oProgress);

            oElement.style.opacity = oOpacity;
            oElement.style.transform = `translateX(${oTranslateX}px) scale(${oScale})`;
        }

        // Charge 字母動畫
        const chargeElement = document.querySelector('.logo-Charge');
        const logo = document.querySelector('.logo');
        const taglineElement = document.querySelector('.tagline');
        const arrowElement = document.querySelector('.arrow');
        const gradientLogo = document.querySelector('.gradient-logo');
        const yellowLinePath = document.querySelectorAll('.cls-4');

        if (scrollProgress > 0.7) {
            const chargeProgress = Math.min((scrollProgress - 0.7) / 0.15, 1);
            const chargeOpacity = chargeProgress;
            const chargeTranslateX = -200 * (1 - chargeProgress);

            chargeElement.style.opacity = chargeOpacity;
            chargeElement.style.transform = `translateX(${chargeTranslateX}px)`;

            // 當 Charge 完全出現後
            if (chargeProgress >= 1) {
                chargeElement.classList.remove('animate__rubberBand');
                chargeElement.offsetHeight;
                chargeElement.classList.add('animate__animated', 'animate__rubberBand');

                logo.classList.remove('animate__rubberBand');
                logo.offsetHeight;
                logo.classList.add('animate__animated', 'animate__rubberBand');

                // 當波浪接近全滿時顯示gradient-logo
                const waveProgress = Math.min(scrollProgress / 0.9, 1);
                if (scrollProgress >= 0.9 && waveProgress >= 0.95) {
                    // 隱藏原本的logo文字並顯示gradient-logo
                    logo.classList.add('hide-text');
                    if (gradientLogo) {
                        gradientLogo.classList.add('show');
                    }

                    // 箭頭消失
                    if (arrowElement) {
                        arrowElement.style.opacity = '0';
                        arrowElement.style.visibility = 'hidden';
                        arrowElement.style.transform = 'scale(0)';
                    }

                    // 延遲顯示tagline
                    setTimeout(() => {
                        const logoMoveUp = 50;
                        logoSection.style.transform = `translate(-50%, calc(-50% - ${logoMoveUp}px))`;

                        taglineElement.style.opacity = '1';
                        taglineElement.style.visibility = 'visible';
                        taglineElement.style.transform = 'translateY(0px)';

                        // tagline 出現後延遲觸發黃色路徑動畫
                        setTimeout(() => {
                            yellowLinePath.forEach(path => {
                                path.classList.add('animate');
                            });
                        }, 500);
                    }, 1000);
                }
            }
        } else {
            // 當滾動回到前面時恢復原本的logo文字並隱藏gradient-logo
            logo.classList.remove('hide-text');
            if (gradientLogo) {
                gradientLogo.classList.remove('show');
            }

            if (arrowElement) {
                arrowElement.style.opacity = '1';
                arrowElement.style.visibility = 'visible';
                arrowElement.style.transform = 'scale(1)';
            }

            // 隱藏tagline和重置路徑動畫
            taglineElement.style.opacity = '0';
            taglineElement.style.visibility = 'hidden';
            taglineElement.style.transform = 'translateY(50px)';
            
            yellowLinePath.forEach(path => {
                path.classList.remove('animate');
            });
        }
    });

    // 初始化時觸發一次滾動檢查
    window.dispatchEvent(new Event('scroll'));
});

        // 隱藏tagline
        taglineElement.style.opacity = '0';
        taglineElement.style.visibility = 'hidden';
        taglineElement.style.transform = 'translateY(50px)';
    

    // 初始化時觸發一次滾動檢查
    window.dispatchEvent(new Event('scroll'));
        taglineElement.style.visibility = 'hidden';
        taglineElement.style.transform = 'translateY(50px)';
    

    // 初始化時觸發一次滾動檢查
    window.dispatchEvent(new Event('scroll'));

