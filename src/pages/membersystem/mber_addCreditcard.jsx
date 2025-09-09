import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_addCreditcard.module.scss"; // 改用 module

const mber_AddCreditcard = () => {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await axios.post(
        `${API_BASE}/user/add-creditcard`,
        {
          userId: user.id,
          cardNumber,
          cvv,
          expMonth,
          expYear,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert("信用卡已新增");
        cleanup();
        // navigate("/mber_addCreditcard");
      } else {
        alert("新增失敗，請重試");
      }
    } catch (err) {
      alert("新增失敗，請重試");
    }
  };

  const cleanup = () => {
    if (formRef.current) formRef.current.reset();
    setCardNumber("");
    setCvv("");
    setExpMonth("");
    setExpYear("");
  };

  return (
    <div className={styles.mber_addCreditcard}>
      <NavBarAPP />

      <div className={styles.creditcardContainer}>
        <span
          className={styles["back-icon"] + " " + styles["mobile-only-back"]}
          onClick={() => window.history.back()}
          title="回到上頁"
        >
          ◀︎
        </span>
        <div className={styles.titleSection}>
          <div className={styles.paymentText}>付款方式</div>
          <div className={styles.cardIcon}>
            <img src="../../../public/creditcard.svg" alt="" />
          </div>
          <div className={styles.cardIconText}>信用卡</div>
        </div>
        <form
          className={styles.creditcardForm}
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <div className={styles.formRow}>
            <label className={styles.formLabel}>信用卡卡號</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="1395 **** **** 3955"
              maxLength={19}
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>三碼檢查碼</label>
            <input
              className={styles.formInputCvv}
              type="text"
              placeholder="CVV"
              maxLength={3}
              required
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>信用卡到期（月／年）</label>
            <input
              className={styles.formInputSmall}
              type="text"
              placeholder="MM"
              maxLength={2}
              required
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
            />
            <span>／</span>
            <input
              className={styles.formInputSmall}
              type="text"
              placeholder="YY"
              maxLength={2}
              required
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
            />
          </div>
          <div className={styles.formButtons}>
            <button className={styles.submitBtn} type="submit">
              新增信用卡
            </button>
            <button
              className={styles.cancelBtn}
              type="button"
              onClick={cleanup}
            >
              清除
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default mber_AddCreditcard;
