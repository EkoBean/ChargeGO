import React from 'react';

// 載入中畫面
const LoadingScreen = ({ message = "載入中..." }) => (
  <div className="admin-loading-screen">
    <div className="admin-loading-spinner"></div>
    <p>{message}</p>
  </div>
);

export default LoadingScreen;