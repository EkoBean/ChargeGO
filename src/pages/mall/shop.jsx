import React, { Component } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

class Shop extends Component {
  state = {
    products: [],
    selectedProduct: null,
    showDetailModal: false,
    showSuccessModal: false,
    userId: localStorage.getItem("userId") || "", // 模擬 user session
  };
  handleUserChange = (e) => {
    const val = e.target.value;
    this.setState({ userId: val });
    localStorage.setItem("userId", val);
  };
  componentDidMount() {
    // 請確認你的 Node.js server 跑在 4001 port
    axios
      .get("http://localhost:4001/products")
      .then((res) => {
        // 假設資料表 coupon_templates 欄位包含：
        // template_id, name, point, image, description, validity_days, type
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
          type: item.type, // 新增 type 欄位
          isCoupon: true,
        }));
        this.setState({ products: formattedData });
      })
      .catch((err) => {
        console.error("抓取後端資料失敗:", err);
      });
  }

  handleShowDetail = (product) => {
    this.setState({ selectedProduct: product, showDetailModal: true });
  };

  handleCloseDetail = () => {
    this.setState({ showDetailModal: false });
  };
  //處理兌換
  handleRedeem = (product) => {
    const { userId } = this.state;

    if (!userId) {
      alert("請先輸入 user_id");
      return;
    }

    console.log("立即兌換按鈕點擊，template_id =", product.id);
    axios
      .post("http://localhost:4002/buycoupons", {
        template_id: product.id,
        user_id: userId,
      })
      .then((res) => {
        console.log("新增成功:", res.data);
        this.setState({ showDetailModal: false, showSuccessModal: true });
      })
      .catch((err) => {
        console.error("新增失敗:", err);
      });
  };

  handleCloseSuccess = () => {
    this.setState({ showSuccessModal: false });
  };

  render() {
    const {
      userId,
      products,
      selectedProduct,
      showDetailModal,
      showSuccessModal,
    } = this.state;

    // 分類商品
    const storeCoupons = products.filter(
      (p) => p.type === "store_gift" || p.type === "store_discount"
    );
    const rentalCoupons = products.filter((p) =>
      ["rental_discount", "free_minutes", "percent_off"].includes(p.type)
    );

    return (
      <div className="container py-4">
        {/* User ID 輸入 */}
        <label className="form-label">模擬 User ID</label>
        <input
          type="text"
          className="form-control mb-4"
          value={userId}
          onChange={this.handleUserChange}
          placeholder="輸入 user_id"
        />

        <h2 className="mb-4">點數商城</h2>

        {/* 商家優惠券兌換 - 橫向滑動 */}
        {storeCoupons.length > 0 && (
          <>
            <h4 className="mb-3">商家優惠券兌換</h4>
            <div className="d-flex overflow-auto pb-2">
              {storeCoupons.map((p) => (
                <div
                  className="card me-3"
                  key={p.id}
                  style={{
                    minWidth: "150px",
                    height: "200px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="card-title">{p.name}</h6>
                      <p className="card-text mb-1">
                        點數: {p.points} <br />
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => this.handleShowDetail(p)}
                      >
                        詳細
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => this.handleRedeem(p)}
                      >
                        兌換
                      </button>
                    </div>
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
            <div className="d-flex flex-column gap-3">
              {rentalCoupons.map((p) => (
                <div className="card shadow-sm" key={p.id}>
                  <div className="card-body d-flex flex-row justify-content-between align-items-center">
                    {/* 左側文字資訊 */}
                    <div>
                      <h5 className="card-title">{p.name}</h5>
                      <p className="card-text mb-1">
                        點數: {p.points} <br />
                        折扣方式: {p.type} <br />
                        到期日: {p.expirationDate}
                      </p>
                    </div>

                    {/* 右側操作按鈕 */}
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => this.handleShowDetail(p)}
                      >
                        詳細
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => this.handleRedeem(p)}
                      >
                        兌換
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal 部分保持不變 */}
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
                    <strong>兌換辦法：</strong>{" "}
                    {selectedProduct.redemptionMethod}
                  </p>
                  <p>
                    <strong>使用期限：</strong> {selectedProduct.expirationDate}
                  </p>
                  <p>
                    <strong>合作商家契約內容：</strong>{" "}
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

        {showSuccessModal && selectedProduct && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">兌換成功</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={this.handleCloseSuccess}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                  <p className="mb-0 fs-5">
                    您已成功兌換 <strong>{selectedProduct.name}</strong>！
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={this.handleCloseSuccess}
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
