import React, { Component } from "react";
import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/scss/mall_index";

class Shop extends Component {
  state = {
    products: [],
    selectedProduct: null,
    showDetailModal: false,
    showModal: false, // 控制統一 modal
    modalType: "", // "success" | "insufficient" | "error"
    userId: localStorage.getItem("userId") || "", // 模擬 user session
  };

  handleUserChange = (e) => {
    const val = e.target.value;
    this.setState({ userId: val });
    localStorage.setItem("userId", val);
  };
  // 抓後端資料並且格式化
  componentDidMount() {
    axios
      .get("http://localhost:4001/products")
      .then((res) => {
        // 格式化資料存放變數

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
        console.log(formattedData);
        //將格式化資料傳進state

        this.setState({ products: formattedData });
      })
      .catch((err) => console.error("抓取後端資料失敗:", err));
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
      alert("請先輸入 user_id");
      return;
    }

    try {
      // 先檢查點數餘額
      const balanceRes = await axios.get("http://localhost:4001/checkpoints", {
        params: {
          user_id: userId,
          template_id: product.id,
        },
      });
      console.log("checkpoints回傳", balanceRes);
      if (!balanceRes.data.sufficient) {
        // 點數不足
        this.setState({
          selectedProduct: product,
          showModal: true,
          modalType: "insufficient",
        });
        return; // 不繼續兌換
      }
      const redeemRes = await axios.post("http://localhost:4001/buycoupons", {
        template_id: product.id,
        user_id: userId,
      });
      console.log(redeemRes);
      if (redeemRes.data.success) {
        this.setState({
          selectedProduct: product,
          showModal: true,
          modalType: "success",
        });
        // 2️⃣ 點數足夠，執行兌換
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
      <div className="container py-4">
        <label className="form-label">模擬 User ID</label>
        <input
          type="text"
          className="form-control mb-4"
          value={userId}
          onChange={this.handleUserChange}
          placeholder="輸入 user_id"
        />

        <h2 className="mb-4">點數商城</h2>

        {/* 商家優惠券兌換 */}
        {storeCoupons.length > 0 && (
          <>
            <h4 className="mb-3">商家優惠券兌換</h4>
            <div className="storeCouponList">
              {storeCoupons.map((p) => (
                <div className="storeCouponCard" key={p.id}>
                  <div className="couponTop">
                    <h6 className="couponName">{p.name}</h6>
                    <p className="couponPoints">點數: {p.points}</p>
                  </div>
                  <div className="couponActions">
                    <button
                      className="btn-detail"
                      onClick={() => this.handleShowDetail(p)}
                    >
                      詳細
                    </button>
                    <button
                      className="btn-redeem"
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
            <h4 className="mt-4 mb-3">租借優惠券兌換</h4>
            <div className="rentalCouponList">
              {rentalCoupons.map((p) => (
                <div className="rentalCouponCard" key={p.id}>
                  <div className="couponInfo">
                    <h5 className="couponName">{p.name}</h5>
                    <p className="couponDetails">
                      點數: {p.points} <br />
                      折扣方式: {p.type} <br />
                      到期日: {p.expirationDate}
                    </p>
                  </div>
                  <div className="couponActions">
                    <button
                      className="btn-detail"
                      onClick={() => this.handleShowDetail(p)}
                    >
                      詳細
                    </button>
                    <button
                      className="btn-redeem"
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
    );
  }
}

export default Shop;
