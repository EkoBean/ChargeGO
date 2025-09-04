import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

const Coupon = () => {
  const userId = 2; // 你可以改成從登入狀態或 Context 拿
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 抓取優惠券
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(
          `http://localhost:4002/mycouponsparam/${userId}`
        );
        const data = await response.json();
        console.log(data);
        // 格式化資料
        const formatted = data.map((c) => ({
          id: c.coupon_id,
          title: ` ${c.name} `, // 可替換成真實名稱
          isUsed: c.status !== "active",
          expiresAt: c.expires_at,
        }));
        console.log(formatted);
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

  return (
    <div className=" d-flex">
      {/* Main */}
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>兌換券</h2>
        </div>

        <div id="list-container" className="list-group">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="card rounded-3 shadow-sm p-3 mb-3">
              <div className="card-body p-0 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-0">{coupon.title}</h5>
                  <small className="text-muted">
                    有效期至：{new Date(coupon.expiresAt).toLocaleDateString()}
                  </small>
                </div>
                {/* 領取按鈕 */}
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
          ))}
        </div>
      </main>

      {/* QR Code Modal */}
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
                    onClick={async () => {
                      try {
                        // 呼叫後端兌換 API
                        const res = await fetch(
                          `http://localhost:4002/redeem/${selectedCoupon.id}`,
                          { method: "POST" }
                        );
                        const data = await res.json();

                        alert(data.message); // 顯示兌換結果訊息

                        // 更新前端狀態
                        setCoupons((prev) =>
                          prev.map((c) =>
                            c.id === selectedCoupon.id
                              ? { ...c, isUsed: true }
                              : c
                          )
                        );

                        closeModal();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
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
