import React, { useState } from "react";
import axios from "axios";

// 註冊元件
const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    mail: "",
    phone: "",
    city: "",
    credit_card_number: "",
    credit_card_date: "",
    subpwd: "",
    agreerule: false,
    event: true,
  });

  // 驗證碼
  const [captchaValue, setCaptchaValue] = useState(() =>
    Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
  );
  // 處理表單變更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 驗證碼檢查
    if (form.subpwd !== String(captchaValue)) {
      alert("驗證碼錯誤，請重新輸入");
      return;
    }
    // 密碼確認
    if (form.password !== form.confirmPassword) {
      alert("密碼與確認密碼不一致");
      return;
    }
    // API 串接
    try {
      const res = await axios.post("/api/register", {
        user_name: form.username,
        password: form.password,
        email: form.mail,
        telephone: form.phone,
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
  // 處理表單清空
  const handleClear = () => {
    setForm({
      username: "",
      password: "",
      confirmPassword: "",
      mail: "",
      credit_card_number: "",
      credit_card_date: "",
      phone: "",
      city: "",
      captcha: "",
      subpwd: "",
      agreerule: false,
      event: true,
    });
    setCaptchaValue(Math.floor(Math.random() * (999999 - 100000 + 1) + 100000));
  };

  return (
    <div className="container">
      <h1>會員註冊</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">帳號：</label>
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
          <label htmlFor="password">密碼：</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">確認密碼：</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="mail">電子郵件：</label>
          <input
            id="mail"
            name="mail"
            type="email"
            value={form.mail}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone">電話：</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="credit_card_number">信用卡號：</label>
          <input
            id="credit_card_number"
            name="credit_card_number"
            type="text"
            value={form.credit_card_number}
            onChange={handleChange}
            maxLength={16}
          />
        </div>
        <div>
          <label htmlFor="credit_card_date">信用卡到期日：</label>
          <input
            id="credit_card_date"
            name="credit_card_date"
            type="text"
            value={form.credit_card_date}
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength={5}
          />
        </div>
        <div>
          <span>現居地點：</span>
          <select
            name="city"
            id="city-list"
            value={form.city}
            onChange={handleChange}
          >
            <option value="">請選擇現居地點</option>
            <option value="台北市">台北市</option>
            <option value="新北市">新北市</option>
            <option value="基隆市">基隆市</option>
            <option value="宜蘭縣">宜蘭縣</option>
            <option value="桃園市">桃園市</option>
            <option value="新竹縣">新竹縣</option>
            <option value="新竹市">新竹市</option>
            <option value="苗栗縣">苗栗縣</option>
            <option value="台中市">台中市</option>
            <option value="彰化縣">彰化縣</option>
            <option value="雲林縣">雲林縣</option>
            <option value="嘉義市">嘉義市</option>
            <option value="嘉義縣">嘉義縣</option>
            <option value="台南市">台南市</option>
            <option value="高雄市">高雄市</option>
            <option value="屏東縣">屏東縣</option>
            <option value="花蓮縣">花蓮縣</option>
            <option value="台東縣">台東縣</option>
            <option value="澎湖縣">澎湖縣</option>
            <option value="金門縣">金門縣</option>
            <option value="連江縣">連江縣</option>
          </select>
        </div>
        <div id="capbox">
          <span>
            驗證碼：<span id="captchapwd">{captchaValue}</span>
          </span>
        </div>
        <br />
        <label htmlFor="subpwd">請輸入驗證碼：</label>
        <input
          id="subpwd"
          name="subpwd"
          type="text"
          value={form.subpwd}
          onChange={handleChange}
        />
        <br />
        <input
          type="checkbox"
          id="agreerule"
          name="agreerule"
          checked={form.agreerule}
          onChange={handleChange}
        />
        <span>同意使用者規範</span>
        <br />
        <input
          type="checkbox"
          id="event"
          name="event"
          checked={form.event}
          onChange={handleChange}
        />
        <span>訂閱活動資訊</span>
        <br />
        <button id="register" type="submit">
          註冊
        </button>
        <button id="clear" type="button" onClick={handleClear}>
          清除
        </button>
      </form>
    </div>
  );
};

export default Register;
