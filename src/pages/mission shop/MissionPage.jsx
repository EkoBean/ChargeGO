// src/pages/MissionPage.jsx

import React from "react";
import MissionCard from "../components/MissionCard"; // 導入剛才建立的 MissionCard 元件

// 這是任務列表頁面，我們可以將它放在 pages 資料夾
function MissionPage() {
  // 使用 React 的 useState Hook 來管理狀態資料
  // 未來這裡的資料會從 API 獲取
  const [missionData, setMissionData] = React.useState([
    {
      id: 1,
      title: "累積租借40小時",
      progress: 25,
      progressText: "1/4",
      expiryDate: "至2025-9-28",
      rewardPoints: 2,
      isClaimed: false,
    },
    {
      id: 2,
      title: "每月租借一次",
      progress: 100,
      progressText: "1/1",
      expiryDate: "至2025-8-20",
      rewardPoints: 5,
      isClaimed: false,
    },
    {
      id: 3,
      title: "累積租借時數10小時",
      progress: 100,
      progressText: "已完成",
      expiryDate: "永久有效",
      rewardPoints: 10,
      isClaimed: true,
    },
  ]);

  return (
    // 您原本的 HTML 結構
    <div className="main-container container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>任務列表</h2>
      </div>

      {/* 這裡就是關鍵！使用 map 函數來渲染列表 */}
      <div id="mission-list-container" className="list-group">
        {missionData.map((mission) => (
          // 這裡使用 MissionCard 元件，並傳入每一筆 mission 資料
          // key 屬性是 React 列表渲染的必須，用於效能優化
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

export default MissionPage;
