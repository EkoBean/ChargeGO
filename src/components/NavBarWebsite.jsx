import { useState } from "react";
import homeBtn from "/home-button.png";
import homeBtnHover from "/home-button-hover.png"; // 修正：使用絕對路徑
import "animate.css";
import styles from "../styles/scss/NavBarWebsite.module.scss";
import React from 'react';
import ChargegoLogo from "./ChargegoLogo";

function NavbarWebsite() {
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
    {
      title: "服務據點",
    },
    {
      title: "成為站點",
    },
    {
      title: "會員專區",
      submenu: ["會員登入", "會員註冊", "會員資料"],
    },
    {
      title: "租借系統",
      submenu: ["地點租借地圖"],
    },
    {
      title: "聯絡我們",
    },
    {
      title: "關於我們",
    },
  ];

  const handleHover = (e) => {
    console.log("handleHover called!", e.target); // 確認函數被調用

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

    console.log("Ball position calculated:", {
      x,
      y,
      isMobile,
      targetRect: rect,
      navRect: navRect,
      target: e.target.className,
      targetText: e.target.textContent,
    }); // 詳細除錯用

    // 主球立即移動並顯示
    setMainBallPos({ x, y, show: true });
    console.log("Main ball set to show:", { x, y, show: true });

    // 跟隨球動畫：縮小 → 移動 → 回彈
    setFollowerBallPos((prev) => ({ ...prev, show: true, scale: 0.7 }));
    console.log("Follower ball set to show");

    setTimeout(() => {
      setFollowerBallPos({ x, y, show: true, scale: 1 });
      console.log("Follower ball moved to position");
    }, 80);
  };

  const handleLeave = () => {
    console.log("handleLeave called!");
    setMainBallPos((prev) => ({ ...prev, show: false }));
    setFollowerBallPos((prev) => ({ ...prev, show: false }));
    console.log("Balls hidden");
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
      <header className={styles["my-navbar"]}>
        <div className={styles["left-placeholder"]}>
          <div className={styles.home}>
            <ChargegoLogo className={styles["chargego-logo"]} />
          </div>
        </div>
        <div className={styles["right-placeholder"]}></div>
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
                // 桌面版進入選單項目或子選單區域時保持開啟
                if (window.innerWidth > 768 && item.submenu) {
                  setActiveSubmenu(idx);
                }
              }}
              onMouseLeave={() => {
                // 桌面版離開整個選單區域時才關閉
                if (window.innerWidth > 768) {
                  setActiveSubmenu(null);
                }
              }}
            >
              <div
                className={styles["menu-item"]}
                onMouseEnter={(e) => {
                  // 球球動畫在所有裝置都觸發（包括手機版）
                  handleHover(e);
                  // 子選單只在桌面版自動打開
                  if (window.innerWidth > 768 && item.submenu) {
                    setActiveSubmenu(idx);
                  }
                }}
                onMouseLeave={(e) => {
                  // 球球動畫在所有裝置都觸發（包括手機版）
                  handleLeave(e);
                  // 桌面版不在這裡關閉子選單，改由menu-item-wrapper處理
                }}
                onTouchStart={(e) => {
                  // 手機版觸控時也觸發球球動畫（作為備用）
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
                  // 手機版點擊處理子選單開關
                  if (window.innerWidth <= 768) {
                    handleSubmenuToggle(idx);
                  }
                }}
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
                        console.log(`點擊了: ${item.title} - ${subitem}`);
                        closeMobileMenu();
                      }}
                    >
                      {subitem}
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
      </header>
    </>
  );
}

export default NavbarWebsite;