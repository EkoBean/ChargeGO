import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBarApp from "../../components/NavBarApp";
import styles from "../../styles/scss/mber_edit.module.scss";
import BackIcon from "../../components/backIcon";
import { apiRoutes } from "../../components/apiRoutes";

const mber_edit = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const [userName, setUserName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const memberBasePath = apiRoutes.member;

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
          setUserName(data.user.user_name || "");
          setTelephone(data.user.telephone || "");
          setEmail(data.user.email || "");
          setAddress(data.user.address || "");
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
    generateCaptcha();
  }, [navigate]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(code);
  };

  // 處理城市選擇變更
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  // 處理會員資料修改
  const handleSubmit = async () => {
    if (!user) return;
    // 驗證驗證碼必填且正確
    if (!captcha) {
      alert("請輸入驗證碼");
      return;
    }
    if (captcha !== generatedCaptcha) {
      alert("驗證碼輸入錯誤，請重新確認");
      return;
    }
    const updatedUser = {
      ...user,
      user_name: userName,
      telephone,
      email,
      country,
      address,
      captcha,
    };

    try {
      const response = await fetch(`${API_BASE}${memberBasePath}/update-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (data.success) {
        alert("修改成功");
      } else {
        alert("修改失敗");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("修改失敗");
    }
  };

  return (
    <div className={styles.mber_edit}>
      <NavBarApp />
      <div className={styles.edit_container}>
        <div className={styles.mobile_arc_bg}>
        <BackIcon className={'d-sm-none'} />
          <div className={styles.mobile_arc_content}>
            <h2 className={styles.mber_info_title}>會員資料</h2>
          </div>
        </div>

        <div className={styles.mber_info_main}>
          {/* 頭像 */}
          <div className={styles.avatar}>
            <img src="../../../public/user.svg" alt="用戶頭像" />
          </div>

          {/* 會員資料區塊 */}
          <div className={styles.mber_info_profile}>
            <div>
              <span>帳號｜</span>
              <span>{user?.login_id || "testuser"}</span>
            </div>
            <div>
              <span>會員姓名｜</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div>
              <span>電話｜</span>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div>
              <span>e-mail｜</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <span>驗證碼｜</span>
              <div className={styles.captcha_container}>
                <span className={styles.captcha}>{generatedCaptcha}</span>
                <button
                  type="button"
                  className={styles.captcha_refresh_btn}
                  onClick={generateCaptcha}
                >
                  重新產生
                </button>
              </div>
              <input
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="請輸入驗證碼"
              />
            </div>
          </div>
          {/* 修改送出 */}
          <div className={styles.edit_submit}>
            <button onClick={handleSubmit}>儲存修改</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default mber_edit;
