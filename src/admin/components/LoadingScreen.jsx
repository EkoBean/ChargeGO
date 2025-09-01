import React from 'react';
// 載入中畫面
const LoadingScreen = ({ message = "載入中..." }) => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>{message}</p>
  </div>
);

export default LoadingScreen;