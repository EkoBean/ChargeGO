import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/scss/mber_register.scss";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import NavBarPhone from "../../components/NavBarPhone";
const mber_Register = () => {
  // 註冊表單狀態
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    telephone: "",
    county: "", // 新增 county 欄位
    address: "",
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
  // 註冊成功
  const [isSuccess, setIsSuccess] = useState(false);
  // 轉跳頁面倒數計時
  const [countdown, setCountdown] = useState(3);
  // 導向網站
  const navigate = useNavigate();
  // 表單變更處理
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    // 數字欄位簡單過濾
    if (name === "telephone") v = v.replace(/\D/g, "").slice(0, 15);
    if (name === "credit_card_number") v = v.replace(/\D/g, "").slice(0, 16);
    if (name === "credit_card_date") v = v.replace(/[^0-9/]/g, "").slice(0, 5);
    setForm((prev) => ({ ...prev, [name]: v }));
  };
  // 驗證表單有無錯誤
  const validate = () => {
    // 必填欄位檢查
    if (!form.username.trim()) return "帳號必填";
    if (!form.password) return "密碼必填";
    if (!form.confirmPassword) return "確認密碼必填";
    if (!form.email.trim()) return "Email 必填";
    if (!form.telephone.trim()) return "電話必填";
    if (!form.county.trim()) return "縣市必填";
    if (!form.address.trim()) return "地址必填";
    if (!form.credit_card_number.trim()) return "信用卡號必填";
    if (!form.credit_card_date.trim()) return "信用卡到期日必填";
    if (!form.subpwd.trim()) return "驗證碼必填";
    // 其他驗證
    if (form.subpwd !== String(captchaValue)) return "驗證碼錯誤";
    if (form.password !== form.confirmPassword) return "密碼與確認密碼不一致";
    if (!form.agreerule) return "請勾選同意使用者規範";
    if (form.username == form.password) return "帳號密碼不可相同";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Email 格式錯誤";
    if (form.telephone && form.telephone.length < 8) return "電話格式不正確";
    if (form.credit_card_number && form.credit_card_number.length !== 16)
      return "信用卡號需 16 碼數字";
    if (
      form.credit_card_date &&
      !/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.credit_card_date)
    )
      return "到期日格式需為 MM/YY";
    return null;
  };
  // 表單提交處理
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      alert(errMsg);
      return;
    }
    try {
      const payload = {
        user_name: form.username,
        password: form.password,
        email: form.email,
        telephone: form.telephone,
        country: form.county, // 傳送 county 作為 country 欄位
        address: form.address,
        credit_card_number: form.credit_card_number,
        credit_card_date: form.credit_card_date,
        status: "0", // 修正為字串型態，符合 enum
      };
      const res = await axios.post(
        "http://localhost:3000/mber_register",
        payload,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setIsSuccess(true);
        handleClear();
        // 註冊後直接跳頁，會員資料由 /check-auth 取得

        // 倒數計時然後轉跳
        let count = 3;
        const timer = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(timer);
            navigate("/mber_login");
          }
        }, 1000);
      } else {
        alert(res.data?.message || "註冊失敗");
      }
    } catch (err) {
      console.error("註冊錯誤:", err);
      alert("伺服器錯誤，請稍後再試");
    }
  };
  // 清空表單
  const handleClear = () => {
    setForm({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      telephone: "",
      county: "", // 清空 county
      address: "",
      credit_card_number: "",
      credit_card_date: "",
      subpwd: "",
      agreerule: false,
      event: true,
    });
    setCaptchaValue(Math.floor(Math.random() * (999999 - 100000 + 1) + 100000));
  };

  // 如果註冊成功，顯示成功訊息和倒數計時
  if (isSuccess) {
    return (
      <div className="container">
        <div className="alert alert-success" role="alert">
          <h4 className="alert-heading">註冊成功!</h4>
          <p>您的帳戶已成功創建，{countdown} 秒後將自動前往登入頁面。</p>
          <hr />
          <button
            className="btn btn-primary"
            onClick={() => navigate("/mber_login")}
          >
            立即前往登入
          </button>
        </div>
      </div>
    );
  }
  // 註冊表單主要內容
  return (
    <div className="register-bg">
      {/* 手機版專用區塊 */}
      <ChargegoLogo className="mobile-only-logo" />
      <div className="register-container">
        <div className="register-form-section">
          {/* 返回上頁按鈕 */}
          <span
            className="back-icon mobile-only-back"
            onClick={() => window.history.back()}
            title="回到上頁"
          >
            ◀︎
          </span>
          <div className="mobile-arc-bg">
            <div className="mobile-arc-content">
              <h2 className="register-title">會員註冊</h2>
            </div>
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form-row">
              {/* 帳號 */}
              <div className="register-input-group">
                <label htmlFor="username" className="register-label">
                  帳號：
                </label>
                <div className="col-md-9">
                  <input
                    className="register-input"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    type="text"
                  />
                </div>
              </div>
              {/* 密碼 */}
              <div className="register-input-group">
                <label htmlFor="password" className="register-label">
                  密碼：
                </label>
                <div className="col-md-9">
                  <input
                    className="register-input"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    type="password"
                  />
                </div>
              </div>
              {/* 確認密碼 */}
              <div className="register-input-group">
                <label
                  htmlFor="confirmPassword"
                  className="register-label"
                >
                  確認密碼：
                </label>
                <div className="col-md-9">
                  <input
                    className="register-input"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    type="password"
                  />
                </div>
              </div>
              {/* Email */}
              <div className="register-input-group">
                <label htmlFor="email" className="register-label">
                  電子郵件：
                </label>
                <div className="col-md-9">
                  <input
                    className="register-input"
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* 電話 */}
              <div className="register-input-group">
                <label htmlFor="telephone" className="register-label">
                  電話：
                </label>
                <div className="col-md-9">
                  <input
                    className="register-input"
                    id="telephone"
                    name="telephone"
                    type="text"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="僅數字"
                  />
                </div>
              </div>
              {/* 地址 */}
              <div className="register-input-group">
                <label htmlFor="address" className="register-label">
                  地址：
                </label>
                  <select
                    className="register-input"
                    name="county"
                    id="county"
                    value={form.county}
                    onChange={handleChange}
                    required
                  >
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
              <div className="register-input-group">
                 <input
                    className="register-input"
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="請填完後續地址"
                  />
              </div>
              {/* 信用卡號 */}
              <div className="register-input-group">
                <label
                  htmlFor="credit_card_number"
                  className="col-md-3 col-form-label"
                >
                  信用卡號：
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    id="credit_card_number"
                    name="credit_card_number"
                    type="text"
                    value={form.credit_card_number}
                    onChange={handleChange}
                    maxLength={16}
                    placeholder="16 碼"
                  />
                </div>
              </div>
              {/* 信用卡到期日 */}
              <div className="register-input-group">
                <label
                  htmlFor="credit_card_date"
                  className="col-md-3 col-form-label"
                >
                  信用卡到期日：
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    id="credit_card_date"
                    name="credit_card_date"
                    type="text"
                    value={form.credit_card_date}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
              </div>
              {/* 驗證碼 */}
              <div className="register-input-group" id="capbox">
                <label className="col-md-3 col-form-label">驗證碼：</label>
                <div className="col-md-9 d-flex align-items-center">
                  <span
                    className="captcha-value"
                    style={{ fontWeight: "bold" }}
                  >
                    {captchaValue}
                  </span>
                  <button
                    type="button"
                    className="captcha-refresh"
                    onClick={() =>
                      setCaptchaValue(
                        Math.floor(
                          Math.random() * (999999 - 100000 + 1) + 100000
                        )
                      )
                    }
                  >
                    重新產生
                  </button>
                </div>
              </div>
              <div className="register-input-group">
                <label htmlFor="subpwd" className="col-md-3 col-form-label">
                  請輸入驗證碼：
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    id="subpwd"
                    name="subpwd"
                    type="text"
                    value={form.subpwd}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              {/* 條款 & 活動 */}
              <div className="register-input-group">
                <div className="col-md-9 offset-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreerule"
                      name="agreerule"
                      checked={form.agreerule}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="agreerule">
                      同意使用者規範
                    </label>
                  </div>
                </div>
              </div>
              <div className="register-input-group">
                <div className="col-md-9 offset-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="event"
                      name="event"
                      checked={form.event}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="event">
                      訂閱活動資訊
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* 按鈕 */}
            <div className="register-input-group">
              <div className="col-md-9 offset-md-3">
                <button
                  className="correct-btn"
                  id="mber_register"
                  type="submit"
                >
                  註冊
                </button>
                <button
                  className="leave-btn"
                  id="clear"
                  type="button"
                  onClick={handleClear}
                >
                  清除
                </button>
                <button
                  className="alreadyRegistered"
                  type="button"
                  onClick={() => navigate("/mber_login")}
                >
                  已有帳號？登入
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default mber_Register;
