import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import crypto from "crypto-js";
import "../../styles/scss/mber_login.scss";
import ChargegoLogo from "../../components/ChargegoLogo";

const mber_Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    captcha: "",
  });
  // 產生驗證碼
  const [captchaValue, setCaptchaValue] = useState(() =>
    Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
  );
  // 更新驗證碼
  const [error, setError] = useState("");
  // 導向
  const navigate = useNavigate();
  // 處理表單變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 必填欄位檢查
    if (!form.username.trim()) {
      setError("請輸入帳號");
      return;
    }
    if (!form.password) {
      setError("請輸入密碼");
      return;
    }
    if (!form.captcha.trim()) {
      setError("請輸入驗證碼");
      return;
    }
    if (form.captcha !== String(captchaValue)) {
      setError("驗證碼錯誤");
      alert("驗證碼錯誤");
      return;
    }

    // 密碼雜湊（10碼）
    try {
      const hashedPwd = crypto
        .SHA256(form.password)
        .toString(crypto.enc.Hex)
        .slice(0, 10);

      // 登入 API 呼叫
      const res = await axios.post(
        "http://localhost:3000/mber_login",
        {
          user_name: form.username,
          password: hashedPwd,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        const status = String(res.data.user?.status);
        if (status === "1" || status === "-1") {
          setError("您的會員帳號已停權");
          return;
        }
        // 登入成功後直接跳頁，會員資料由 /check-auth 取得
        alert("登入成功！");
        navigate("/mber_profile");
      } else {
        setError(res.data?.message || "登入失敗，請檢查帳號密碼");
      }
    } catch (err) {
      // 加強錯誤處理，顯示後端回傳訊息
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || "系統錯誤，請稍後再試");
      console.error("登入錯誤:", err);
    }
  };
  // 重新產生驗證碼
  const refreshCaptcha = () => {
    setCaptchaValue(Math.floor(Math.random() * (999999 - 100000 + 1) + 100000));
  };

  return (
    <div className="login-bg">
      {/* 閃電背景 */}
      <img className="lightning" src="../../../public/lightning.png" />
      <div className="login-container">
        <div className="login-form-section">
          {/* 返回按鈕移到最上方 */}
          <span
            className="back-icon mobile-only-back"
            onClick={() => window.history.back()}
            title="回到上頁"
          >
            ◀︎
          </span>
          {/* header區塊：arc+logo+標題 */}
          <div className="mobile-arc-bg">
            <div className="mobile-arc-content">
              <ChargegoLogo className="login-logo" />
              <h2 className="login-title">會員登入</h2>
            </div>
          </div>
          {/* 登入表單區塊 */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* 錯誤訊息顯示 */}
            {error && <div className="login-error-message">{error}</div>}
            {/* 帳號欄位 */}
            <input
              type="text"
              name="username"
              className="login-input"
              placeholder="帳號"
              value={form.username}
              onChange={handleChange}
              required
            />
            {/* 密碼欄位 */}
            <input
              type="password"
              name="password"
              className="login-input"
              placeholder="密碼"
              value={form.password}
              onChange={handleChange}
              required
            />
            {/* 忘記密碼 */}
            <button
              type="button"
              className="forgot-link"
              onClick={() => alert("請聯繫客服重設密碼")}
            >
              忘記密碼
            </button>
            {/* 驗證碼顯示與刷新 */}
            <div className="captcha-row">
              <span className="captcha-label">驗證碼</span>
              <span className="captcha-value">{captchaValue}</span>
              <button
                type="button"
                className="captcha-refresh"
                onClick={refreshCaptcha}
              >
                重新產生
              </button>
            </div>
            {/* 驗證碼輸入欄位 */}
            <input
              type="text"
              name="captcha"
              className="login-input"
              placeholder="請輸入驗證碼"
              value={form.captcha}
              onChange={handleChange}
              required
            />
            {/* 登入按鈕 */}
            <button type="submit" className="login-btn">
              登入
            </button>
            <button
              type="button"
              className="register-btn"
              onClick={() => navigate("/mber_register")}
            >
              註冊
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default mber_Login;
