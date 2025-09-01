import React, { Component } from "react";
import axios from "axios";

class CheckoutCoupons extends Component {
  state = {
    userId: "",
    coupons: [],
    loading: false,
    error: "",
  };

  handleChange = (e) => {
    this.setState({ userId: e.target.value });
  };

  fetchCoupons = async () => {
    const { userId } = this.state;
    if (!userId) {
      alert("請輸入 user_id");
      return;
    }

    this.setState({ loading: true, error: "", coupons: [] });

    try {
      const res = await axios.get(`http://localhost:4002/mycoupons/${userId}`);
      this.setState({ coupons: res.data });
    } catch (err) {
      console.error(err);
      this.setState({ error: "API 請求失敗" });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { userId, coupons, loading, error } = this.state;

    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>結帳租借優惠券</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>User ID: </label>
          <input
            type="text"
            value={userId}
            onChange={this.handleChange}
            style={{ padding: "5px", width: "100px" }}
          />
          <button
            onClick={this.fetchCoupons}
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            查詢優惠券
          </button>
        </div>

        {loading && <p>讀取中...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {coupons.length > 0 && (
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", marginTop: "10px" }}
          >
            <thead>
              <tr>
                <th>coupon_id</th>
                <th>template_id</th>
                <th>status</th>
                <th>is_expired</th>
                <th>expires_at</th>
                <th>name</th>
                <th>type</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.coupon_id}>
                  <td>{c.coupon_id}</td>
                  <td>{c.template_id}</td>
                  <td>{c.status}</td>
                  <td>{c.is_expired}</td>
                  <td>{c.expires_at}</td>
                  <td>{c.name}</td>
                  <td>{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {coupons.length === 0 && !loading && <p>目前沒有可用的優惠券</p>}
      </div>
    );
  }
}

export default CheckoutCoupons;
