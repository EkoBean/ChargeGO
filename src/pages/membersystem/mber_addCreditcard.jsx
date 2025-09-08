import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_addCreditcard.module.scss"; // 改用 module

const mber_AddCreditcard = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const API_BASE = "http://localhost:3000";
  const navigate = useNavigate();
  const formRef = useRef(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // 這裡可以加入表單驗證邏輯
    alert("信用卡已新增");
    // navigate("/mber_addCreditcard");
  };

  const cleanup = () => {
    if (formRef.current) formRef.current.reset();
  };

  return (
    <div className={styles.mber_addCreditcard}>
      <NavBarAPP />
      
      <div className={styles.paymentCircle}>
        <div className={styles.paymentText}>付款方式</div>
      </div>
      <div className={styles.cardIconCircle}>
        <div className={styles.cardIcon}>
          <span role="img" aria-label="card" style={{fontSize: '2.2rem'}}>💳</span>
          <div className={styles.cardIconText}>CARD</div>
        </div>
      </div>
      <div className={styles.creditcardContainer}>
        <form
          className={styles.creditcardForm}
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <div className={styles.formRow}>
            <label className={styles.formLabel}>信用卡卡號</label>
            <input className={styles.formInput} type="text" placeholder="1395 **** **** 3955" maxLength={19} />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>三碼檢查碼</label>
            <input className={styles.formInputCvv} type="text" placeholder="CVV" maxLength={3} />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>信用卡到期（月／年）</label>
            <input className={styles.formInputSmall} type="text" placeholder="MM" maxLength={2} />
            <span>/</span>
            <input className={styles.formInputSmall} type="text" placeholder="YY" maxLength={2} />
          </div>
          <div className={styles.formButtons}>
            <button className={styles.submitBtn} type="submit">新增信用卡</button>
            <button className={styles.cancelBtn} type="button" onClick={cleanup}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default mber_AddCreditcard;
