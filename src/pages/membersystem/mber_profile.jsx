import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/scss/mber_profile.module.scss";
import NavBarApp from "../../components/NavBarApp";
import Notify from "../../components/notify";
import { apiRoutes } from "../../components/apiRoutes";
import BackIcon from "../../components/backIcon";

const mber_Profile = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const memberBasePath = apiRoutes.member;

  // 返回按鈕點擊事件
  const backBtnClick = () => {
    return () => navigate(-1);
  };

  // 取得 user 資料（登入狀態由 session 驗證）
  useEffect(() => {
    fetch(`${API_BASE}${memberBasePath}/check-auth`, {
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
          console.log('data :>> ', data);
          alert("請先登入");
          navigate("/mber_login");
        }
      })
      .catch((err) => {
        console.error(err);
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
    navigate("/mber_edit");
    // 這裡可以實現資料修改的功能
  };

  // 處理會員停權
  const handleDeactivateAccount = async () => {
    if (window.confirm("確定要申請停權帳號嗎？")) {
      try {
        const response = await fetch(`${API_BASE}${memberBasePath}/user/deactivate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ user_id: Number(user?.uid), status: "1" }),
        });
        if (response.ok) {
          // 再次取得最新 user 狀態
          fetch(`${API_BASE}${memberBasePath}/check-auth`, {
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
    <div className={styles.mber_info}>
      <NavBarApp className={styles.mobile_only_nav} />
      {/* Header */}
      <div className={styles.info_container}>
        <BackIcon className={'d-sm-none'} />
        <div className={styles.mobile_arc_bg}>
          <div className={`${styles.mobile_arc_content}`}>
            <h2 className={styles.mber_info_title}>會員資料</h2>
          </div>
        </div>
        <div className={styles.mber_info_header}>
          <Notify />
        </div>
        <div className={styles.mber_info_main}>
          {/* 頭像 */}
          <div className={styles.avatar}>
            <img src="../../../public/user.svg" alt="用戶頭像" />
          </div>
          {/* 卡片列 */}
          <div className={styles.mber_info_cards}>
            <div className={styles.card}>
              <img
                src="/Iconimg/wallet.svg"
                alt="信用卡資料"
                onClick={() => navigate("/mber_addCreditcard")}
              />
              <span>信用卡資料</span>
            </div>
            <div className={styles.card}>
              <img
                src="/Iconimg/bill.svg"
                alt="帳單紀錄"
                onClick={() => navigate("/mber_rentRecord")}
              />

              <span>租借紀錄</span>
            </div>
            <div className={styles.card}>
              <img src="/Iconimg/help.svg" alt="幫助中心" />
              <span>幫助中心</span>
            </div>
          </div>
          {/* 會員資料區塊 */}
          <div className={styles.mber_info_profile}>
            <div>
              <span>帳號｜</span>
              <span>{user?.login_id || "testuser"}</span>
            </div>
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
                <option value="">選擇縣市</option>
                <option value="台北市">台北市</option>
                <option value="新北市">新北市</option>
                <option value="基隆市">基隆市</option>
                <option value="桃園市">桃園市</option>
                <option value="新竹縣">新竹縣</option>
                <option value="新竹市">新竹市</option>
                <option value="苗栗縣">苗栗縣</option>
                <option value="台中市">台中市</option>
                <option value="彰化縣">彰化縣</option>
                <option value="南投縣">南投縣</option>
                <option value="雲林縣">雲林縣</option>
                <option value="嘉義縣">嘉義縣</option>
                <option value="嘉義市">嘉義市</option>
                <option value="台南市">台南市</option>
                <option value="高雄市">高雄市</option>
                <option value="屏東縣">屏東縣</option>
                <option value="宜蘭縣">宜蘭縣</option>
                <option value="花蓮縣">花蓮縣</option>
                <option value="台東縣">台東縣</option>
                <option value="連江縣">連江縣</option>
                <option value="澎湖縣">澎湖縣</option>
                <option value="金門縣">金門縣</option>
              </select>
            </div>
            <div>
              <span>地址｜</span>
              <span>{user?.address || ""}</span>
            </div>
          </div>
        </div>
        {/* 按鈕區塊 */}
        <div className={styles.mber_info_btns}>
          <button onClick={handleEditProfile}>修改會員資料</button>
          <button onClick={handleDeactivateAccount}>會員停權</button>
        </div>
      </div>
    </div>
  );
};

export default mber_Profile;
