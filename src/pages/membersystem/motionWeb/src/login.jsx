import React, { useState } from "react";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "", captcha: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 這裡可以加上 API 串接
    alert("登入功能尚未串接");
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
