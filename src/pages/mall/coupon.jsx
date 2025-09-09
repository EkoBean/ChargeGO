import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styles from "../../styles/scss/mall_index.module.scss"; // 新增匯入

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
    <div className={styles.couponBody}>
      <div className={styles.couponNavbar}>
        {/* 返回首頁 */}

        <button className={styles.navbarLeftSection}>
          <img src="/Iconimg/backBtn.svg" alt="backBtn" />
        </button>
        {/* 裝點數與任務連結的容器 */}
        <div className={styles.navbarCenterSection}>
          {/* 點數顯示 */}
          <div className={styles.couponPoint}>
            <div className={styles.couponText}>
              <img src="/Iconimg/greenpoint.svg" alt="point" />
              點數
            </div>
            <div className={styles.couponNumber}>2</div>
            <div className={styles.couponText}>目前持有優惠劵</div>
          </div>
        </div>

        {/* 右上角通知鈴鐺*/}
        <button className={styles.navbarRightSection}>
          {/* 右上角通知鈴鐺 */}
          <img src="/Iconimg/notify.svg" alt="notify" />
        </button>
      </div>
      <div className={styles.couponMain}>
        {/* 🔹 Tabs 導覽 (用 React 控制 activeTab) */}
        <ul className={`nav nav-tabs ${styles.customTabs}`}>
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
        <div className={styles.couponList + " mt-3"}>
          {/* 商家優惠券 */}
          {activeTab === "store" && (
            <>
              {
                //沒有商家優惠券
                storeCoupons.length === 0 ? (
                  <p className="text-muted">目前沒有商家優惠券</p>
                ) : (
                  //有商家優惠券
                  storeCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={
                        styles.missionCard + " rounded-3 shadow-sm p-3 mb-3"
                      }
                    >
                      <div className={styles.taskLeft}>
                        <h5 className="fw-bold mb-0">{coupon.title}</h5>
                        <small className="text-muted">
                          有效期至：
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className={styles.taskRight}>
                        <button
                          className={`btn ${
                            coupon.isUsed ? "disabled" : styles.claimBtn
                          } rounded-pill fw-bold`}
                          disabled={coupon.isUsed}
                          onClick={() => handleCouponClick(coupon)}
                        >
                          {coupon.isUsed ? "已使用" : "領取"}
                        </button>
                      </div>
                    </div>
                  ))
                )
              }
            </>
          )}

          {/* 租借優惠券 */}
          {activeTab === "rental" && (
            <>
              {
                //沒有租借優惠券
                rentalCoupons.length === 0 ? (
                  <p className="text-muted">目前沒有租借優惠券</p>
                ) : (
                  //有租借優惠券
                  rentalCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`${styles.rentalCouponCard} ${
                        coupon.isUsed ? styles.used : ""
                      }`}
                    >
                      <div className={styles.couponInfo}>
                        <h5 className={styles.couponName}>{coupon.title}</h5>
                        <small className={styles.couponDetails}>
                          有效期至：
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))
                )
              }
            </>
          )}
        </div>

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
    </div>
  );
};

export default Coupon;
