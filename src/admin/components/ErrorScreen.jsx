import React from 'react';

const ErrorScreen = ({ message = "發生錯誤", onRetry }) => (
  <div className="admin-error-screen">
    <div className="admin-error-message">
      <h3>載入錯誤</h3>
      <p>{message}</p>
      {/* 按鈕樣式 (保留 Bootstrap + 添加 admin 前綴) */}
      {onRetry && (
        <button className="btn admin-btn admin-primary" onClick={onRetry}>
          重新載入
        </button>
      )}
    </div>
  </div>
);

export default ErrorScreen;