import React, { useState } from 'react';
import OperationLogger from '../../../backend/operationLogger';
import '../../styles/scss/adminstyle/AdminLogin.scss';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/employee/login', {
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
        
        // 記錄成功登入操作
        try {
          await OperationLogger.log(OperationLogger.ACTIONS.LOGIN, {
            email: formData.email,
            login_time: new Date().toISOString(),
            status: 'success',
            employee_name: data.employee.name,
            employee_id: data.employee.id
          });
          console.log('登入日誌記錄成功');
        } catch (logErr) {
          console.warn('記錄登入日誌失敗:', logErr);
        }
        
        // 執行登入
        onLogin(true);
      } else {
        // 記錄登入失敗操作
        try {
          await OperationLogger.log(OperationLogger.ACTIONS.LOGIN_FAILED, {
            email: formData.email,
            error: data.message,
            login_attempt_time: new Date().toISOString(),
            status: 'failed'
          });
          console.log('登入失敗日誌記錄成功');
        } catch (logErr) {
          console.warn('記錄登入失敗日誌失敗:', logErr);
        }
        
        setError(data.message || '登入失敗');
      }
    } catch (err) {
      console.error('登入請求失敗:', err);
      
      // 記錄網路錯誤
      try {
        await OperationLogger.log(OperationLogger.ACTIONS.LOGIN_FAILED, {
          email: formData.email,
          error: '伺服器錯誤',
          login_attempt_time: new Date().toISOString(),
          status: 'network_error'
        });
      } catch (logErr) {
        console.warn('記錄網路錯誤日誌失敗:', logErr);
      }
      
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