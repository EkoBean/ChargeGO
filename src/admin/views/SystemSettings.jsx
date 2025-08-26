import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAdminData } from '../context/AdminDataContext';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

// 系統設定頁面元件
const SystemSettings = () => {
  const { loading, error, loadAllData } = useAdminData();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '行動電源租借系統', // 系統名稱
    contactEmail: '',            // 聯絡信箱
    contactPhone: '',            // 聯絡電話
    maintenanceMode: false,      // 維護模式開關
    chargingRate: 0,             // 充電費率
    minBalance: 0                 // 最低儲值金額
  });
  const [loadingSettings, setLoadingSettings] = useState(true);  // 載入狀態
  const [saving, setSaving] = useState(false);  // 儲存狀態
  const [errorMsg, setError] = useState(null);    // 錯誤訊息
  const [success, setSuccess] = useState(false); // 成功訊息

  // 元件掛載時自動載入系統設定
  useEffect(() => {
    loadSettings();
  }, []);

  // 從 API 載入系統設定
  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await ApiService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      setError('載入設定失敗');
    } finally {
      setLoadingSettings(false);
    }
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ApiService.updateSystemSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  // 處理表單欄位變更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = () => {
    // 模擬設定儲存
    setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  if (loadingSettings) {
    return <LoadingScreen />;
  }

  if (errorMsg) {
    return <ErrorScreen message={errorMsg} onRetry={loadSettings} />;
  }

  return (
    <AdminLayout>
      <div className="settings-content">
        <div className="content-header">
          <h2>系統設定</h2>
        </div>

        <div className="settings-container">
          {/* 基本設定區塊 */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">基本設定</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>系統名稱</Form.Label>
                    <Form.Control
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>聯絡信箱</Form.Label>
                    <Form.Control
                      name="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 收費設定區塊 */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">收費設定</h4>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>充電費率 (元/小時)</Form.Label>
                    <Form.Control
                      name="chargingRate"
                      type="number"
                      min="0"
                      value={settings.chargingRate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>最低儲值金額</Form.Label>
                    <Form.Control
                      name="minBalance"
                      type="number"
                      min="0"
                      value={settings.minBalance}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 系統維護區塊 */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">系統維護</h4>
              <Form.Group className="mb-3">
                <Form.Label className="checkbox">
                  <Form.Check
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    label="維護模式"
                  />
                </Form.Label>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>維護訊息</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={handleChange}
                  placeholder="系統維護中，請稍後再試..."
                />
              </Form.Group>

              <Button variant="warning" onClick={() => {}}>
                清除系統快取
              </Button>
            </Card.Body>
          </Card>

          {/* 儲存按鈕 */}
          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? '儲存中...' : '儲存設定'}
            </Button>
            {saved && <span className="save-success">設定已儲存！</span>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
