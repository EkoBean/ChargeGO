import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import ApiService from '../../services/api';

// 建立訂單表單
const CreateOrderModal = ({
  editOrder,
  saving,
  sites,
  siteChargers,
  onCancel,
  onSave,
  onChange,
  onClose,
}) => {
  const [localSiteChargers, setLocalSiteChargers] = useState(siteChargers || []);
  const [chargerLoading, setChargerLoading] = useState(false);
  const [chargerError, setChargerError] = useState(null);

  // 修正充電器狀態判斷邏輯
  const normalizeChargerStatus = (charger) => {
    // 根據 charger.status 轉換成更可讀的狀態
    let text = "未知狀態";
    let disabled = false;
    
    // 檢查是否被租借中
    if (charger.is_rented && charger.current_renter) {
      text = `被租借中 (${charger.current_renter})`;
      disabled = true;
    } else {
      // 如果沒被租借，則根據狀態顯示
      switch (charger.status) {
        case "0":
          text = "未啟用";
          disabled = true;
          break;
        case "1":
          text = "可使用";
          disabled = false;
          break;
        case "2":
          text = "充電中";
          disabled = false;
          break;
        case "3":
          text = "充電完成";
          disabled = false;
          break;
        case "4":
          text = "異常";
          disabled = true;
          break;
        case "-1":
          text = "報修中";
          disabled = true;
          break;
        default:
          disabled = true;
      }
    }
    
    return { text, disabled };
  };

  // 修正驗證函數 - 根據訂單狀態動態驗證
  const validateForm = () => {
    // 如果沒有 editOrder，無法驗證
    if (!editOrder) return false;

    // 必填欄位驗證
    const requiredCommonFields = [
      'uid',
      'start_date',
      'rental_site_id',
      'charger_id',
    ];
    
    // 檢查必填欄位是否都有值
    const commonFieldsValid = requiredCommonFields.every(
      field => editOrder[field] !== undefined && editOrder[field] !== ""
    );
    
    // 若訂單狀態是已完成或取消，則需檢查歸還相關欄位
    const needReturnFields = editOrder.order_status === "1" || editOrder.order_status === "-1";
    
    if (needReturnFields) {
      return commonFieldsValid && 
        editOrder.return_site_id !== undefined && 
        editOrder.return_site_id !== "" &&
        editOrder.end !== undefined && 
        editOrder.end !== "";
    }
    
    return commonFieldsValid;
  };

  // 判斷是否需要顯示歸還相關欄位
  const needReturnFields = editOrder?.order_status === "1" || editOrder?.order_status === "-1";
  
  // 當站點變更時載入充電器
  useEffect(() => {
    const siteId = editOrder?.rental_site_id;
    if (!siteId) {
      setLocalSiteChargers([]);
      return;
    }
    
    setChargerLoading(true);
    setChargerError(null);
    
    ApiService.getSiteChargers(siteId)
      .then(chargers => {
        console.log('站點充電器載入成功:', chargers);
        
        // 過濾重複的 charger_id，保留第一個出現的
        const uniqueChargers = [];
        const seenIds = new Set();
        
        chargers.forEach(charger => {
          if (!seenIds.has(charger.charger_id)) {
            seenIds.add(charger.charger_id);
            uniqueChargers.push(charger);
          }
        });
        
        setLocalSiteChargers(uniqueChargers);
        setChargerLoading(false);
      })
      .catch(error => {
        console.error('載入站點充電器失敗:', error);
        setChargerError('無法載入站點充電器');
        setLocalSiteChargers([]);
        setChargerLoading(false);
      });
  }, [editOrder?.rental_site_id]);
  
  // 處理站點變更事件
  const handleSiteChange = (e) => {
    const { name, value } = e.target;
    
    // 清空選定的充電器，避免無效選擇
    if (name === 'rental_site_id') {
      if (onChange) {
        onChange({
          target: { name, value }
        });
        onChange({
          target: { name: 'charger_id', value: '' }
        });
      }
    } else {
      if (onChange) onChange(e);
    }
  };

  // 儲存後：呼叫 onSave 並記錄操作日誌（CREATE_ORDER）
  const handleSave = async () => {
    try {
      // 期待 onSave 回傳新訂單或 server 回應 (含 id 或 order_id)
      const result = await onSave?.();

      // 取得訂單 ID（優先使用 onSave 回傳，否則使用 editOrder）
      const orderId = result?.order_id || result?.id || editOrder?.order_id || editOrder?.id;

      if (orderId) {
        // 已移除 OperationLogger：以 console 替代或改為呼叫後端日誌 API
        console.log('CREATE_ORDER', orderId);
      }
    } catch (err) {
      // onSave 本身失敗，讓呼叫端處理錯誤
      console.error('儲存訂單或建立日誌時發生錯誤:', err);
    }
  };
  
  return (
    <Modal show={true} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>新增租借訂單</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              {/* 用戶ID */}
              <div className="admin-form-group">
                <label>用戶ID <span className="admin-required">*</span></label>
                <input
                  type="number"
                  name="uid"
                  value={editOrder?.uid || ""}
                  onChange={onChange}
                  placeholder="請輸入用戶ID"
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38,
                    background: '#fff'
                  }}
                />
              </div>
              
              {/* 顯示用戶姓名 (不可編輯) */}
              <div className="admin-form-group">
                <label>用戶姓名</label>
                <input
                  type="text"
                  value={editOrder?.user_name || ""}
                  disabled
                  placeholder={editOrder?.uid ? "找不到用戶" : "輸入用戶ID自動帶入"}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    minHeight: 38,
                    background: '#f9f9f9'
                  }}
                />
              </div>
              
              {/* 訂單狀態 */}
              <div className="admin-form-group">
                <label>訂單狀態 <span className="admin-required">*</span></label>
                <select
                  name="order_status"
                  value={editOrder?.order_status || "0"}
                  onChange={onChange}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38,
                    width: '100%'
                  }}
                >
                  <option value="0">進行中</option>
                  <option value="1">已完成</option>
                  <option value="-1">已取消</option>
                  <option value="2">其他狀態</option> {/* 修改為唯一值 */}
                </select>
              </div>

              {/* 訂單金額 */}
              <div className="admin-form-group">
                <label>總金額</label>
                <input
                  type="number"
                  name="total_amount"
                  value={editOrder?.total_amount || 0}
                  onChange={onChange}
                  placeholder="0"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38
                  }}
                />
              </div>
            </Col>

            <Col md={6}>
              {/* 租借站點 */}
              <div className="admin-form-group">
                <label>租借站點 <span className="admin-required">*</span></label>
                <select
                  name="rental_site_id"
                  value={editOrder?.rental_site_id || ""}
                  onChange={handleSiteChange}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38,
                    width: '100%'
                  }}
                >
                  <option value="">請選擇租借站點</option>
                  {sites.map((site) => (
                    <option key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 充電器選擇 */}
              <div className="admin-form-group">
                <label>充電器 <span className="admin-required">*</span></label>
                <select
                  name="charger_id"
                  value={editOrder?.charger_id || ""}
                  onChange={onChange}
                  disabled={chargerLoading || !editOrder?.rental_site_id}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38,
                    width: '100%'
                  }}
                >
                  <option value="">請選擇充電器</option>
                  {chargerLoading ? (
                    <option value="" disabled>載入中...</option>
                  ) : (
                    localSiteChargers.map((charger, index) => {
                      const status = normalizeChargerStatus(charger);
                      return (
                        <option 
                          key={`${charger.charger_id}-${index}`}
                          value={charger.charger_id}
                          disabled={status.disabled}
                        >
                          {charger.charger_id} - {status.text}
                          {charger.is_rented && charger.current_renter ? 
                            ` (${charger.current_renter} 租借中)` : ''}
                        </option>
                      );
                    })
                  )}
                </select>
                {chargerError && <div className="text-danger small">{chargerError}</div>}
                
                {/* 電量低警告 */}
                {editOrder?.charger_id && localSiteChargers.some(c => 
                  c.charger_id === editOrder.charger_id && 
                  normalizeChargerStatus(c).warning
                ) && (
                  <Alert variant="warning" className="mt-2 py-2 small">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {localSiteChargers.find(c => c.charger_id === editOrder.charger_id) && 
                     normalizeChargerStatus(localSiteChargers.find(c => c.charger_id === editOrder.charger_id)).warning}
                  </Alert>
                )}
              </div>

              {/* 租借時間 */}
              <div className="admin-form-group">
                <label>租借時間 <span className="admin-required">*</span></label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={editOrder?.start_date ? editOrder.start_date.substring(0, 16) : ""}
                  onChange={onChange}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e3e8ee',
                    minHeight: 38,
                    width: '100%'
                  }}
                />
              </div>

              {/* 若是已完成或已取消，顯示歸還欄位 */}
              {needReturnFields && (
                <>
                  {/* 歸還站點 */}
                  <div className="admin-form-group">
                    <label>歸還站點 <span className="admin-required">*</span></label>
                    <select
                      name="return_site_id"
                      value={editOrder?.return_site_id || ""}
                      onChange={onChange}
                      required={needReturnFields}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        width: '100%'
                      }}
                    >
                      <option value="">請選擇歸還站點</option>
                      {sites.map((site) => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 歸還時間 */}
                  <div className="admin-form-group">
                    <label>歸還時間 <span className="admin-required">*</span></label>
                    <input
                      type="datetime-local"
                      name="end"
                      value={editOrder?.end ? editOrder.end.substring(0, 16) : ""}
                      onChange={onChange}
                      required={needReturnFields}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3e8ee',
                        minHeight: 38,
                        width: '100%'
                      }}
                    />
                  </div>
                </>
              )}
            </Col>
          </Row>

          {/* 備註 */}
          <div className="admin-form-group">
            <label>備註</label>
            <textarea
              name="comment"
              value={editOrder?.comment || ""}
              onChange={onChange}
              rows={3}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e3e8ee',
                width: '100%'
              }}
            />
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          取消
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={saving || !validateForm()}
        >
          {saving ? '儲存中...' : '儲存'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrderModal;