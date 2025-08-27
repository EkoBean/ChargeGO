import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

    // 驗證
    if (!form.username || !form.password) {
      setError("請輸入帳號和密碼");
      return;
    }

    if (form.captcha !== String(captchaValue)) {
      setError("驗證碼錯誤");
      return;
    }

    try {
      // 登入 API 呼叫
      const res = await axios.post("http://localhost:3000/mber_login", {
        user_name: form.username,
        password: form.password,
      });

      if (res.data?.success) {
        // 儲存用戶資訊到 localStorage
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("登入成功！");
        navigate("/mber_profile"); // 導向會員中心
      } else {
        setError(res.data?.message || "登入失敗，請檢查帳號密碼");
      }
    } catch (err) {
      console.error("登入錯誤:", err);
      setError("系統錯誤，請稍後再試");
    }
  };
  // 重新產生驗證碼
  const refreshCaptcha = () => {
    setCaptchaValue(Math.floor(Math.random() * (999999 - 100000 + 1) + 100000));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        
        <div className="col-md-6">
          {/* 登入表單 */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">會員登入</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="username" className="form-label">
                    帳號:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password" className="form-label">
                    密碼:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">驗證碼:</label>
                  <div className="d-flex align-items-center">
                    <span
                      className="me-2 p-2 bg-light border rounded"
                      style={{ fontWeight: "bold" }}
                    >
                      {captchaValue}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={refreshCaptcha}
                    >
                      重新產生
                    </button>
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="captcha" className="form-label">
                    請輸入驗證碼:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="captcha"
                    name="captcha"
                    value={form.captcha}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    登入
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => navigate("/mber_register")}
                  >
                    註冊新帳號
                  </button>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => alert("請聯繫客服重設密碼")}
                  >
                    忘記密碼?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default mber_Login;
