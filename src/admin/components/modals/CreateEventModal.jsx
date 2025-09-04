import React, { useState } from 'react';
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
      // 修正：使用 ApiService.createEvent 而不是直接呼叫 request
      await ApiService.createEvent(newEvent);
      
      // 重設表單並通知父組件成功
      setNewEvent({
        event_title: '',
        event_content: '',
        site_id: '',
        event_start_date: '',
        event_end_date: ''
      });
      onSuccess('活動已成功建立！');
    } catch (err) {
      setError(err.message || '建立活動失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>建立活動</h3>
          <div>
            <button 
              className="btn small" 
              onClick={() => !saving && onClose()}
              disabled={saving}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '2px solid #6c757d',
                backgroundColor: '#fff',
                color: '#6c757d',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginRight: '8px'
              }}
            >
              取消
            </button>
            <button 
              type="submit"
              form="create-event-form"
              className="btn small primary"
              disabled={saving}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '2px solid #28a745',
                backgroundColor: saving ? '#6c757d' : '#28a745',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginRight: '8px'
              }}
            >
              {saving ? "建立中..." : "建立活動"}
            </button>
            <button 
              className="close-btn" 
              onClick={() => !saving && onClose()}
              disabled={saving}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="order-details">
            <form id="create-event-form" onSubmit={handleSubmit}>
              <div className="detail-section">
                <h4>活動資訊</h4>
                <div className="form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr',
                  gap: '20px' 
                }}>
                  {/* 活動標題 */}
                  <div className="form-group">
                    <label>活動標題 <span style={{ color: '#dc3545' }}>*</span></label>
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
                  <div className="form-group">
                    <label>活動內容 <span style={{ color: '#dc3545' }}>*</span></label>
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
                  
                  {/* 站點編號 */}
                  <div className="form-group">
                    <label>站點編號</label>
                    <input 
                      name="site_id" 
                      value={newEvent.site_id} 
                      onChange={handleChange} 
                      placeholder="留空代表全部站點"
                      type="number"
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
                    <small style={{ 
                      color: '#6c757d', 
                      fontSize: '12px', 
                      display: 'block', 
                      marginTop: '4px'
                    }}>
                      留空將套用至全部站點
                    </small>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>時間設定</h4>
                <div className="form-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px' 
                }}>
                  {/* 開始時間 */}
                  <div className="form-group">
                    <label>開始時間 <span style={{ color: '#dc3545' }}>*</span></label>
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
                  <div className="form-group">
                    <label>結束時間 <span style={{ color: '#dc3545' }}>*</span></label>
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
                
                <small style={{ 
                  color: '#6c757d', 
                  fontSize: '12px', 
                  display: 'block', 
                  marginTop: '8px'
                }}>
                  請確保結束時間晚於開始時間
                </small>
              </div>

              {/* 錯誤訊息 */}
              {error && (
                <div className="detail-section">
                  <div 
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8d7da',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb',
                      color: '#721c24',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
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