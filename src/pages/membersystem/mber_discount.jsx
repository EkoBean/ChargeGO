import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import crypto from "crypto-js";
import NavBarPhone from "../../components/NavBarPhone";
import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo";

const Mber_discount = () => {
  const [coupons, setCoupons] = useState([]);
  const API_BASE = "http://localhost:3000";
  const navigate = useNavigate();
  useEffect(() => {
    // 請將 '/api/coupons' 換成你的後端 API 路徑
    axios
      .get(`${API_BASE}/api/coupons`)
      .then((res) => setCoupons(res.data))
      .catch((err) => setCoupons([]));
  }, []);

  return (
    <div className="mber_discount">
      <NavBarPhone />
      <ChargegoLogo />
      <h2>目前持有優惠券</h2>
      <div className="coupon_container">
        <span
          className="back-icon mobile-only-back"
          onClick={() => window.history.back()}
          title="回到上頁"
        >
          ◀︎
        </span>
        {/* 直立式排列顯示優惠券 */}
        {coupons.length === 0 ? (
          <div>尚未持有優惠券</div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.coupon_id}
              className="coupon_card"
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                background: "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div>
                <b>優惠券ID：</b>
                {coupon.coupon_id}
              </div>
              <div>
                <b>範本ID：</b>
                {coupon.template_id}
              </div>
              <div>
                <b>使用者ID：</b>
                {coupon.user_id}
              </div>
              <div>
                <b>優惠券代碼：</b>
                {coupon.code || "無"}
              </div>
              <div>
                <b>來源類型：</b>
                {coupon.source_type}
              </div>
              <div>
                <b>狀態：</b>
                {coupon.status}
              </div>
              <div>
                <b>發放時間：</b>
                {coupon.issued_at}
              </div>
              <div>
                <b>到期時間：</b>
                {coupon.expires_at}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mber_discount;
