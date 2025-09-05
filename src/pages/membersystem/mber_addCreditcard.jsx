import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_addCreditcard.module.scss"; // 改用 module

const mber_addCreditcard = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const API_BASE = "http://localhost:3000";
  // 取得 user 資料（登入狀態由 session 驗證）
  useEffect(() => {
    fetch(`${API_BASE}/check-auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
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
  }, [navigate]);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 這裡可以加入表單驗證邏輯
    navigate("/mber_addCreditcard");
  };

  const cleanup = () => {
    form.reset();
  };

  return (
    <div className={styles.mber_addCreditcard}>
      <NavBarAPP />
      <h2>新增信用卡</h2>
      <form className={styles.addCreditcardForm}>
        <div>
          <label>卡號</label>
          <input type="text" placeholder="請輸入卡號" />
        </div>
        <div>
          <label>到期日</label>
          <input type="text" placeholder="MM" />
          <span>/</span>
          <input type="text" placeholder="YY" />
        </div>
        <div>
          <label>CVV</label>
          <input type="text" placeholder="請輸入 CVV" />
        </div>
        <div className={styles.formButtons}>
          <button type="submit" onClick={handleSubmit}>
            新增信用卡
          </button>
          <button type="button" onClick={() => cleanup()}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default mber_addCreditcard;
