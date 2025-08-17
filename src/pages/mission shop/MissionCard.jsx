// src/components/MissionCard.jsx

import React from "react";

// MissionCard 元件接收一個 props 物件，裡面包含了單個任務的資料
function MissionCard({ mission }) {
  // 根據 mission.isClaimed 狀態來決定按鈕的樣式和文字
  const isClaimedClass = mission.isClaimed ? "btn-secondary" : "btn-light";
  const buttonText = mission.isClaimed ? "已領取" : "領取";
  const buttonDisabled = mission.isClaimed ? true : false;

  // 定義點擊按鈕的處理函式，未來會用於發送 API 請求
  const handleClaimClick = () => {
    // TODO: 在這裡發送 API 請求來領取獎勵
    console.log(`正在領取任務 ID: ${mission.id} 的獎勵...`);
    // 領取成功後，通常會更新父層的狀態
  };

  return (
    // 使用 JSX 語法，類似 HTML 但更強大
    <div className="card rounded-3 shadow-sm p-3 mb-3">
      <div className="card-body p-0">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-bold mb-0">{mission.title}</h5>
          <div className="d-flex flex-column align-items-end">
            <small className="text-muted mb-1">{mission.expiryDate}</small>
            <button
              className={`btn ${isClaimedClass} rounded-pill fw-bold`}
              disabled={buttonDisabled}
              onClick={handleClaimClick}
            >
              {buttonText}
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="progress flex-grow-1" style={{ height: "5px" }}>
            <div
              className="progress-bar bg-dark"
              role="progressbar"
              style={{ width: `${mission.progress}%` }}
              aria-valuenow={mission.progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <span className="text-muted small">{mission.progressText}</span>
        </div>

        <div className="d-flex justify-content-end align-items-center">
          <small className="me-1">P</small>
          <strong className="fs-4">{mission.rewardPoints}</strong>
        </div>
      </div>
    </div>
  );
}

export default MissionCard;
