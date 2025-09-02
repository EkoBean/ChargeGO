import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/scss/mber_profile.scss";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import NavBarPhone from "../../components/NavBarPhone";

const mber_Profile = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  // 返回按鈕點擊事件
  const backBtnClick = () => {
    return () => navigate(-1);
  };

  // 通知按鈕點擊事件
  const notifyBtnClick = () => {
    return () => navigate("/mber_info");
  };

  // 取得 user 資料（登入狀態由 session 驗證）
  useEffect(() => {
    fetch(`${API_BASE}/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (data.user.country) setCountry(data.user.country);
        } else {
          alert("請先登入");
          navigate("/mber_login");
        }
      })
      .catch(() => {
        alert("請先登入");
        navigate("/mber_login");
      });
  }, [navigate]);

  // 處理城市選擇變更
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  // 處理會員資料修改
  const handleEditProfile = () => {
    alert("資料修改功能即將開放");
    // 這裡可以實現資料修改的功能
  };

  // 處理會員停權
  const handleDeactivateAccount = async () => {
    if (window.confirm("確定要申請停權帳號嗎？")) {
      try {
        const response = await fetch(`${API_BASE}/api/user/deactivate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ user_id: Number(user?.uid), status: "1" }),
        });
        if (response.ok) {
          // 再次取得最新 user 狀態
          fetch(`${API_BASE}/check-auth`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.authenticated && data.user) {
                setUser(data.user);
              }
              alert("您的會員帳號已停權");
              navigate("/mber_login");
            });
        } else {
          alert("停權申請失敗，請稍後再試");
        }
      } catch (error) {
        alert("停權申請失敗，請稍後再試");
      }
    }
  };

  return (
    <div className="mber_info">
      <ChargegoLogo className="mobile-only-logo" />
      <NavBarPhone />
      {/* Header */}

      <span
        className="back-icon mobile-only-back"
        onClick={() => window.history.back()}
        title="回到上頁"
      >
        ◀︎
      </span>
      <div className="mobile-arc-bg">
        <div className="mobile-arc-content">
          <h2 className="mber_info_title">會員資料</h2>
        </div>
      </div>
      <div className="mber_info_header">
        <img
          src="./Iconimg/notify.svg"
          alt="通知按鈕"
          className="notify-btn"
          onClick={notifyBtnClick()}
        />
      </div>
      <div className="mber_info_main">
        {/* 頭像 */}
        <div className="avatar">
          <img src="./Iconimg/user.svg" alt="用戶頭像" />
        </div>
        {/* 卡片列 */}
        <div className="mber_info_cards">
          <div className="card">
            <img src="./Iconimg/card_wallet.svg" alt="信用卡資料" />
            <span>信用卡資料</span>
          </div>
          <div className="card">
            <img src="./Iconimg/card_bill.svg" alt="帳單紀錄" />
            <span>帳單紀錄</span>
          </div>
          <div className="card">
            <img src="./Iconimg/card_help.svg" alt="幫助中心" />
            <span>幫助中心</span>
          </div>
        </div>
        {/* 會員資料區塊 */}
        <div className="mber_info_profile">
          <div>
            <span>會員姓名｜</span>
            <span>{user?.user_name || "王大明"}</span>
          </div>
          <div>
            <span>電話｜</span>
            <span>
              {user?.telephone
                ? user.telephone.replace(/(\d{2})\d{4}(\d{4})/, "$1****$2")
                : "09**-****-***"}
            </span>
          </div>
          <div>
            <span>e-mail｜</span>
            <span>{user?.email || "gmail@gmail.com"}</span>
          </div>
          <div>
            <span>居住城市｜</span>
            <select value={country} onChange={handleCountryChange}>
              <option>台北市</option>
              <option>新北市</option>
              <option>桃園市</option>
              <option>台中市</option>
              <option>台南市</option>
              <option>高雄市</option>
            </select>
          </div>
        </div>
      </div>
      {/* 按鈕區塊 */}
      <div className="mber_info_btns">
        <button onClick={handleEditProfile}>修改會員資料</button>
        <button onClick={handleDeactivateAccount}>會員停權</button>
      </div>
    </div>
  );
};

export default mber_Profile;
