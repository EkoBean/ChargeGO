import React, { Component } from "react";
import axios from "axios";
import styles from "../../styles/scss/mall_index.module.scss";
import NavBarPhone from "../../components/NavBarApp";
class Shop extends Component {
  state = {
    products: [],
    selectedProduct: null,
    showDetailModal: false,
    showModal: false,
    modalType: "",
    userId: sessionStorage.getItem("uid") || "", // 直接從 session 讀 uid
    userPoint: null, // 新增
  };

  // ✅ 抓取點數 API
  getUserPoint = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:4005/checkpoints/${userId}`
      );
      return res.data.point;
    } catch (err) {
      console.error("Error fetching point:", err);
      return null;
    }
  };

  // ✅ 共用刷新方法
  refreshUserPoint = () => {
    const { userId } = this.state;
    if (userId) {
      this.getUserPoint(userId).then((point) => {
        this.setState({ userPoint: point });
      });
    }
  };

  // 每秒檢查 session uid 是否更新
  // 每秒檢查 session uid 是否更新
  checkSessionUid = () => {
    const uid = sessionStorage.getItem("uid") || "";
    if (uid !== this.state.userId) {
      this.setState({ userId: uid });
    }
  };

  componentDidMount() {
    // 監聽 storage 事件，當其他地方更新 sessionStorage.uid 時觸發
    window.addEventListener("storage", this.handleStorageChange);

    // 抓商品
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

    // 抓使用者點數
    this.refreshUserPoint();
  }

  componentWillUnmount() {
    // 移除 storage 監聽
    window.removeEventListener("storage", this.handleStorageChange);
  }
  // ✅ 當 sessionStorage.uid 變動時觸發
  handleStorageChange = (e) => {
    if (e.key === "uid") {
      const newUid = e.newValue || "";
      this.setState({ userId: newUid }, this.refreshUserPoint);
    }
  };
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
        this.setState(
          {
            selectedProduct: product,
            showModal: true,
            modalType: "success",
          },
          this.refreshUserPoint // <-- 兌換後刷新點數
        );
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
      <div className={styles.mallBody}>
        <NavBarPhone />

        <div className={styles.mallNavbar}>
          {/* 返回首頁 */}

          <button className={styles.navbarLeftSection}>
            <img src="/Iconimg/backBtn.svg" alt="backBtn" />
          </button>

          {/* 裝點數與任務連結的容器 */}
          <div className={styles.navbarCenterSection}>
            {/* 點數顯示 */}
            <div className={styles.pointCircle}>
              <div className={styles.circleText}>
                <img src="/Iconimg/greenpoint.svg" alt="point" />
                點數
              </div>
              <p className={styles.circleNumber}>
                {this.state.userPoint !== null
                  ? this.state.userPoint
                  : "載入中"}
              </p>
            </div>
            {/* 導向任務連結 */}
            <div className={styles.missionCircle}>
              <div className={styles.circleText}>任務</div>
              <img src="/Iconimg/quest.svg" alt="任務" />
            </div>
          </div>

          {/* 右上角通知鈴鐺*/}
          <button className={styles.navbarRightSection}>
            {/* 右上角通知鈴鐺 */}
            <img src="/Iconimg/notify.svg" alt="notify" />
          </button>
        </div>
        {/* 白色區塊 */}
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
              <h4 className={styles.malltitle}>兌換商家折扣</h4>
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
              <h4 className={styles.malltitle}>兌換租借折扣</h4>
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
                        className={styles["btn-redeem"]}
                        onClick={() => this.handleRedeem(p)}
                      >
                        兌換
                      </button>
                    </div>
                    {/* <p
                      className={styles.couponDetails}
                      onClick={() => this.handleShowDetail(p)}
                    >
                      詳細
                    </p> */}
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
