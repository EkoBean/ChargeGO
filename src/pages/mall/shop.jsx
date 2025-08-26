import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
//產品資料
const productsData = [
  {
    id: 1,
    name: "10元租借折扣券",
    points: 100,
    image: "https://placehold.co/400x200/cccccc/000000?text=$10",
    redemptionMethod: "兌換成功後，此折扣券將直接匯入您的租借儲值額度中。",
    expirationDate: "兌換後30天內有效",
    contractDetails: "此折扣券僅限於指定租借服務，詳情請參閱活動條款。",
    isCoupon: true,
  },
  {
    id: 2,
    name: "30元租借折扣券",
    points: 250,
    image: "https://placehold.co/400x200/cccccc/000000?text=$30",
    redemptionMethod: "兌換成功後，此折扣券將直接匯入您的租借儲值額度中。",
    expirationDate: "兌換後60天內有效",
    contractDetails: "此折扣券僅限於指定租借服務，詳情請參閱活動條款。",
    isCoupon: true,
  },
  {
    id: 3,
    name: "30元租借折扣券",
    points: 250,
    image: "https://placehold.co/400x200/cccccc/000000?text=$30",
    redemptionMethod: "兌換成功後，此折扣券將直接匯入您的租借儲值額度中。",
    expirationDate: "兌換後60天內有效",
    contractDetails: "此折扣券僅限於指定租借服務，詳情請參閱活動條款。",
    isCoupon: true,
  },
  {
    id: 4,
    name: "30元租借折扣券",
    points: 250,
    image: "https://placehold.co/400x200/cccccc/000000?text=$30",
    redemptionMethod: "兌換成功後，此折扣券將直接匯入您的租借儲值額度中。",
    expirationDate: "兌換後60天內有效",
    contractDetails: "此折扣券僅限於指定租借服務，詳情請參閱活動條款。",
    isCoupon: true,
  },
];

class Shop extends Component {
  //儲存元件狀態
  state = {
    products: productsData,
    selectedProduct: null, //暫存商品資料
    showDetailModal: false, //控制商品詳細資訊是否顯示
    showSuccessModal: false, //控制兌換成功提示是否顯示
  };
  //輸入參數為product，暫存在selectedProduct，用於商品詳細資訊的顯示，showDetailModal為true，開啟商品詳細資訊視窗
  handleShowDetail = (product) => {
    this.setState({ selectedProduct: product, showDetailModal: true });
  };
  //關閉商品詳細資訊視窗
  handleCloseDetail = () => {
    this.setState({ showDetailModal: false });
  };
  //開啟成功兌換視窗，同時關閉商品詳細視窗
  handleRedeem = () => {
    this.setState({ showDetailModal: false, showSuccessModal: true });
  };
  //關閉成功兌換視窗
  handleCloseSuccess = () => {
    this.setState({ showSuccessModal: false });
  };

  render() {
    const { products, selectedProduct, showDetailModal, showSuccessModal } =
      this.state;

    return (
      <div className="container py-4">
        <h2 className="mb-4">點數商城</h2>
        <div className="row g-3">
          {/* .map 輸入product 輸出jsx div陣列 */}
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
                  <button
                    className="btn btn-warning btn-sm mt-auto"
                    onClick={() => {
                      this.handleShowDetail(product);
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
                  <button
                    className="btn btn-warning"
                    onClick={this.handleRedeem}
                  >
                    立即兌換
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
