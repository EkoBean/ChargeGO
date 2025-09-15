import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import crypto from "crypto-js";
import styles from "../../styles/scss/mber_login.module.scss";
import { apiRoutes } from "../../components/apiRoutes";
import BackIcon from "../../components/backIcon";

const API_BASE = import.meta.env.VITE_API_URL;

const memberBasePath = apiRoutes.member;

const mber_Login = () => {
  const [form, setForm] = useState({
    login_id: "",
    password: "",
    captcha: "",
  });
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 驗證碼初始化
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // 更新驗證碼
  const refreshCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(code);
  };

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
    if (!form.login_id.trim()) {
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
    if (form.captcha !== generatedCaptcha) {
      setError("驗證碼錯誤");
      alert("驗證碼錯誤");
      return;
    }

    // 密碼雜湊（10碼）
    try {
      const trimmedLoginId = form.login_id.trim();
      const trimmedPassword = form.password.trim();
      const hashedPwd = crypto
        .SHA256(trimmedPassword)
        .toString(crypto.enc.Hex)
        .slice(0, 10);

      // 登入 API 呼叫
      const res = await axios.post(
        `${API_BASE}${memberBasePath}/mber_login`,
        {
          login_id: trimmedLoginId, // login_id
          password: hashedPwd, // hashed_password
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

  return (
    <div className={styles["login-bg"]}>
      {/* 閃電背景 */}
      <img className={styles.lightning} src="../../../public/lightning.png" />
      <div className={styles["login-container"]}>
        <div className={styles["login-form-section"]}>
          {/* 返回按鈕移到最上方 */}
        <BackIcon className={'d-sm-none'} />

          {/* header區塊：arc+logo+標題 */}
          <div className={styles["mobile-arc-bg"]}>
            <div className={styles["mobile-arc-content"]}>
              <h2 className={styles["login-title"]}>會員登入</h2>
            </div>
          </div>
          {/* 登入表單區塊 */}
          <form className={styles["login-form"]} onSubmit={handleSubmit}>
            {/* 錯誤訊息顯示 */}
            {error && (
              <div className={styles["login-error-message"]}>{error}</div>
            )}
            {/* 帳號欄位 */}
            <input
              type="text"
              name="login_id"
              className={styles["login-input"]}
              placeholder="帳號"
              value={form.login_id}
              onChange={handleChange}
              required
            />
            {/* 密碼欄位 */}
            <input
              type="password"
              name="password"
              className={styles["login-input"]}
              placeholder="密碼"
              value={form.password}
              onChange={handleChange}
              required
            />
            {/* 忘記密碼 */}
            <button
              type="button"
              className={styles["forgot-link"]}
              onClick={() => navigate("/mber_forgotpwd")}
            >
              忘記密碼
            </button>
            {/* 驗證碼顯示與刷新 */}
            <div className={styles["captcha-row"]}>
              <span className={styles["captcha-label"]}>驗證碼</span>
              <span className={styles["captcha-value"]}>{generatedCaptcha}</span>
              <button
                type="button"
                className={styles["captcha-refresh"]}
                onClick={refreshCaptcha}
              >
                重新產生
              </button>
            </div>
            {/* 驗證碼輸入欄位 */}
            <input
              type="text"
              name="captcha"
              className={styles["login-input"]}
              placeholder="請輸入驗證碼"
              value={form.captcha}
              onChange={handleChange}
              required
            />
            {/* 登入按鈕 */}
            <button type="submit" className={styles["login-btn"]}>
              登入
            </button>
            <button
              type="button"
              className={styles["register-btn"]}
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
