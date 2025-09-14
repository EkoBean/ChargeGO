import React, { useState } from 'react';
import ApiService from '../../services/api';
import { apiRoutes } from '../../../components/apiRoutes';

const CreateTaskModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'accumulated_hours',
    reward_points: '',
    target_value: '',
    target_unit: 'Hours',
    mission_start_date: '',
    mission_end_date: ''
  });

  // 任務類型選項（根據資料庫實際數據）
  const taskTypes = [
    { value: 'accumulated_hours', label: '累積時間' },
    { value: 'monthly_rentals', label: '月租借次數' },
    { value: 'daily_task', label: '每日任務' },
    { value: 'weekly_task', label: '每週任務' },
    { value: 'special_event', label: '特殊活動' }
  ];

  // 目標單位選項（根據資料庫實際數據）
  const targetUnits = [
    { value: 'Hours', label: '小時' },
    { value: 'Times', label: '次數' },
    { value: 'Days', label: '天數' },
    { value: 'Points', label: '點數' },
    { value: 'Items', label: '項目' }
  ];

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 表單驗證
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('請輸入任務標題');
      return false;
    }
    if (!formData.description.trim()) {
      setError('請輸入任務描述');
      return false;
    }
    if (!formData.reward_points || formData.reward_points <= 0) {
      setError('請輸入有效的獎勵點數');
      return false;
    }
    if (!formData.target_value || formData.target_value <= 0) {
      setError('請輸入有效的目標數值');
      return false;
    }
    if (formData.mission_start_date && formData.mission_end_date) {
      if (new Date(formData.mission_start_date) >= new Date(formData.mission_end_date)) {
        setError('結束時間必須晚於開始時間');
        return false;
      }
    }
    return true;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 直接使用 ApiService.request，並使用後端期望的欄位名稱
      const response = await ApiService.request(apiRoutes.missions, {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,                    // 後端使用 title
          description: formData.description,        // 後端使用 description  
          type: formData.type,                      // 後端使用 type
          reward_points: parseInt(formData.reward_points),
          target_value: parseInt(formData.target_value),
          target_unit: formData.target_unit,
          mission_start_date: formData.mission_start_date || null,
          mission_end_date: formData.mission_end_date || null
        })
      });

      onSuccess('任務建立成功！');
    } catch (err) {
      console.error('建立任務失敗:', err);
      setError(`建立任務失敗: ${err.message || '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !loading && onClose()}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>建立新任務</h3>
          <button className="admin-close-btn" onClick={() => !loading && onClose()}>
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {error && (
            <div className="admin-alert admin-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 基本資訊區塊 */}
            <div className="admin-detail-section">
              <h4>基本資訊</h4>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="title">任務標題 *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="例：8月租借5次"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="type">任務類型 *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {taskTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="description">任務描述 *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="例：總租借時間5小時"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* 獎勵與目標區塊 */}
            <div className="admin-detail-section">
              <h4>獎勵與目標</h4>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="reward_points">獎勵點數 *</label>
                  <input
                    type="number"
                    id="reward_points"
                    name="reward_points"
                    value={formData.reward_points}
                    onChange={handleInputChange}
                    placeholder="例：100"
                    min="1"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="target_value">目標數值 *</label>
                  <input
                    type="number"
                    id="target_value"
                    name="target_value"
                    value={formData.target_value}
                    onChange={handleInputChange}
                    placeholder="例：5"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="target_unit">目標單位 *</label>
                <select
                  id="target_unit"
                  name="target_unit"
                  value={formData.target_unit}
                  onChange={handleInputChange}
                  required
                >
                  {targetUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 時間設定區塊 */}
            <div className="admin-detail-section">
              <h4>時間設定</h4>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="mission_start_date">開始時間</label>
                  <input
                    type="datetime-local"
                    id="mission_start_date"
                    name="mission_start_date"
                    value={formData.mission_start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="mission_end_date">結束時間</label>
                  <input
                    type="datetime-local"
                    id="mission_end_date"
                    name="mission_end_date"
                    value={formData.mission_end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '8px' }}>
                * 留空表示無時間限制
              </div>
            </div>

            {/* 操作按鈕區塊 */}
            <div className="admin-form-actions">
              <button 
                type="button"
                className="btn admin-btn"
                onClick={() => !loading && onClose()}
                disabled={loading}
              >
                取消
              </button>
              <button 
                type="submit"
                className="btn admin-btn admin-primary"
                disabled={loading}
              >
                {loading ? '建立中...' : '建立任務'}
              </button>
              
              {loading && (
                <span className="admin-save-success">
                  正在建立任務...
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;