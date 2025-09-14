import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styles from "../../styles/scss/mall_index.module.scss";
import NavBarApp from "../../components/NavBarApp";
import { apiRoutes } from "../../components/apiRoutes";
import Notify from "../../components/notify";
import BackIcon from "../../components/backIcon";

const API_URL = import.meta.env.VITE_API_URL;
const pointBasePath = apiRoutes.point;
const couponBasePath = apiRoutes.coupon;
const Coupon = () => {
  // 先從 sessionStorage 拿 uid，沒有就 fallback 為 "2"
  const initialUid = sessionStorage.getItem("user") || "3";
  // Session不是這樣拿的，你要去呼叫API跟後端拿，前端沒辦法直接用一個function就拿到session
  // 下面這個你參考一下
  //  這是從价堂那邊的code抓過來改的，還有一些宣告跟函數引入你自己去他那邊找，也可以到我的mapindex裡面找
  // const [user, setUser] = React.useState(null);
  // // 取得 user 資料
  // fetch(`${API_URL}${memberBasePath}/check-auth`, {
  //   method: "POST",
  //   credentials: "include",
  //   headers: { "Content-Type": "application/json" },
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     if (data.authenticated && data.user) {
  //       setUser(data.user);
  //       // 取得通知資料
  //       fetch(`${API_URL}${memberBasePath}/user/${data.user.uid}/notices`, {
  //         credentials: "include",
  //       })
  //         .then((res) => res.json())
  //         .then((data) => setNotices(data))
  //         .catch(() => setNotices([]));
  //     } else {
  //       alert("請先登入");
  //       navigate("/mber_login");
  //     }
  //   })
  //   .catch(() => {
  //     alert("請先登入");
  //     navigate("/mber_login");
  //   });
  // }, [navigate]);
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
    <>
      <BackIcon />
      <Notify />
      <div className={styles.couponBody}>
        <NavBarApp />

        <div className={styles.couponNavbar}>


          <div className={styles.navbarCenterSectionForCouponBox}>
            <div className={styles.couponPoint}>
              <div className={styles.couponText}>
                {/* <img src="/Iconimg/greenpoint.svg" alt="point" /> */}
                目前持有點數
              </div>
              <div style={{ transform: 'translateY(-0.5rem)' }} className={styles.couponNumber}>
                {userPoint !== null ? userPoint : "載入中"}
              </div>
              <div style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>目前持有的優惠券</div>
            </div>
          </div>

        </div>

        <div className={styles.couponMain}>
          <ul className={`${styles.customTabs}`}>
            <li className="">
              <button
                className={` ${activeTab === "store" ? styles.active : ""}`}
                onClick={() => setActiveTab("store")}
              >
                商家優惠
              </button>
            </li>
            <li className="">
              <button
                className={` ${activeTab === "rental" ? styles.active : ""}`}
                onClick={() => setActiveTab("rental")}
              >
                租借優惠
              </button>
            </li>
          </ul>
          <div className={styles.couponBoxList}>
            <div className={styles.couponBoxListInner}>
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
                            className={`btn  ${coupon.isUsed ? "disabled" : styles.claimBtn
                              } rounded-pill fw-bold`}
                            disabled={coupon.isUsed}
                            onClick={() => handleCouponClick(coupon)}
                          >
                            {coupon.isUsed ? "已使用" : "使用"}
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
                        className={`${styles.rentalCouponCard} ${coupon.isUsed ? styles.used : ""
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
    </>
  );
};

export default Coupon;
