import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "", captcha: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API 串接

    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        user_name: form.username,
        password: form.password,
        email: form.mail,
        telephone: form.telephone,
        address: form.city,
        blacklist: 0,
        wallet: 0,
        point: 0,
        total_carbon_footprint: 0,
        credit_card_number: form.credit_card_number,
        credit_card_date: form.credit_card_date,
      });
      if (res.data.success) {
        alert("註冊成功！");
        handleClear();
      } else {
        alert(res.data.message || "註冊失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };

  return (
    <div className="login-container">
      <h1>會員登入</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">帳號:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密碼:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <span>驗證碼：</span>
          {/* 這裡可以放驗證碼圖片或亂數 */}
        </div>
        <label htmlFor="captcha">請輸入驗證碼：</label>
        <input
          id="captcha"
          name="captcha"
          type="text"
          value={form.captcha}
          onChange={handleChange}
        />
        <br />
        <button type="submit">登入</button>
        <button type="button">註冊</button>
        <button type="button">忘記密碼?</button>
      </form>
    </div>
  );
};

export default Login;
