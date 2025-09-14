import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styles from "../../styles/scss/mall_index.module.scss";
import NavBarApp from "../../components/NavBarApp";
import { apiRoutes } from "../../components/apiRoutes";

const API_URL = import.meta.env.VITE_API_URL;
const pointBasePath = apiRoutes.point;
const couponBasePath = apiRoutes.coupon;
const Coupon = () => {
  // 先從 sessionStorage 拿 uid，沒有就 fallback 為 "2"
  const initialUid = sessionStorage.getItem("uid") || "3";
  const [userId, setUserId] = useState(initialUid);
  const [userPoint, setUserPoint] = useState(null);

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  // 取得使用者點數
  const getUserPoint = useCallback(async (uid) => {
    if (!uid) {
      setUserPoint(null);
      return null;
    }
    try {
      const res = await fetch(`${API_URL}${pointBasePath}/checkpoints/${uid}`);
      if (!res.ok) throw new Error("fetch point failed");
      const data = await res.json();
      const point = data?.point ?? null;
      setUserPoint(point);
      return point;
    } catch (err) {
      console.error("抓取點數失敗:", err);
      setUserPoint(null);
      return null;
    }
  }, []);

  // refresh 封裝（給外部呼叫）
  const refreshUserPoint = useCallback(() => {
    return getUserPoint(userId);
  }, [getUserPoint, userId]);

  // 抓優惠券（會在 userId 變動時重新抓）
  useEffect(() => {
    let mounted = true;
    const fetchCoupons = async () => {
      try {
        const response = await fetch(
          `${API_URL}${couponBasePath}/mycouponsparam/${userId}`
        );
        if (!response.ok) throw new Error("fetch coupons failed");
        const data = await response.json();

        const formatted = data.map((c) => ({
          id: c.coupon_id,
          title: c.name,
          type: c.type,
          isUsed: c.status !== "active",
          expiresAt: c.expires_at,
        }));

        if (mounted) setCoupons(formatted);
      } catch (err) {
        console.error("抓取優惠券失敗:", err);
        if (mounted) setCoupons([]);
      }
    };

    fetchCoupons();
    // 同步抓點數
    getUserPoint(userId);

    return () => {
      mounted = false;
    };
  }, [userId, getUserPoint]);

  // 監聽其他分頁對 sessionStorage uid 的變動
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "uid") {
        const newUid = e.newValue || "2";
        setUserId(newUid);
        // 把 UI 的 userId 與 session sync（雖然 session 已變）
        getUserPoint(newUid);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [getUserPoint]);

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

  // optional: 當在 modal 中模擬掃描完成並希望標示為已使用時，你可以呼叫一個 API 再 refreshUserPoint()
  // 例如：
  // const markUsedAndRefresh = async (couponId) => {
  //   await fetch(`http://localhost:4002/usecoupon/${couponId}`, { method: "POST", body: JSON.stringify({ userId }) });
  //   await refreshUserPoint();
  //   // 重新抓優惠券列表
  //   const res = await fetch(`http://localhost:4002/mycouponsparam/${userId}`);
  //   setCoupons(await res.json());
  // };

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
      <NavBarApp />

      <div className={styles.couponNavbar}>
        <button className={styles.navbarLeftSection}>
          <img src="/Iconimg/backBtn.svg" alt="backBtn" />
        </button>

        <div className={styles.navbarCenterSectionForCouponBox}>
          <div className={styles.couponPoint}>
            <div className={styles.couponText}>
              <img src="/Iconimg/greenpoint.svg" alt="point" />
              點數
            </div>
            <div className={styles.couponNumber}>
              {userPoint !== null ? userPoint : "載入中"}
            </div>
            <div className={styles.couponText}>目前持有優惠劵</div>
          </div>
        </div>

        <button className={styles.navbarRightSection}>
          <img src="/Iconimg/notify.svg" alt="notify" />
        </button>
      </div>

      <div className={styles.couponMain}>
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
        <div className={styles.couponBoxList + " mt-3"}>
          {activeTab === "store" && (
            <>
              {storeCoupons.length === 0 ? (
                <p className="text-muted">目前沒有商家優惠券</p>
              ) : (
                storeCoupons.map((coupon) => (
                  <div key={coupon.id} className={styles.storeCouponCardInBox}>
                    <div className={styles.cardLeft}>
                      <h5 className="fw-bold mb-0">{coupon.title}</h5>
                      <small className="text-muted">
                        有效期至：
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className={styles.cardRight}>
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
              )}
            </>
          )}

          {activeTab === "rental" && (
            <>
              {rentalCoupons.length === 0 ? (
                <p className="text-muted">目前沒有租借優惠券</p>
              ) : (
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
              )}
            </>
          )}
        </div>

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
