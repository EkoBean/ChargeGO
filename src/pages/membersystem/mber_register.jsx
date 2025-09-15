import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/scss/mber_register.module.scss"; 
import crypto from "crypto-js";
import { apiRoutes } from "../../components/apiRoutes";
import BackIcon from "../../components/backIcon";
import NavBarApp from "../../components/NavBarApp";

const memberBasePath = apiRoutes.member;

const mber_Register = () => {
  // 註冊表單狀態
  const [form, setForm] = useState({
    login_id: "",
    user_name: "",
    password: "",
    confirmPassword: "",
    email: "",
    telephone: "",
    county: "",
    address: "",
    credit_card_number: "",
    credit_card_month: "", // 月份
    credit_card_year: "", // 年份
    cvv: "", // 新增 CVV 欄位
    subpwd: "",
    agreerule: false,
    event: true,
  });
  // 驗證碼（6位英數字）
  const [captchaValue, setCaptchaValue] = useState("");
  // 註冊成功
  const [isSuccess, setIsSuccess] = useState(false);
  // 轉跳頁面倒數計時
  const [countdown, setCountdown] = useState(3);
  // 導向網站
  const navigate = useNavigate();
  // 驗證碼初始化
  useEffect(() => {
    refreshCaptcha();
  }, []);
  // 產生新驗證碼
  const refreshCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(code);
  };
  // 表單變更處理
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    // 數字欄位簡單過濾
    if (name === "telephone") v = v.replace(/\D/g, "").slice(0, 15);
    if (name === "credit_card_number") {
      let digits = value.replace(/\D/g, "").slice(0, 16);
      v = digits.replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "credit_card_month") v = v.replace(/\D/g, "").slice(0, 2);
    if (name === "credit_card_year") v = v.replace(/\D/g, "").slice(0, 2);
    if (name === "cvv") v = v.replace(/\D/g, "").slice(0, 4); // CVV 最多 4 碼
    setForm((prev) => ({ ...prev, [name]: v }));
  };
  // 驗證表單有無錯誤
  const validate = () => {
    // 必填欄位檢查
    if (!form.login_id.trim()) return "帳號必填";
    if (!form.user_name.trim()) return "姓名必填";
    if (!form.password) return "密碼必填";
    if (!form.confirmPassword) return "確認密碼必填";
    if (!form.email.trim()) return "Email 必填";
    if (!form.telephone.trim()) return "電話必填";
    if (!form.county.trim()) return "縣市必填";
    if (!form.address.trim()) return "地址必填";
    if (!form.credit_card_number.trim()) return "信用卡號必填";
    if (!form.credit_card_month.trim()) return "信用卡到期月必填";
    if (!form.credit_card_year.trim()) return "信用卡到期年必填";
    if (!form.cvv.trim()) return "安全碼(CVV)必填"; // 新增 CVV 必填
    if (!form.subpwd.trim()) return "驗證碼必填";
    // 其他驗證
    if (form.subpwd !== captchaValue) return "驗證碼錯誤";
    if (form.password !== form.confirmPassword) return "密碼與確認密碼不一致";
    if (!form.agreerule) return "請勾選同意使用者規範";
    if (form.login_id == form.password) return "帳號密碼不可相同";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Email 格式錯誤";
    if (form.telephone && form.telephone.length < 8) return "電話格式不正確";
    if (form.credit_card_number && form.credit_card_number.length !== 19)
      return "信用卡號需 16 碼數字";
    if (form.credit_card_month && (parseInt(form.credit_card_month) < 1 || parseInt(form.credit_card_month) > 12))
      return "到期月需為 01~12";
    if (form.credit_card_year && !/^\d{2}$/.test(form.credit_card_year))
      return "到期年需為 2 碼數字";
    if (form.cvv && (form.cvv.length < 3 || form.cvv.length > 4))
      return "安全碼(CVV)需 3~4 碼數字"; // 新增 CVV 格式驗證
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
      // 前端雜湊密碼（SHA256取前10碼）
      const hashedPwd = crypto.SHA256(form.password).toString(crypto.enc.Hex).slice(0, 10);
      // 將信用卡號中間8碼遮蔽
      const maskedCardNumber = form.credit_card_number.replace(/(\d{4}) (\d{4}) (\d{4}) (\d{4})/, (m, p1, p2, p3, p4) => `${p1} **** **** ${p4}`);
      const payload = {
        login_id: form.login_id,
        user_name: form.user_name,
        password: hashedPwd, // 送出雜湊後的密碼
        email: form.email,
        telephone: form.telephone,
        country: form.county,
        address: form.address,
        credit_card_number: maskedCardNumber,
        credit_card_month: form.credit_card_month,
        credit_card_year: form.credit_card_year,
        cvv: form.cvv, // 新增 CVV 欄位
        status: "0",
      };
      const res = await axios.post(
        "${API_BASE}${memberBasePath}/mber_register",
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
      login_id: "",
      user_name: "",
      password: "",
      confirmPassword: "",
      email: "",
      telephone: "",
      county: "",
      address: "",
      credit_card_number: "",
      credit_card_month: "", // 月份
      credit_card_year: "", // 年份
      cvv: "", // 新增 CVV 欄位
      subpwd: "",
      agreerule: false,
      event: true,
    });
    refreshCaptcha();
  };

  // 如果註冊成功，顯示成功訊息和倒數計時
  if (isSuccess) {
    return (
      <div className={styles["container"]}>
        <div className={styles["alert_success"]} role="alert">
          <h4 className={styles["alert_heading"]}>註冊成功!</h4>
          <p>您的帳戶已成功創建，{countdown} 秒後將自動前往登入頁面。</p>
          <hr />
          <button
            className={styles["btn_primary"]}
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
    <div className={styles["register-bg"]}>
      {/* 手機版專用區塊 */}
      <><NavBarApp /></>
      <div className={styles["register-container"]}>
        <div className={styles["register-form-section"]}>
          {/* 返回上頁按鈕 */}
          <BackIcon className={'d-sm-none'} />
          <div className={styles["mobile-arc-bg"]}>
            <div className={styles["mobile-arc-content"]}>
              <h2 className={styles["register-title"]}>會員註冊</h2>
            </div>
          </div>
          <form className={styles["register-form"]} onSubmit={handleSubmit}>
            <div className={styles["register-form-row"]}>
              {/* 帳號 */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="login_id" className={styles["register-label"]}>
                  帳號：
                </label>
                <input
                  className={styles["register-input"]}
                  id="login_id"
                  name="login_id"
                  value={form.login_id}
                  onChange={handleChange}
                  required
                  type="text"
                />
              </div>
              {/* 姓名 */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="user_name" className={styles["register-label"]}>
                  姓名：
                </label>
                <input
                  className={styles["register-input"]}
                  id="user_name"
                  name="user_name"
                  value={form.user_name}
                  onChange={handleChange}
                  required
                  type="text"
                />
              </div>
              {/* 密碼 */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="password" className={styles["register-label"]}>
                  密碼：
                </label>
                <input
                  className={styles["register-input"]}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  type="password"
                />
              </div>
              {/* 確認密碼 */}
              <div className={styles["register-input-group"]}>
                <label
                  htmlFor="confirmPassword"
                  className={styles["register-label"]}
                >
                  確認密碼：
                </label>
                <input
                  className={styles["register-input"]}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  type="password"
                />
              </div>
              {/* Email */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="email" className={styles["register-label"]}>
                  電子郵件：
                </label>
                <input
                  className={styles["register-input"]}
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* 電話 */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="telephone" className={styles["register-label"]}>
                  電話：
                </label>
                <input
                  className={styles["register-input"]}
                  id="telephone"
                  name="telephone"
                  type="text"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="僅數字"
                />
              </div>
              {/* 地址 */}
              <div className={styles["register-input-group"]}>
                <label htmlFor="county" className={styles["register-label"]}>
                  縣市：
                </label>
                <select
                  className={styles["register-input"]}
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
              <div className={styles["register-input-group"]}>
                <input
                  className={styles["register-input"]}
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="請填完後續地址"
                />
              </div>
              {/* 信用卡號 */}
              <div className={styles["register-input-group"]}>
                <label
                  htmlFor="credit_card_number"
                  className={styles["register-label"]}
                >
                  信用卡號：
                </label>
                <input
                  className={styles["register-input"]}
                  id="credit_card_number"
                  name="credit_card_number"
                  type="text"
                  value={form.credit_card_number}
                  onChange={handleChange}
                  maxLength={19}
                  placeholder="16 碼"
                />
              </div>
              {/* 信用卡到期月 */}
              <div className={styles["register-input-group"]}>
                <label
                  htmlFor="credit_card_month"
                  className={styles["register-label"]}
                >
                  信用卡到期月：
                </label>
                <input
                  className={styles["register-input"]}
                  id="credit_card_month"
                  name="credit_card_month"
                  type="text"
                  value={form.credit_card_month}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="MM"
                  required
                />
              </div>
              {/* 信用卡到期年 */}
              <div className={styles["register-input-group"]}>
                <label
                  htmlFor="credit_card_year"
                  className={styles["register-label"]}
                >
                  信用卡到期年：
                </label>
                <input
                  className={styles["register-input"]}
                  id="credit_card_year"
                  name="credit_card_year"
                  type="text"
                  value={form.credit_card_year}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="YY"
                  required
                />
              </div>
              {/* 安全碼(CVV) */}
              <div className={styles["register-input-group"]}>
                <label
                  htmlFor="cvv"
                  className={styles["register-label"]}
                >
                  安全碼(CVV)：
                </label>
                <input
                  className={styles["register-input"]}
                  id="cvv"
                  name="cvv"
                  type="text"
                  value={form.cvv}
                  onChange={handleChange}
                  maxLength={4}
                  placeholder="3~4 碼"
                  required
                />
              </div>
              {/* 驗證碼 */}
              <div className={styles["register-input-group"]} id="capbox">
                <label className={styles["register-label"]}>驗證碼：</label>
                <span
                  className={styles["captcha-value"]}
                  style={{ fontWeight: "bold" }}
                >
                  {captchaValue}
                </span>
                <button
                  type="button"
                  className={styles["captcha-refresh"]}
                  onClick={refreshCaptcha}
                >
                  重新產生
                </button>
              </div>
              <div className={styles["register-input-group"]}>
                <label htmlFor="subpwd" className={styles["register-label"]}>
                  請輸入驗證碼：
                </label>
                <input
                  className={styles["register-input"]}
                  id="subpwd"
                  name="subpwd"
                  type="text"
                  value={form.subpwd}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* 條款 & 活動 */}
              <div className={styles["register-input-group"]}>
                <div className={styles["register-checkbox-group"]}>
                  <input
                    className={styles["form-check-input"]}
                    type="checkbox"
                    id="agreerule"
                    name="agreerule"
                    checked={form.agreerule}
                    onChange={handleChange}
                  />
                  <label
                    className={styles["form-check-label"]}
                    htmlFor="agreerule"
                  >
                    同意使用者規範
                  </label>
                </div>
              </div>
              <div className={styles["register-input-group"]}>
                <div className={styles["register-checkbox-group"]}>
                  <input
                    className={styles["form-check-input"]}
                    type="checkbox"
                    id="event"
                    name="event"
                    checked={form.event}
                    onChange={handleChange}
                  />
                  <label className={styles["form-check-label"]} htmlFor="event">
                    訂閱活動資訊
                  </label>
                </div>
              </div>
            </div>
            {/* 按鈕 */}
            <div >
              <button
                className={styles["correct-btn"]}
                id="mber_register"
                type="submit"
              >
                註冊
              </button>
              <button
                className={styles["correct-btn"]}
                id="clear"
                type="button"
                onClick={handleClear}
              >
                清除
              </button>
              <button
                className={styles.loginLink}
                type="button"
                onClick={() => navigate("/mber_login")}
              >
                已有帳號？登入
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default mber_Register;


