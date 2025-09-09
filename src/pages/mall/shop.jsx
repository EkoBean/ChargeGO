import React, { Component } from "react";
import axios from "axios";
import styles from "../../styles/scss/mall_index.module.scss";

class Shop extends Component {
  state = {
    products: [],
    selectedProduct: null,
    showDetailModal: false,
    showModal: false,
    modalType: "",
    userId: sessionStorage.getItem("uid") || "", // 直接從 session 讀 uid
  };

  // 每秒檢查 session uid 是否更新
  checkSessionUid = () => {
    const uid = sessionStorage.getItem("uid") || "";
    if (uid !== this.state.userId) {
      this.setState({ userId: uid });
    }
  };

  componentDidMount() {
    // 啟動 interval 每秒檢查 uid
    this.uidInterval = setInterval(this.checkSessionUid, 1000);

    // 抓產品資料
    axios
      .get("http://localhost:4001/products")
      .then((res) => {
        const formattedData = res.data.map((item) => ({
          id: item.template_id,
          name: item.name,
          points: item.point,
          image:
            item.image ||
            "https://placehold.co/400x200/cccccc/000000?text=商品",
          redemptionMethod: item.description,
          expirationDate: `兌換後${item.validity_days}天內有效`,
          contractDetails: "此折扣券僅限於指定租借服務，詳情請參閱活動條款。",
          type: item.type,
          isCoupon: true,
        }));
        this.setState({ products: formattedData });
      })
      .catch((err) => console.error("抓取後端資料失敗:", err));
  }

  componentWillUnmount() {
    clearInterval(this.uidInterval);
  }

  handleShowDetail = (product) => {
    this.setState({ selectedProduct: product, showDetailModal: true });
  };

  handleCloseDetail = () => {
    this.setState({ showDetailModal: false });
  };

  handleRedeem = async (product) => {
    const { userId } = this.state;
    if (!userId) {
      alert("請先登入");
      return;
    }

    try {
      const balanceRes = await axios.get("http://localhost:4001/checkpoints", {
        params: {
          user_id: userId,
          template_id: product.id,
        },
      });

      if (!balanceRes.data.sufficient) {
        this.setState({
          selectedProduct: product,
          showModal: true,
          modalType: "insufficient",
        });
        return;
      }

      const redeemRes = await axios.post("http://localhost:4001/buycoupons", {
        template_id: product.id,
        user_id: userId,
      });

      if (redeemRes.data.success) {
        this.setState({
          selectedProduct: product,
          showModal: true,
          modalType: "success",
        });
      } else {
        this.setState({
          selectedProduct: product,
          showModal: true,
          modalType: "error",
        });
      }
    } catch (err) {
      this.setState({
        selectedProduct: product,
        showModal: true,
        modalType: "error",
      });
    }
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const {
      userId,
      products,
      selectedProduct,
      showDetailModal,
      showModal,
      modalType,
    } = this.state;

    const storeCoupons = products.filter(
      (p) => p.type === "store_gift" || p.type === "store_discount"
    );
    const rentalCoupons = products.filter((p) =>
      ["rental_discount", "free_minutes", "percent_off"].includes(p.type)
    );

    return (
      // <div className={styles.container + " py-4"}>
      <div>
        <div className={styles.mallNavbar}>
          {/* 返回首頁 */}

          <button className={styles.navbarLeftSection}>
            {/* 使用你提供的 SVG 程式碼 */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                d="M20.9702 41.9663C32.5517 41.9663 41.9404 32.5718 41.9404 20.9831C41.9404 9.39446 32.5517 0 20.9702 0C9.38868 0 0 9.39446 0 20.9831C0 32.5718 9.38868 41.9663 20.9702 41.9663Z"
                fill="#00FF14"
              />
              <path
                d="M27.7558 11.2036L14.1855 20.9832"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.7558 30.7631L14.1855 20.9832"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 裝點數與任務連結的容器 */}
          <div className={styles.navbarCenterSection}>
            {/* 點數顯示 */}
            <div className={styles.point}></div>
            {/* 導向任務連結 */}
            <div className={styles.missionCircle}></div>
          </div>

          {/* 右上角通知鈴鐺*/}
          <button className={styles.navbarRightSection}>
            {/* 右上角通知鈴鐺 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 43"
              fill="none"
            >
              <path
                d="M38.6927 31.6157V33.3099C38.6927 34.0259 38.1125 34.6072 37.3979 34.6072H1.29483C0.580197 34.6072 0 34.0259 0 33.3099V31.6157C0 31.1443 0.258256 30.7084 0.672176 30.478C2.37385 29.5316 6.72532 26.2531 6.72532 17.4312V16.5274C6.72532 10.4878 10.953 5.43355 16.6063 4.17884V4.11859C16.6063 2.6016 17.8339 1.36816 19.3516 1.36816C20.1087 1.36816 20.7951 1.67652 21.2903 2.17274C21.7856 2.66895 22.0934 3.35655 22.0934 4.11504V4.1753C23.0769 4.39505 24.0144 4.72467 24.8953 5.16063C24.7397 5.78798 24.6583 6.44014 24.6583 7.11357C24.6583 11.3065 27.8317 14.7588 31.9037 15.1947C31.9497 15.6307 31.9744 16.0773 31.9744 16.5238V17.4277C31.9744 26.2496 36.3259 29.5281 38.0276 30.4744C38.4415 30.7048 38.6998 31.1372 38.6998 31.6122L38.6927 31.6157Z"
                fill="#6C4023"
              />
              <path
                d="M25.3871 36.0532C25.3871 39.3956 22.6807 42.107 19.3446 42.107C16.0085 42.107 13.3021 39.3956 13.3021 36.0532H25.3871Z"
                fill="#6C4023"
              />
              <path
                d="M32.7669 14.2412C36.6922 14.2412 39.8743 11.0532 39.8743 7.12062C39.8743 3.18801 36.6922 0 32.7669 0C28.8416 0 25.6595 3.18801 25.6595 7.12062C25.6595 11.0532 28.8416 14.2412 32.7669 14.2412Z"
                fill="#51FF3E"
              />
              <path
                d="M33.6195 4.43034V9.95245C33.6195 10.2785 33.3542 10.5444 33.0287 10.5444C32.7032 10.5444 32.4379 10.2785 32.4379 9.95245V5.62834C32.3318 5.73467 32.2186 5.83745 32.0983 5.94379C31.8329 6.17062 31.4296 6.11746 31.2315 5.83036C31.0582 5.57871 31.1042 5.23491 31.3377 5.03997C31.8117 4.64655 32.1053 4.27085 32.2752 4.0192C32.4096 3.81717 32.6396 3.69312 32.8837 3.69312C33.2905 3.69312 33.6195 4.02274 33.6195 4.43034Z"
                fill="#6C4023"
              />
            </svg>
            <span className="notification-count"></span>
          </button>
        </div>
        <div className={styles.mallMain}>
          {/* UID 控制區塊（僅測試用，可隱藏） */}
          <div
            className="mb-4 p-3 border rounded"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <h6>測試用：修改 Session UID</h6>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                value={userId}
                onChange={(e) => {
                  const val = e.target.value;
                  sessionStorage.setItem("uid", val);
                  this.setState({ userId: val });
                }}
                placeholder="輸入 uid"
              />
              <button
                className="btn btn-secondary"
                onClick={() => {
                  sessionStorage.removeItem("uid");
                  this.setState({ userId: "" });
                }}
              >
                清除
              </button>
            </div>
            <small className="text-muted">
              Session UID 會即時更新到兌換功能中。
            </small>
          </div>

          {/* 商家優惠券兌換 */}
          {storeCoupons.length > 0 && (
            <>
              <h4 className="mb-3">兌換商家折扣</h4>
              <div className={styles.storeCouponList}>
                {storeCoupons.map((p) => (
                  <div className={styles.storeCouponCard} key={p.id}>
                    <div className={styles.couponTop}>
                      <h6 className={styles.couponName}>{p.name}</h6>
                      <p className={styles.couponPoints}>點數: {p.points}</p>
                    </div>
                    <div className={styles.couponActions}>
                      <button
                        className={styles["btn-detail"]}
                        onClick={() => this.handleShowDetail(p)}
                      >
                        詳細
                      </button>
                      <button
                        className={styles["btn-redeem"]}
                        onClick={() => this.handleRedeem(p)}
                      >
                        兌換
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 租借優惠券兌換 */}
          {rentalCoupons.length > 0 && (
            <>
              <h4 className="mt-4 mb-3">兌換租借折扣</h4>
              <div className={styles.rentalCouponList}>
                {rentalCoupons.map((p) => (
                  <div className={styles.rentalCouponCard} key={p.id}>
                    <div className={styles.couponInfo}>
                      <h5 className={styles.couponName}>{p.name}</h5>
                      <p className={styles.couponDetails}>
                        點數: {p.points} <br />
                        到期日: {p.expirationDate}
                      </p>
                    </div>
                    <div className={styles.couponActions}>
                      <button
                        className={styles["btn-detail"]}
                        onClick={() => this.handleShowDetail(p)}
                      >
                        詳細
                      </button>
                      <button
                        className={styles["btn-redeem"]}
                        onClick={() => this.handleRedeem(p)}
                      >
                        兌換
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 詳細 modal */}
          {showDetailModal && selectedProduct && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedProduct.name}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={this.handleCloseDetail}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <strong>兌換辦法：</strong>
                      {selectedProduct.redemptionMethod}
                    </p>
                    <p>
                      <strong>使用期限：</strong>
                      {selectedProduct.expirationDate}
                    </p>
                    <p>
                      <strong>合作商家契約內容：</strong>
                      {selectedProduct.contractDetails}
                    </p>
                    {selectedProduct.isCoupon && (
                      <div className="alert alert-info">
                        此兌換券的金額將直接匯入您的租借儲值額度中。
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={this.handleCloseDetail}
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 統一兌換結果 modal */}
          {showModal && selectedProduct && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalType === "success" && "兌換成功"}
                      {modalType === "insufficient" && "餘額不足"}
                      {modalType === "error" && "兌換失敗"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={this.handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body text-center">
                    {modalType === "success" && (
                      <>
                        <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                        <p className="mb-0 fs-5">
                          您已成功兌換 <strong>{selectedProduct.name}</strong>！
                        </p>
                      </>
                    )}
                    {modalType === "insufficient" && (
                      <>
                        <i className="bi bi-exclamation-circle-fill text-warning fs-1 mb-3"></i>
                        <p className="mb-0 fs-5">
                          您的點數不足，無法兌換{" "}
                          <strong>{selectedProduct.name}</strong>！
                        </p>
                      </>
                    )}
                    {modalType === "error" && (
                      <>
                        <i className="bi bi-x-circle-fill text-danger fs-1 mb-3"></i>
                        <p className="mb-0 fs-5">
                          兌換 <strong>{selectedProduct.name}</strong>{" "}
                          失敗，請稍後再試！
                        </p>
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary w-100"
                      onClick={this.handleCloseModal}
                    >
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
  }
}

export default Shop;
