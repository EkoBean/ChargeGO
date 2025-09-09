import React, { useEffect, useState, useMemo } from 'react';
import ApiService from '../services/api';

//職員操作紀錄
const StaffLogs = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  // 資料載入 function
  const fetchData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      ApiService.getEmployeeLogs().catch(() => []),
      ApiService.getEmployees().catch(() => [])
    ])
      .then(([logsData, empData]) => {
        setLogs(Array.isArray(logsData) ? logsData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
      })
      .catch(() => {
        setError('載入資料失敗');
        setLogs([]);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const staffMap = useMemo(() => {
    const m = {};
    employees.forEach(emp => {
      const id = String(emp.employee_id ?? emp.id ?? '').trim();
      if (!id) return;
      m[id] = {
        name: emp.employee_name ?? emp.name ?? emp.username ?? `#${id}`,
        email: emp.employee_email ?? emp.employee_mail ?? emp.email ?? ''
      };
    });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return logs
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.employee_log_date || a.time || a.created_at).getTime() || 0;
        const tb = new Date(b.employee_log_date || b.time || b.created_at).getTime() || 0;
        return tb - ta;
      })
      .filter(l => {
        if (!ql) return true;
        const staff = staffMap[String(l.employee_id ?? l.employee)] || { name: '' };
        return (
          String(l.action || l.log || '').toLowerCase().includes(ql) ||
          String(l.employee_id ?? '').toLowerCase().includes(ql) ||
          (staff.name || '').toLowerCase().includes(ql)
        );
      });
  }, [logs, staffMap, q]);

  return (
    <div className="admin-staff-logs-content">
      <div className="admin-content-header">
        <h2>職員操作紀錄</h2>
        <div className="admin-search-section">
          <input
            className="admin-search-input"
            placeholder="搜尋：職員、編號或內容"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="btn admin-btn admin-primary"
            onClick={fetchData}
            disabled={loading}
            style={{ marginLeft: 8 }}
          >
            {loading ? '讀取中…' : '🔄 刷新資料'}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-danger" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>時間</th>
              <th>職員</th>
              <th>職員信箱</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="admin-empty-row">目前無紀錄</td>
              </tr>
            )}
            {filtered.map((l, i) => {
              const time = new Date(l.employee_log_date || l.action_time || l.time || l.created_at || null);
              const timeText = isNaN(time.getTime()) ? (l.employee_log_date || l.action_time || l.time || '-') : time.toLocaleString();
              const sid = String(l.employee_id ?? l.employee ?? '');
              const staff = staffMap[sid] || { name: `#${sid || '未知'}`, email: '' };
              return (
                <tr key={i}>
                  <td>{timeText}</td>
                  <td>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{l.action || l.log || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginBottom: 8, color: "#666" }}>
        顯示 {filtered.length} / {logs.length} 筆
      </div>
    </div>
  );
};

export default StaffLogs;