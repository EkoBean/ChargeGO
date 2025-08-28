import React, { useEffect, useState } from 'react';

const StaffLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // TODO: 把 /api/staff-logs 換成實際後端 endpoint
    fetch('http://127.0.0.1:3000/api/staff-logs')
      .then(r => r.json())
      .then(setLogs)
      .catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h2>職員操作紀錄</h2>
      <p>系統會顯示職員帳號的操作事件（新增/編輯/刪除等）。</p>
      <table>
        <thead>
          <tr><th>時間</th><th>職員</th><th>操作</th><th>細節</th></tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="4">目前無紀錄</td></tr>
          ) : (
            logs.map((l, i) => (
              <tr key={i}>
                <td>{l.time}</td>
                <td>{l.staff}</td>
                <td>{l.action}</td>
                <td>{l.details}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffLogs;