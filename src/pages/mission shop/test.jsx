import React, { Component } from "react";
import axios from "axios";

class Test extends Component {
  state = {
    mission: [],
    loading: false,
    error: null,
    userId: "1", // 預設使用者 ID
    filterDate: this.getTodayDate(), // 預設為今天，使用自訂方法
  };

  componentDidMount() {
    this.fetchMissions();
  }

  // 自訂方法來取得今日日期並格式化
  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async fetchMissions() {
    const { userId, filterDate } = this.state;
    this.setState({ loading: true, error: null, mission: [] });

    try {
      // 捕捉非同步請求可能發生的錯誤
      const result = await axios.get(
        `http://localhost:4000/mission/${userId}/${filterDate}`
      );

      console.log("API回傳的資料:", result.data);

      if (Array.isArray(result.data)) {
        this.setState({
          mission: result.data,
          loading: false,
        });
      } else {
        this.setState({
          error: "從伺服器獲得的資料格式不正確，預期為陣列。",
          loading: false,
        });
      }
    } catch (error) {
      console.error("無法從伺服器獲取任務資料:", error);
      this.setState({
        error: "無法從伺服器獲取任務資料，請檢查後端服務。",
        loading: false,
      });
    }
  }

  handleInputChange = (event) => {
    const { id, value } = event.target;
    this.setState({ [id]: value });
  };

  render() {
    const { mission, loading, error, userId, filterDate } = this.state;

    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          我的任務列表
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label
              htmlFor="userId"
              style={{ display: "block", marginBottom: "5px" }}
            >
              使用者 ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={this.handleInputChange}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="filterDate"
              style={{ display: "block", marginBottom: "5px" }}
            >
              篩選日期
            </label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={this.handleInputChange}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            onClick={() => this.fetchMissions()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            獲取任務資料
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            任務資料載入中...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
            錯誤: {error}
          </div>
        ) : (
          <div>
            {mission.length > 0 ? (
              <ul>
                {mission.map((item) => (
                  <li
                    key={item.mission_user_id}
                    style={{ marginBottom: "10px", listStyle: "none" }}
                  >
                    <div
                      style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <h4 style={{ margin: "0", color: "#333" }}>
                        {item.title}
                      </h4>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        {item.description}
                      </p>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        完成條件：{item.target_value}
                      </p>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        獎勵點數：{item.reward_points}
                      </p>
                      {/* 顯示任務開始和結束日期 */}
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        開始日期：
                        {new Date(item.mission_start_date).toLocaleDateString(
                          "zh-TW"
                        )}
                      </p>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        結束日期：
                        {item.mission_end_date
                          ? new Date(item.mission_end_date).toLocaleDateString(
                              "zh-TW"
                            )
                          : "無期限"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                沒有找到任何任務。
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Test;
