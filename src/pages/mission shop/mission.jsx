// style
import "../../styles/scss/mission.scss";

//React
import React, { useEffect, Component } from "react";
import MissionPage from "./MissionPage"; // 導入任務列表頁面

function Mission() {
  return (
    <div>
      {/* header */}
      <header class="header">
        <div class="logo">
          <p class="mb-0 text-muted">返回</p>
        </div>
        <div class="top-right-nav">
          <div class="d-flex align-items-center">
            <p class="mb-0 me-2">P點數</p>
            <strong class="fs-4 text-warning">58</strong>
          </div>

          <a href="#" class="nav-button active">
            <span>商城</span>
          </a>

          <div class="user-icon position-relative">
            <i class="bi bi-person-circle fs-2 text-secondary"></i>
            <span class="badge bg-danger position-absolute top-0 start-100 translate-middle p-1 rounded-circle"></span>
          </div>
        </div>
      </header>
      {/* 在這裡渲染您的任務列表頁面 */}
      <MissionPage />
      {/* 這裡可以放您的 Footer 等共用元件 */}
    </div>
  );
}

export default Mission;
