import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Coupon = () => {
  const userId = 2;
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("store"); // 🔹 React 控制 tab

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(
          `http://localhost:4002/mycouponsparam/${userId}`
        );
        const data = await response.json();

        const formatted = data.map((c) => ({
          id: c.coupon_id,
          title: c.name,
          type: c.type,
          isUsed: c.status !== "active",
          expiresAt: c.expires_at,
        }));

        setCoupons(formatted);
      } catch (err) {
        console.error("抓取優惠券失敗:", err);
      }
    };
    fetchCoupons();
  }, []);

  const handleCouponClick = (coupon) => {
    if (!coupon.isUsed) {
      setSelectedCoupon(coupon);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCoupon(null);
  };

  const storeCoupons = coupons.filter(
    (c) => c.type === "store_gift" || c.type === "store_discount"
  );
  const rentalCoupons = coupons.filter(
    (c) =>
      c.type === "rental_discount" ||
      c.type === "free_minutes" ||
      c.type === "percent_off"
  );

  return (
    <div className="d-flex">
      <main className="container flex-grow-1 py-4">
        <h2 className="mb-4">兌換券</h2>

        {/* 🔹 Tabs 導覽 (用 React 控制 activeTab) */}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "store" ? "active" : ""}`}
              onClick={() => setActiveTab("store")}
            >
              商家優惠券
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "rental" ? "active" : ""}`}
              onClick={() => setActiveTab("rental")}
            >
              租借優惠
            </button>
          </li>
        </ul>

        {/* 🔹 Tabs 內容 */}
        <div className="mt-3">
          {/* 商家優惠券 */}
          {activeTab === "store" && (
            <>
              {storeCoupons.length === 0 ? (
                <p className="text-muted">目前沒有商家優惠券</p>
              ) : (
                storeCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="card rounded-3 shadow-sm p-3 mb-3"
                  >
                    <div className="card-body p-0 d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-0">{coupon.title}</h5>
                        <small className="text-muted">
                          有效期至：
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        className={`btn ${
                          coupon.isUsed ? "btn-secondary" : "btn-primary"
                        } rounded-pill fw-bold`}
                        disabled={coupon.isUsed}
                        onClick={() => handleCouponClick(coupon)}
                      >
                        {coupon.isUsed ? "已使用" : "領取"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* 租借優惠券 */}
          {activeTab === "rental" && (
            <>
              {rentalCoupons.length === 0 ? (
                <p className="text-muted">目前沒有租借優惠券</p>
              ) : (
                rentalCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="card rounded-3 shadow-sm p-3 mb-3"
                  >
                    <div className="card-body p-0 d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-0">{coupon.title}</h5>
                        <small className="text-muted">
                          有效期至：
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </small>
                      </div>
                      {/* 租借優惠券只顯示使用狀態 */}
                      <span
                        className={`fw-bold ${
                          coupon.isUsed ? "text-secondary" : "text-success"
                        }`}
                      >
                        {coupon.isUsed ? "已使用" : "未使用"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal 保持商家優惠券功能 */}
      {showModal && selectedCoupon && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">優惠券兌換</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body text-center">
                <p>{selectedCoupon.title}</p>
                <div className="my-3">
                  <QRCodeCanvas
                    value={`coupon-${selectedCoupon.id}-user-${userId}`}
                    size={150}
                    level="H"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <p className="text-muted mt-2">點擊 QR Code 模擬掃描</p>
                <p className="text-muted mt-2">
                  請在櫃台出示此 QR Code 進行兌換
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={closeModal}>
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
