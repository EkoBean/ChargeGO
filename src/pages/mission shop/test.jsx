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

  // 處理任務領取功能 (此為示意，請自行串接後端API)
  handleClaimMission = async (userMissionId) => {
    console.log(`正在領取任務：${userMissionId}`);
    try {
      // 發送 POST 請求到後端 API
      const response = await axios.post(
        "http://localhost:4000/usermission/claim",
        { user_mission_id: userMissionId } // 傳遞要領取的 user_mission_id
      );

      // 如果請求成功（狀態碼為 200），重新獲取任務列表以更新畫面
      if (response.status === 200) {
        console.log(response.data.message);
        this.fetchMissions();
      }
    } catch (error) {
      console.error("領取任務失敗:", error);
      // 如果後端回傳錯誤，顯示錯誤訊息
      if (error.response && error.response.data) {
        this.setState({ error: error.response.data.message });
      } else {
        this.setState({ error: "領取任務時發生錯誤，請稍後再試。" });
      }
    }
  };

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
                    key={item.user_mission_id}
                    style={{ marginBottom: "10px", listStyle: "none" }}
                  >
                    <div
                      style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      <h4 style={{ margin: "0", color: "#333" }}>
                        {item.title}
                      </h4>
                      <p style={{ margin: "0", color: "#666" }}>
                        {item.description}
                      </p>
                      <p style={{ margin: "0", color: "#666" }}>
                        完成條件：{item.target_value}
                      </p>
                      <p style={{ margin: "0", color: "#666" }}>
                        獎勵點數：{item.reward_points}
                      </p>
                      <p style={{ margin: "0", color: "#666" }}>
                        開始日期：
                        {new Date(item.mission_start_date).toLocaleDateString(
                          "zh-TW"
                        )}
                      </p>
                      <p style={{ margin: "0", color: "#666" }}>
                        結束日期：
                        {item.mission_end_date
                          ? new Date(item.mission_end_date).toLocaleDateString(
                              "zh-TW"
                            )
                          : "無期限"}
                      </p>

                      {/* 顯示當前進度 */}
                      <div style={{ marginTop: "10px" }}>
                        <p style={{ margin: "0", color: "#666" }}>
                          目前進度：{item.current_progress} /{" "}
                          {item.target_value}
                        </p>
                      </div>

                      {/* 根據任務狀態動態渲染按鈕 */}
                      <div style={{ marginTop: "10px" }}>
                        {item.is_completed === 1 && item.is_claimed === 1 ? (
                          // 狀態: 已完成已領取
                          <span
                            style={{ color: "#28a745", fontWeight: "bold" }}
                          >
                            已領取
                          </span>
                        ) : item.is_completed === 1 && item.is_claimed === 0 ? (
                          // 狀態: 已完成未領取
                          <button
                            onClick={() =>
                              this.handleClaimMission(item.user_mission_id)
                            }
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            可領取
                          </button>
                        ) : (
                          // 狀態: 未完成
                          <button
                            disabled
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "not-allowed",
                              fontWeight: "bold",
                            }}
                          >
                            未完成
                          </button>
                        )}
                      </div>
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
