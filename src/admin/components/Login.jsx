import React, { useState } from 'react';
import '../../styles/scss/adminstyle/AdminLogin.scss';
import { apiRoutes } from '../../components/apiRoutes';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000';
      // 優先使用 apiRoutes.employee，但若它不是 admin 路徑則改為 /api/admin/employee
      let employeeRoute = apiRoutes?.employee || '/api/employee';
      if (!employeeRoute.startsWith('/api/admin')) {
        employeeRoute = '/api/admin/employee';
      }
      const url = `${BASE.replace(/\/$/, '')}${employeeRoute.startsWith('/') ? employeeRoute : '/' + employeeRoute}/login`;

      console.log('POST', url, 'payload', formData);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('response status:', res.status, 'ok:', res.ok);

      const text = await res.text();
      console.log('response text:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Failed to parse JSON response:', parseErr);
        setError('伺服器回應格式錯誤');
        return;
      }

      if (res.ok && data.success) {
        localStorage.setItem('adminToken', 'employee_logged_in');
        localStorage.setItem('employeeName', data.employee.name);
        localStorage.setItem('employeeId', data.employee.id);
        localStorage.setItem('loginTime', new Date().toISOString());
        onLogin(true);
      } else {
        console.warn('LOGIN failed', { email: formData.email, message: data.message, status: res.status });
        setError(data.message || '登入失敗');
      }
    } catch (err) {
      console.error('登入請求失敗:', err);
      setError('伺服器錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>🔋 行動電源租借系統</h2>
          <p>後台管理登入</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">信箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="請輸入員工信箱"
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              required
            />
          </div>
          
          {error && <div className="admin-error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>預設帳號：employee1@gmail.com / 密碼：123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;