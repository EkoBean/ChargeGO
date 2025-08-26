import React from 'react';

const ErrorScreen = ({ message = "發生錯誤", onRetry }) => (
  <div className="error-screen">
    <div className="error-message">
      <h3>載入錯誤</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn primary" onClick={onRetry}>
          重新載入
        </button>
      )}
    </div>
  </div>
);

export default ErrorScreen;