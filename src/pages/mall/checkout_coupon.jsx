import React, { Component } from "react";
import axios from "axios";
import styles from "../../styles/scss/mall_index.module.scss"; 
import { apiRoutes } from "../../components/apiRoutes";

const API_URL = import.meta.env.VITE_API_URL;

const couponBasePath = apiRoutes.coupon;

class CheckoutCoupons extends Component {
  state = {
    userId: "",
    coupons: [],
    loading: false,
    error: "",
    couponInfo: null, // API 回傳的折扣資訊
    minutes: "", // 租借分鐘數
    finalAmount: null, // 折扣後金額
    baseAmount: null, // 原始金額
  };

  handleChange = (e) => {
    this.setState({ userId: e.target.value });
  };

  handleMinutesChange = (e) => {
    this.setState({ minutes: e.target.value }, this.calculateFinalAmount);
  };

  fetchCoupons = async () => {
    const { userId } = this.state;
    if (!userId) {
      alert("請輸入 user_id");
      return;
    }

    this.setState({
      loading: true,
      error: "",
      coupons: [],
      couponInfo: null,
      finalAmount: null,
      baseAmount: null,
    });

    try {
      const res = await axios.get(`${API_URL}${couponBasePath}/mycoupons/${userId}`);
      this.setState({ coupons: res.data });
    } catch (err) {
      console.error(err);
      this.setState({ error: "查詢優惠券 API 請求失敗" });
    } finally {
      this.setState({ loading: false });
    }
  };

  useCoupon = async (couponId) => {
    const { userId } = this.state;
    try {
      const res = await axios.get(
        `${API_URL}${couponBasePath}/coupon-info/${userId}/${couponId}`
      );
      this.setState({ couponInfo: res.data }, this.calculateFinalAmount);
    } catch (err) {
      console.error(err);
      this.setState({ couponInfo: { error: "取得折扣資訊失敗" } });
    }
  };

  // 計算折扣後金額
  calculateFinalAmount = () => {
    const { minutes, couponInfo } = this.state;

    // 如果沒有輸入分鐘數，或 API 回傳的 couponInfo 為空或有錯誤，則不計算
    if (!minutes || !couponInfo || couponInfo.error) {
      this.setState({ finalAmount: null, baseAmount: null });
      return;
    }

    const pricePer30Min = 5; // 每 30 分鐘租借費用 5 元
    const baseAmount = Math.ceil(minutes / 30) * pricePer30Min; // 原價：將分鐘數向上取整到 30 分鐘區塊，再乘每區塊價格
    let finalAmount = baseAmount; // 初始折扣後金額 = 原價

    switch (couponInfo.type) {
      case "rental_discount": // 租借折扣：直接減固定金額
        finalAmount = Math.max(0, baseAmount - couponInfo.value);
        // 確保折扣後金額不為負數
        break;

      case "percent_off": // 百分比折扣
        finalAmount = baseAmount * (1 - couponInfo.value / 100);
        // 例：value=20 → 8 折
        break;

      case "free_minutes": // 免費分鐘數優惠券
        const freeBlocks = Math.floor(couponInfo.value / 30);
        // 將優惠券提供的免費分鐘數轉換成完整的 30 分鐘區塊數
        const payableBlocks = Math.max(0, Math.ceil(minutes / 30) - freeBlocks);
        // 計算剩下需要付費的區塊數，不能小於 0
        finalAmount = payableBlocks * pricePer30Min;
        // 折扣後金額 = 剩下需付費區塊數 × 每區塊價格
        break;

      default:
        break; // 其他未知類型不做折扣
    }

    // 將原價與折扣後金額存入 state
    this.setState({ finalAmount, baseAmount });
  };

  // 將優惠券類型代碼轉成中文顯示
  getTypeName = (type) => {
    switch (type) {
      case "rental_discount":
        return "租借折扣";
      case "free_minutes":
        return "免費分鐘";
      case "percent_off":
        return "折扣百分比";
      default:
        return type; // 其他未知類型直接顯示原始代碼
    }
  };

  render() {
    const {
      userId,
      coupons,
      loading,
      error,
      couponInfo,
      minutes,
      finalAmount,
      baseAmount,
    } = this.state;

    return (
      <div className={styles.container + " mt-4"}>
        <h2>結帳租借優惠券</h2>

        {/* 搜尋區塊 */}
        <div className={"mb-3 d-flex align-items-center flex-wrap"}>
          <label className="me-2">User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={this.handleChange}
            className="form-control me-2 mb-2"
            style={{ width: "120px" }}
          />
          <button
            className="btn btn-primary me-3 mb-2"
            onClick={this.fetchCoupons}
          >
            查詢優惠券
          </button>

          {/* 顯示 API 折扣結果 */}
          <div className="border p-2 flex-grow-1 mb-2 bg-light">
            {couponInfo ? (
              couponInfo.error ? (
                <span className="text-danger">{couponInfo.error}</span>
              ) : (
                <span>
                  ✅ 已選優惠券：{couponInfo.coupon_id} <br />
                  類型: {this.getTypeName(couponInfo.type)} <br />
                  折扣值: {couponInfo.value}
                </span>
              )
            ) : (
              <span>API 回傳結果顯示區</span>
            )}
          </div>
        </div>

        {/* 輸入租借分鐘數 */}
        <div className="mb-3">
          <label>租借分鐘數：</label>
          <input
            type="number"
            value={minutes}
            onChange={this.handleMinutesChange}
            className="form-control"
            placeholder="輸入租借時間 (分鐘)"
            style={{ maxWidth: "200px" }}
          />
        </div>

        {/* 顯示原始金額與折扣後金額 */}
        {baseAmount !== null && (
          <div className="alert alert-secondary">
            🧾 原始金額：<strong>{baseAmount} 元</strong>
          </div>
        )}
        {finalAmount !== null && (
          <div className="alert alert-info">
            💰 折扣後金額：<strong>{finalAmount} 元</strong>
          </div>
        )}

        {loading && <p>讀取中...</p>}
        {error && <p className="text-danger">{error}</p>}

        {/* 優惠券卡片清單 */}
        <div className={styles.taskList}>
          {coupons.length > 0
            ? coupons.map((c) => (
                <div
                  className={styles.taskCard + " shadow-sm"}
                  key={c.coupon_id}
                >
                  <div className={styles.taskLeft}>
                    <h5 className="card-title">{c.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      {this.getTypeName(c.type)}
                    </h6>
                    <p className="card-text">
                      截止日期:{" "}
                      {new Date(c.expires_at).toLocaleDateString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className={styles.taskRight}>
                    <button
                      className={styles.claimBtn}
                      onClick={() => this.useCoupon(c.coupon_id)}
                    >
                      使用
                    </button>
                  </div>
                </div>
              ))
            : !loading && <p>目前沒有可用的優惠券</p>}
        </div>
      </div>
    );
  }
}

export default CheckoutCoupons;
