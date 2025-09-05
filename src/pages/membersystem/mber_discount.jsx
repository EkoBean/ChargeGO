import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import styles from "../../styles/scss/mber_discount.module.scss"; // 改用 module

const Mber_discount = () => {
  const [coupons, setCoupons] = useState([]);
  const [uid, setUid] = useState(null);
  const [points, setPoints] = useState(0); // 新增點數
  const API_BASE = "http://localhost:3000";
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post(`${API_BASE}/check-auth`, {}, { withCredentials: true })
      .then((res) => {
        if (res.data?.authenticated && res.data.user?.uid) {
          setUid(res.data.user.uid);
        } else {
          setUid(null);
          setCoupons([]);
        }
      })
      .catch(() => {
        setUid(null);
        setCoupons([]);
      });
  }, []);

  useEffect(() => {
    if (!uid) return;
    // 取得優惠券（改用 session API，不需傳 uid）
    axios
      .get(`${API_BASE}/user/session/coupons`, { withCredentials: true })
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]));
    // 取得點數
    axios
      .get(`${API_BASE}/user/${uid}/points`)
      .then((res) => setPoints(res.data.points || 0))
      .catch(() => setPoints(0));
  }, [uid]);

  return (
    <div className={styles.mber_discount}>
      {/* 上方區塊 */}
      <NavBarAPP />
      <div className={styles.discountHeader}>
        {/* LOGO 置頂 */}
        <span
          className={styles["back-icon"] + " " + styles["mobile-only-back"]}
          onClick={() => window.history.back()}
          title="回到上頁"
        >
          ◀︎
        </span>
        <div className={styles.headerFlex}>
          <span className={styles.pointCircle}>P</span>
          <span className={styles.pointTitle}>點數</span>
          <span className={styles.bellIcon}>
            <img src="/gift.png" alt="bell" />
          </span>
        </div>
        <div className={styles.pointValue}>{points}</div>
        <div className={styles.couponTitle}>目前持有優惠券</div>
      </div>
      {/* 優惠券列表 */}
      <div className={styles.couponList}>
        {coupons.length === 0 ? (
          <div className={styles.noCoupon}>尚未持有優惠券</div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.coupon_id} className={styles.couponCard}>
              <div className={styles.couponCode}>
                {coupon.code || coupon.coupon_id}
              </div>
              <div className={styles.couponDesc}>
                {coupon.description || "前1小時租借免費"}
              </div>
              <div className={styles.couponUsage}>
                使用次數 {coupon.usage_count || 1}
              </div>
              <div className={styles.couponExpire}>
                {coupon.expires_at ? `到期日：${coupon.expires_at}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mber_discount;
