import React, { Component } from "react";
import axios from "axios";
// import ChargegoLogo from "../../components/ChargegoLogo/ChargegoLogo"; // 修正 import 路徑
import NavBarApp from "../../components/NavBarApp";
import styles from "../../styles/scss/mall_index.module.scss";
import { apiRoutes } from "../../components/apiRoutes";
import Notify from "../../components/notify";
const API_URL = import.meta.env.VITE_API_URL;
const pointBasePath = apiRoutes.point;
const missionBasePath = apiRoutes.mission;


class Mission extends Component {
  state = {
    mission: [],
    loading: false,
    error: null,
    userId: sessionStorage.getItem("uid") || "",
    filterDate: this.getTodayDate(),
    userPoint: null,
    claimingMissionId: null,
  };

  componentDidMount() {
    console.log("Component mounted.");
    console.log("Initial userId from state:", this.state.userId);
    console.log("filterDate", this.state.filterDate);
    window.addEventListener("storage", this.handleStorageChange);
    this.fetchMissions();
    this.refreshUserPoint();
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.handleStorageChange);
  }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ===== 點數相關 =====
  getUserPoint = async (userId) => {
    if (!userId) return null;
    try {
      const res = await axios.get(
        `${API_URL}${pointBasePath}/checkpoints/${userId}`
      );
      return res.data?.point ?? null;
    } catch (err) {
      console.error("Error fetching point:", err);
      return null;
    }
  };

  // 回傳最新 point（可被 await）
  refreshUserPoint = async () => {
    const uid = this.state.userId || sessionStorage.getItem("uid") || "";
    if (!uid) {
      this.setState({ userPoint: null });
      return null;
    }
    try {
      const point = await this.getUserPoint(uid);
      this.setState({ userPoint: point });
      return point;
    } catch (err) {
      this.setState({ userPoint: null });
      return null;
    }
  };
  // ====================

  handleStorageChange = (e) => {
    if (e.key === "uid") {
      const newUid = e.newValue || "";
      this.setState({ userId: newUid }, () => {
        this.fetchMissions();
        this.refreshUserPoint();
      });
    }
  };

  async fetchMissions() {
    const userId = this.state.userId || sessionStorage.getItem("uid") || "";
    const { filterDate } = this.state;
    this.setState({ loading: true, error: null, mission: [] });

    try {
      await axios.post(`${API_URL}${missionBasePath}/update/monthRental`, {
        userId,
        filterDate,
      });
      await axios.post(`${API_URL}${missionBasePath}/update/monthHours`, {
        userId,
        filterDate,
      });

      const missionsResponse = await axios.get(
        `${API_URL}${missionBasePath}/${userId}/${filterDate}`
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
      console.error("fetchMissions error:", error);
      this.setState({
        error: "無法從伺服器獲取任務資料，請檢查後端服務。",
        loading: false,
      });
    }
  }

  // 使用後端回傳的 point 更新（若有），否則 fallback 呼叫 refreshUserPoint
  handleClaimMission = async (userMissionId) => {
    const { userId, mission } = this.state;

    if (!userId) {
      alert("請先輸入使用者 ID 並設為 session");
      return;
    }

    const missionItem = mission.find(
      (m) => m.user_mission_id === userMissionId
    );
    const rewardPoints = Number(missionItem?.reward_points ?? 0);

    try {
      this.setState({ claimingMissionId: userMissionId });

      const response = await axios.post(
        `${API_URL}${missionBasePath}/usermission/claim`,
        {
          user_mission_id: userMissionId,
          user_id: userId,
        }
      );

      if (response.status === 200) {
        // 優先使用後端回傳的 point（若有）
        if (response.data && typeof response.data.point !== "undefined") {
          this.setState({ userPoint: response.data.point });
        } else {
          // fallback：向 /checkpoints 再拿一次
          await this.refreshUserPoint();
        }

        // 更新任務列表（該任務應該會變成已領）
        await this.fetchMissions();
      } else {
        // 非 200 的情況
        await this.refreshUserPoint();
        alert("領取失敗，請稍後再試。");
      }
    } catch (error) {
      console.error("領取任務錯誤：", error);
      // 若伺服器回傳錯誤訊息，顯示給使用者
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("領取任務時發生錯誤，請稍後再試。");
      }
      // 確保 UI 同步回伺服器最新值
      await this.refreshUserPoint();
    } finally {
      this.setState({ claimingMissionId: null });
    }
  };

  handleInputChange = (event) => {
    const { id, value } = event.target; // 新增這兩行來查看 id 和 value 的內容
    console.log("觸發事件的元素 id:", id);
    console.log("觸發事件的元素 value:", value);
    if (id === "userId") {
      sessionStorage.setItem("uid", value);
      this.setState({ userId: value }, () => {
        // 輸入 uid 時立即刷新點數（任務仍需按獲取或可改為自動）
        this.refreshUserPoint();
      });
      return;
    }

    this.setState({ [id]: value });
  };

  render() {
    const {
      mission,
      loading,
      error,
      userId,
      filterDate,
      userPoint,
      claimingMissionId,
    } = this.state;

    return (
      <div className={styles.mallBody}>
        <Notify />

        <NavBarApp />
        {/* mission的navbar */}
        <div className={styles.mallNavbar}>
          <button className={styles.navbarLeftSection}>
            <img src="/Iconimg/backBtn.svg" alt="backBtn" />
          </button>

          <div className={styles.navbarCenterSection}>
            <div className={styles.pointCircle}>
              <div className={styles.circleText}>
                <img src="/Iconimg/greenpoint.svg" alt="point" />
                點數
              </div>
              <p className={styles.circleNumber}>
                {userPoint !== null ? userPoint : "載入中"}
              </p>
            </div>

            <div className={styles.missionCircle}>
              <div className={styles.circleText}>去逛逛</div>
              <img src="/Iconimg/Shopping Cart.svg" alt="去逛逛" />
            </div>
          </div>


        </div>
        {/* mission的main */}
        <div className={styles.mallMain}>
          <div className={styles.missiontitle}>任務</div>
          <div className={styles.missiondatefilter}>
            <label htmlFor="filterDate">日期</label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={this.handleInputChange}
            />
            <button onClick={() => this.fetchMissions()}>確認</button>
          </div>
          {loading ? (
            <div className={styles["loading-text"]}>任務資料載入中...</div>
          ) : error ? (
            <div className={styles["error-text"]}>錯誤: {error}</div>
          ) : mission.length > 0 ? (
            <div className={styles.missionList}>
              {mission.map((item) => {
                return (
                  <div
                    className={styles.missionCard}
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
                          disabled={claimingMissionId === item.user_mission_id}
                        >
                          {claimingMissionId === item.user_mission_id
                            ? "領取中..."
                            : "領取"}
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
                        <img src="/Iconimg/greenpoint.svg" alt="p" />
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
      </div>
    );
  }
}

export default Mission;
