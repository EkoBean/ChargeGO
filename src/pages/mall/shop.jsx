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
      .get("http://localhost:4001/coupon")
      .then((res) => {
        // 假設資料表 coupon_templates 欄位包含：
        // template_id, name, point, image, description, validity_days
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
    const { userId } = this.state;

    const { products, selectedProduct, showDetailModal, showSuccessModal } =
      this.state;

    return (
      <div className="container py-4">
        <label className="form-label">模擬 User ID</label>
        <input
          type="text"
          className="form-control"
          value={userId}
          onChange={this.handleUserChange}
          placeholder="輸入 user_id"
        />
        <h2 className="mb-4">點數商城</h2>
        <div className="row g-3">
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-xl-3">
              <div className="card h-100">
                <img
                  src={product.image}
                  className="card-img-top"
                  alt={product.name}
                  style={{ objectFit: "cover", height: "120px" }}
                  onClick={() => this.handleShowDetail(product)}
                />
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1">{product.name}</h6>
                  <p className="card-text mb-0">
                    點數:{" "}
                    <strong className="text-warning">{product.points}</strong>
                  </p>

                  {/* 小文字觸發詳細內容 */}
                  <small
                    className="text-primary mt-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => this.handleShowDetail(product)}
                  >
                    查看詳細
                  </small>

                  <button
                    className="btn btn-warning btn-sm mt-auto"
                    onClick={() => {
                      console.log("兌換按鈕點擊，template_id =", product.id);
                      // 這裡不開啟詳細資訊，只做兌換
                      this.handleRedeem(product);
                    }}
                  >
                    兌換
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 商品詳細 Modal */}
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

        {/* 兌換成功 Modal */}
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
