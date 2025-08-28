import React, { useState, useEffect } from 'react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // TODO: 連線到 /api/tasks 取得任務列表
    fetch('http://127.0.0.1:3000/api/tasks').then(r => r.json()).then(setTasks).catch(()=>setTasks([]));
  }, []);

  return (
    <div>
      <h2>任務管理</h2>
      <p>建立與指派任務給職員，追蹤任務狀態。</p>
      <button>新增任務</button>
      <ul>
        {tasks.length === 0 ? <li>目前無任務</li> : tasks.map(t => (
          <li key={t.id}>{t.title} — {t.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManagement;