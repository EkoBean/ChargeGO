import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

//建立活動表單
const CreateEventModal = ({ onClose, onSuccess }) => {
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_content: '',
    site_id: '',
    event_start_date: '',
    event_end_date: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState([]); // 新增：存儲站點列表


  // 新增：組件加載時獲取站點列表
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await ApiService.getSites();
        setSites(sitesData);
      } catch (err) {
        console.error('獲取站點列表失敗:', err);
        // 可以選擇顯示錯誤訊息或使用預設值
      }
    };
    fetchSites();
  }, []);

  // 處理表單變更
  const handleChange = e => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // 提交新活動
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const employeeId = localStorage.getItem('employeeId');
      console.log('當前操作員工ID:', employeeId);

      // 驗證日期
      const startDate = new Date(newEvent.event_start_date);
      const endDate = new Date(newEvent.event_end_date);
      
      if (endDate < startDate) {
        throw new Error('結束時間不能早於開始時間');
      }

      // 整合活動資料和操作者ID
      const eventData = {
        ...newEvent,
        operator_id: parseInt(employeeId, 10)
      };

      console.log('準備提交活動資料:', eventData);
      
      const result = await ApiService.createEvent(eventData);
      console.log('活動建立結果:', result);
      
      if (result.success) {
        onSuccess?.(`活動 "${newEvent.event_title}" 已成功建立！`);
        onClose();
      } else {
        throw new Error(result.message || '建立活動失敗');
      }
    } catch (err) {
      console.error('建立活動失敗:', err);
      setError(err.message || '建立活動失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>建立活動</h3>
          <div>
            <button 
              className="btn admin-btn admin-small" 
              onClick={() => !saving && onClose()}
              disabled={saving}
            >
              取消
            </button>
            <button 
              type="submit"
              form="create-event-form"
              className="btn admin-btn admin-small admin-primary"
              disabled={saving}
            >
              {saving ? "建立中..." : "建立活動"}
            </button>
            <button 
              className="admin-close-btn" 
              onClick={() => !saving && onClose()}
              disabled={saving}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="admin-modal-body">
          <div className="admin-order-details">
            <form id="create-event-form" onSubmit={handleSubmit}>
              <div className="admin-detail-section">
                <h4>活動資訊</h4>
                <div className="admin-form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr',
                  gap: '20px' 
                }}>
                  {/* 活動標題 */}
                  <div className="admin-form-group">
                    <label>活動標題 <span className="admin-required">*</span></label>
                    <input 
                      name="event_title" 
                      value={newEvent.event_title} 
                      onChange={handleChange} 
                      required
                      placeholder="請輸入活動標題"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%',
                        fontSize: '15px',
                        color: '#34495e'
                      }}
                    />
                  </div>
                  
                  {/* 活動內容 */}
                  <div className="admin-form-group">
                    <label>活動內容 <span className="admin-required">*</span></label>
                    <textarea 
                      name="event_content" 
                      value={newEvent.event_content} 
                      onChange={handleChange} 
                      required
                      placeholder="請輸入活動詳細內容"
                      rows={4}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        background: '#fff',
                        width: '100%',
                        fontSize: '15px',
                        color: '#34495e',
                        resize: 'vertical',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>
                  
                  {/* 站點選擇 - 下拉選單 */}
                  <div className="admin-form-group">
                    <label>站點</label>
                    <select 
                      name="site_id" 
                      value={newEvent.site_id} 
                      onChange={handleChange} 
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%',
                        fontSize: '15px',
                        color: '#34495e'
                      }}
                    >
                      <option value="">全部站點</option>
                      {sites.map(site => (
                        <option key={site.site_id} value={site.site_id}>
                          {`${site.site_id} ${site.site_name} \n\n (${site.country}${site.address})`}
                        </option>
                      ))}
                    </select>
                    <small className="admin-input-hint">
                      選擇「全部站點」將套用至所有站點
                    </small>
                  </div>
                </div>
              </div>

              <div className="admin-detail-section">
                <h4>時間設定</h4>
                <div className="admin-form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px' 
                }}>
                  {/* 開始時間 */}
                  <div className="admin-form-group">
                    <label>開始時間 <span className="admin-required">*</span></label>
                    <input 
                      name="event_start_date" 
                      type="date"
                      value={newEvent.event_start_date} 
                      onChange={handleChange} 
                      required
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%',
                        fontSize: '15px',
                        color: '#34495e'
                      }}
                    />
                  </div>
                  
                  {/* 結束時間 */}
                  <div className="admin-form-group">
                    <label>結束時間 <span className="admin-required">*</span></label>
                    <input 
                      name="event_end_date" 
                      type="date"
                      value={newEvent.event_end_date} 
                      onChange={handleChange} 
                      required
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        background: '#fff',
                        width: '100%',
                        fontSize: '15px',
                        color: '#34495e'
                      }}
                    />
                  </div>
                </div>
                
                <small className="admin-input-hint">
                  請確保結束時間晚於開始時間
                </small>
              </div>

              {/* 錯誤訊息 */}
              {error && (
                <div className="admin-detail-section">
                  <div className="admin-form-error" style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8d7da',
                    borderRadius: '8px',
                    border: '1px solid #f5c6cb',
                    color: '#721c24',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ⚠️ {error}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;