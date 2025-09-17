import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import homeBtn from "/home-button.png";
import homeBtnHover from "/home-button-hover.png"; // 修正：使用絕對路徑
import "animate.css";
import styles from "../styles/scss/NavBarWebsite.module.scss";
import React from 'react';
import ChargegoLogo from "./ChargegoLogo";



function NavbarWebsite(props) {
  const { showServiceIntro, className } = props; // 從 props 解構出來

  // hooks
  const navigate = useNavigate();
  const location = useLocation();

  const [mainBallPos, setMainBallPos] = useState({ x: 0, y: 0, show: false });
  const [followerBallPos, setFollowerBallPos] = useState({
    x: 0,
    y: 0,
    show: false,
    scale: 1,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // 修改選單結構，加入子選單
  const menuItems = [
    { title: "關於我們", targetId: 'about-us' },
    { title: "服務據點", targetId: 'service-intro' },
    { title: "如何租借", targetId: 'how-to-rent' },
    { title: "成為站點", targetId: 'become-station' },
    {
      title: "會員專區",
      submenu: [
        { name: "會員登入", url: 'mber_login' },
        { name: "會員註冊", url: 'mber_register' },
        { name: "會員資料", url: 'mber_profile' },],
    },
    {
      title: "租借系統",
      submenu: [{ name: "地點租借地圖", url: 'mapindex' }],
    },
  ];

  const navHandler = (item, index) => {
    console.log('item :>> ', item);
    const element = document.getElementById(item.targetId);
    const targetId = item.targetId;
    // 沒有子選單，正常滾動並關閉選單
    if (!item.submenu) {
      // 在首頁時的處理
      if (location.pathname === '/' && element && !item.submenu) {
        if (activeSubmenu === index) {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSubmenu(null);
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSubmenu(index);
        }
      }
      // 不在首頁時的處理
      else if (location.pathname !== '/') {
        navigate('/', { state: { scrollToId: targetId } });
        closeMobileMenu();
      }
      // 如果有子選單，點擊主選單只打開/關閉子選單
      else if (item.submenu) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setMobileMenuOpen(false);
        setActiveSubmenu(false);

      }
    }

  }
  const handleSubmunu = (subitem, subIdx) => {
    navigate(`/mber_login`, { state: { url: subitem.url } });
    closeMobileMenu();
  }

  const handleHover = (e) => {
    // console.log("handleHover called!", e.target); // 確認函數被調用

    const rect = e.target.getBoundingClientRect();
    const navRect = e.target.closest("nav")?.getBoundingClientRect();

    if (!navRect) {
      console.log("No nav element found!");
      return;
    }

    // 檢查是否為手機版（用於console log）
    const isMobile = window.innerWidth <= 768;

    // 統一的位置計算方式
    const x = rect.left - navRect.left + rect.width / 2;
    const y = rect.top - navRect.top + rect.height / 2;

    // console.log("Ball position calculated:", {
    //   x,
    //   y,
    //   isMobile,
    //   targetRect: rect,
    //   navRect: navRect,
    //   target: e.target.className,
    //   targetText: e.target.textContent,
    // }); // 詳細除錯用

    // 主球立即移動並顯示
    setMainBallPos({ x, y, show: true });
    // console.log("Main ball set to show:", { x, y, show: true });

    // 跟隨球動畫：縮小 → 移動 → 回彈
    setFollowerBallPos((prev) => ({ ...prev, show: true, scale: 0.7 }));
    // console.log("Follower ball set to show");

    setTimeout(() => {
      setFollowerBallPos({ x, y, show: true, scale: 1 });
      // console.log("Follower ball moved to position");
    }, 80);
  };

  const handleLeave = () => {
    // console.log("handleLeave called!");
    setMainBallPos((prev) => ({ ...prev, show: false }));
    setFollowerBallPos((prev) => ({ ...prev, show: false }));
    // console.log("Balls hidden");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveSubmenu(null); // 關閉選單時也關閉子選單
  };

  const handleSubmenuToggle = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const handleSubmenuClose = () => {
    setActiveSubmenu(null);
  };

  // 測試函數：強制顯示球球
  const testBallShow = () => {
    console.log("Test ball show triggered");
    setMainBallPos({ x: 200, y: 300, show: true });
    setFollowerBallPos({ x: 200, y: 300, show: true, scale: 1 });
  };

  return (
    <>

      {/* Gooey Filter 定義 */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="goo">
            <frGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -12"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* navbar */}
      <header className={`${styles["my-navbar"]} ${className || ""}`}>
        <div className={styles["left-placeholder"]}>
          <div className={styles.home}>
            <ChargegoLogo className={styles["chargego-logo"]} />
          </div>
        </div>
        <div className={`${styles["right-placeholder"]}`}>

          {/* 漢堡選單（手機/平板顯示） */}
          <div
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <nav className={`${styles.menu}${mobileMenuOpen ? " " + styles.active : ""}`}>
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className={styles["menu-item-wrapper"]}
                onMouseEnter={() => {
                  if (window.innerWidth > 768 && item.submenu) {
                    setActiveSubmenu(idx);
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 768) {
                    setActiveSubmenu(null);
                  }
                }}
              >
                <div
                  className={styles["menu-item"]}
                  onMouseEnter={(e) => {
                    handleHover(e);
                    if (window.innerWidth > 768 && item.submenu) {
                      setActiveSubmenu(idx);
                    }
                  }}
                  onMouseLeave={(e) => {
                    handleLeave(e);
                  }}
                  onTouchStart={(e) => {
                    if (window.innerWidth <= 768) {
                      handleHover(e);
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (window.innerWidth <= 768) {
                      setTimeout(() => {
                        handleLeave(e);
                      }, 300);
                    }
                  }}
                  onClick={() => { navHandler(item, idx); }}
                  style={{ cursor: ["服務據點", "關於我們"].includes(item.title) ? 'pointer' : undefined }}
                >
                  {item.title}
                  {item.submenu && (
                    <span className={styles["dropdown-arrow"]}>
                      {activeSubmenu === idx ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* 子選單 */}
                {item.submenu && (
                  <div
                    className={`${styles.submenu} ${activeSubmenu === idx ? styles.show : ""}`}
                  >
                    {item.submenu.map((subitem, subIdx) => (
                      <div
                        key={subIdx}
                        className={styles["submenu-item"]}
                        onMouseEnter={(e) => {
                          // 子選單項目在所有裝置都觸發球球動畫（包括手機版）
                          handleHover(e);
                        }}
                        onMouseLeave={(e) => {
                          // 子選單項目離開時隱藏球球（所有裝置）
                          handleLeave(e);
                        }}
                        onTouchStart={(e) => {
                          // 手機版觸控子選單項目時也觸發球球動畫（作為備用）
                          if (window.innerWidth <= 768) {
                            handleHover(e);
                          }
                        }}
                        onTouchEnd={(e) => {
                          // 觸控結束時隱藏球球
                          if (window.innerWidth <= 768) {
                            setTimeout(() => {
                              handleLeave(e);
                            }, 300);
                          }
                        }}
                        onClick={() => {
                          handleSubmunu(subitem, subIdx);
                        }}
                      >
                        {subitem.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* main ball */}
            <div
              className={`${styles.ball} ${styles.main} ${mainBallPos.show ? styles.show : ""}`}
              style={{
                left: mainBallPos.x,
                top: mainBallPos.y,
                transform: `translate(-50%, -50%)`,
              }}
            ></div>

            {/* follower ball */}
            <div
              className={`${styles.ball} ${styles.follower} ${followerBallPos.show ? styles.show : ""}`}
              style={{
                left: followerBallPos.x,
                top: followerBallPos.y,
                transform: `translate(-50%, -50%) scale(${followerBallPos.scale})`,
              }}
            ></div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default NavbarWebsite;