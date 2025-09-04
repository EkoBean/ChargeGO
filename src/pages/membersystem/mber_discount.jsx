import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAPP from "../../components/NavBarAPP";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";
import "../../styles/scss/mber_discount.scss"; // 新增引入 SCSS

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
    axios
      .get(`${API_BASE}/user/${uid}/coupons`)
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]));
    // 取得點數
    axios
      .get(`${API_BASE}/user/${uid}/points`)
      .then((res) => setPoints(res.data.points || 0))
      .catch(() => setPoints(0));
  }, [uid]);

  return (
    <div className="mber_discount">
      {/* 上方區塊 */}
      <NavBarAPP />
      <div className="discount-header">
        {/* LOGO 置頂 */}
        <div className="chargego-logo-top">
          <ChargegoLogo />
        </div>
        <span
          className="back-icon"
          onClick={() => window.history.back()}
          title="回到上頁"
        >
          ◀︎
        </span>
        <div className="header-flex">
          <span className="point-circle">P</span>
          <span className="point-title">點數</span>
          <span className="bell-icon">
            <img src="/gift.png" alt="bell" />
          </span>
        </div>
        <div className="point-value">{points}</div>
        <div className="coupon-title">目前持有優惠券</div>
      </div>
      {/* 優惠券列表 */}
      <div className="coupon-list">
        {coupons.length === 0 ? (
          <div className="no-coupon">尚未持有優惠券</div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.coupon_id} className="coupon-card">
              <div className="coupon-code">
                {coupon.code || coupon.coupon_id}
              </div>
              <div className="coupon-desc">
                {coupon.description || "前1小時租借免費"}
              </div>
              <div className="coupon-usage">
                使用次數 {coupon.usage_count || 1}
              </div>
              <div className="coupon-expire">
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
