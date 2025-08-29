import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
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
            headers: { "Content-Type": "application/json" }
          })
            .then(res => res.json())
            .then(data => {
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
    <div className="profile">
      {/* 會員資料Header */}
      <div className="title">
        <img
          src="./Iconimg/backBtn.svg"
          alt="返回按鈕"
          className="back-button"
          onClick={backBtnClick()}
        />
        <h1>會員資料</h1>
        <img
          src="./Iconimg/notify.svg"
          alt="通知按鈕"
          className="notify-button"
          onClick={notifyBtnClick()}
        />
      </div>
      {/* 會員頭像 */}
      <div className="avatar">
        <img
          src="./Iconimg/Shopping Cart.svg"
          alt="用戶頭像"
        />
      </div>
      {/* 卡片列 */}
      <div className="card-list">
        <div className="myWallet">
          <img src="./Iconimg/wallet.svg" />
          <h5>信用卡資料</h5>
        </div>
        <div className="rnet-record">
          {/* <img src="" alt="租借圖片" /> */}
          <h5>租借紀錄</h5>
        </div>
        <div className="help-center">
          <img src="./Iconimg/help.svg" alt="" />
          <h5>幫助中心</h5>
        </div>
      </div>
      {/* 會員個人資訊欄 */}
      <div className="personal-info">
        <ul className="info-list">
          <li>
            <h5>會員姓名：</h5>
            <p>{user?.user_name || "尚未設定"}</p>
          </li>
          <li>
            <h5>電話：</h5>
            <p>{user?.telephone || "尚未設定"}</p>
          </li>
          <li>
            <h5>e-mail：</h5>
            <p>{user?.email || "尚未設定"}</p>
          </li>
          <li>
            <h5>居住城市：</h5>
            <p>{country || "尚未設定"}</p>
          </li>
          <li>
            <h5>地址：</h5>
            <p>{user?.address || "尚未設定"}</p>
          </li>
          
       
          
        </ul>
      </div>
      {/* 會員資料修改按鈕 */}
      <div className="edit-button">
        <button onClick={handleEditProfile}>修改會員資料</button>
        <button onClick={handleDeactivateAccount}>會員停權</button>
      </div>
    </div>
  );
};

export default mber_Profile;
