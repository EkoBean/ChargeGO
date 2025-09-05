import React, { Component } from "react";
import axios from "axios";
import styles from "../../styles/scss/mall_index.module.scss"; // 修正匯入方式

class Mission extends Component {
  state = {
    mission: [],
    loading: false,
    error: null,
    userId: "1",
    filterDate: this.getTodayDate(),
  };

  componentDidMount() {
    this.fetchMissions();
  }

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
      await axios.post(`http://localhost:4000/update/monthRental`, {
        userId,
        filterDate,
      });
      await axios.post(`http://localhost:4000/update/monthHours`, {
        userId,
        filterDate,
      });

      const missionsResponse = await axios.get(
        `http://localhost:4000/mission/${userId}/${filterDate}`
      );

      if (Array.isArray(missionsResponse.data)) {
        this.setState({ mission: missionsResponse.data, loading: false });
      } else {
        this.setState({
          error: "從伺服器獲得的任務資料格式不正確，預期為陣列。",
          loading: false,
        });
      }
    } catch (error) {
      this.setState({
        error: "無法從伺服器獲取任務資料，請檢查後端服務。",
        loading: false,
      });
    }
  }

  handleClaimMission = async (userMissionId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/usermission/claim",
        { user_mission_id: userMissionId }
      );

      if (response.status === 200) {
        this.fetchMissions();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert("領取任務時發生錯誤，請稍後再試。");
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
      <div className={styles.container}>
        <h2 className={styles.title}>我的任務列表</h2>

        <div className={styles["filter-row"]}>
          <div>
            <label htmlFor="userId">使用者 ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="filterDate">篩選日期</label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={this.handleInputChange}
            />
          </div>
          <button onClick={() => this.fetchMissions()}>獲取任務資料</button>
        </div>

        {loading ? (
          <div className={styles["loading-text"]}>任務資料載入中...</div>
        ) : error ? (
          <div className={styles["error-text"]}>錯誤: {error}</div>
        ) : mission.length > 0 ? (
          <div className={styles.taskList}>
            {mission.map((item) => {
              const progressPercent = Math.min(
                100,
                (item.current_progress / item.target_value) * 100
              );

              return (
                <div
                  className={styles.taskCard}
                  key={item.user_mission_id}
                  style={{ padding: "12px" }}
                >
                  <div className={styles.taskLeft}>
                    <div className={styles.taskName}>{item.title}</div>
                    <p>
                      任務進度：{item.current_progress}/{item.target_value}
                    </p>
                  </div>

                  <div className={styles.taskRight}>
                    <div className={styles.endDate}>
                      {item.mission_end_date
                        ? `至${new Date(
                            item.mission_end_date
                          ).toLocaleDateString("zh-TW")}`
                        : "無期限"}
                    </div>

                    {item.is_completed === 1 && item.is_claimed === 0 ? (
                      <button
                        className={styles.claimBtn}
                        onClick={() =>
                          this.handleClaimMission(item.user_mission_id)
                        }
                      >
                        領取
                      </button>
                    ) : item.is_completed === 1 && item.is_claimed === 1 ? (
                      <span className={styles["claimed-text"]}>已領取</span>
                    ) : (
                      <button
                        className={`${styles.claimBtn} ${styles.disabled}`}
                        disabled
                      >
                        未完成
                      </button>
                    )}

                    <div className={styles.point}>
                      <span className={styles["point-icon"]}>P</span>
                      {item.reward_points}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles["no-mission-text"]}>沒有找到任何任務。</p>
        )}
      </div>
    );
  }
}

export default Mission;
