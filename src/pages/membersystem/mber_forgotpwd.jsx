import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import crypto from "crypto-js";
import styles from "../../styles/scss/mber_forgotpwd.module.scss";
import { apiRoutes } from "../../components/apiRoutes";

const API_BASE = import.meta.env.VITE_API_URL;

const memberBasePath = apiRoutes.member;

const mber_ForgotPwd = () => {
  const [form, setForm] = useState({
    email: "",
    pwd: "",
    confirmPwd: "",
    captcha: "",
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 請求驗證碼
  const handleSendCaptcha = async () => {
    try {
      await axios.post(`${API_BASE}${memberBasePath}/send-captcha`, {
        email: form.email,
      });
      setMsg("驗證碼已寄出，請檢查您的信箱");
    } catch (err) {
      setMsg("寄送失敗：" + (err.response?.data?.message || "請稍後再試"));
    }
  };

  // 送出重設密碼
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.pwd !== form.confirmPwd) {
      setMsg("密碼不一致");
      return;
    }
    try {
      await axios.post("${API_BASE}${memberBasePath}/reset-password", {
        email: form.email,
        pwd: crypto.SHA256(form.pwd).toString(crypto.enc.Hex).slice(0, 10),
        captcha: form.captcha,
      });
      setMsg("密碼重設成功，請重新登入");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMsg("重設失敗：" + (err.response?.data?.message || "請稍後再試"));
    }
  };

  return (
    <div className={styles.mber_ForgotPwd}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>忘記密碼</h2>
        </div>
        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={styles.label}>
                請輸入Email：
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="pwd" className={styles.label}>
                請輸入新密碼：
              </label>
              <input
                type="password"
                id="pwd"
                name="pwd"
                className={styles.input}
                required
                value={form.pwd}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirm-pwd" className={styles.label}>
                再次輸入新密碼：
              </label>
              <input
                type="password"
                id="confirm-pwd"
                name="confirmPwd"
                className={styles.input}
                required
                value={form.confirmPwd}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="captcha" className={styles.label}>
                請輸入驗證碼：
              </label>
              <input
                type="text"
                id="captcha"
                name="captcha"
                className={styles.input}
                required
                value={form.captcha}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleSendCaptcha}
                className={styles.captchaButton}
              >
                再次請求驗證碼
              </button>
            </div>

            <div>
              <button type="submit" className={styles.button}>
                送出
              </button>
            </div>
            {msg && <div className={styles.msg}>{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default mber_ForgotPwd;
