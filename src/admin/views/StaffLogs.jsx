import React, { useEffect, useState, useMemo } from 'react';
import ApiService from '../services/api';

const StaffLogs = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
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
          String(l.log || '').toLowerCase().includes(ql) ||
          String(l.employee_id ?? '').toLowerCase().includes(ql) ||
          (staff.name || '').toLowerCase().includes(ql)
        );
      });
  }, [logs, staffMap, q]);

  return (
    <div>
      <h2>職員操作紀錄</h2>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="搜尋：職員、編號或內容"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <div style={{ minWidth: 120, textAlign: 'right', color: '#666' }}>
          {loading ? '讀取中…' : `${filtered.length} 筆`}
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>時間</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>職員</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>職員信箱</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="4" style={{ padding: 12 }}>目前無紀錄</td></tr>
            )}

            {filtered.map((l, i) => {
              const time = new Date(l.employee_log_date || l.time || l.created_at || null);
              const timeText = isNaN(time.getTime()) ? (l.employee_log_date || l.time || '-') : time.toLocaleString();
              const sid = String(l.employee_id ?? l.employee ?? '');
              const staff = staffMap[sid] || { name: `#${sid || '未知'}`, email: '' };
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 8, verticalAlign: 'top' }}>{timeText}</td>
                  <td style={{ padding: 8, verticalAlign: 'top' }}>{staff.name}</td>
                  <td style={{ padding: 8, verticalAlign: 'top' }}>{staff.email}</td>
                  <td style={{ padding: 8, verticalAlign: 'top' }}>{l.log || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffLogs;