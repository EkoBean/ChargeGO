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
      const res = await fetch(`${import.meta.env.VITE_API_BASE}${apiRoutes.employee}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // 先儲存登入資訊
        localStorage.setItem('adminToken', 'employee_logged_in');
        localStorage.setItem('employeeName', data.employee.name);
        localStorage.setItem('employeeId', data.employee.id);
        localStorage.setItem('loginTime', new Date().toISOString());
        

        // 執行登入
        onLogin(true);
      } else {
        // 記錄登入失敗操作

        
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