import React, { Component } from 'react';

class BackHTML extends Component {
  state = {
    userBadRecords: {
      '001': [
        {
          date: '2024-01-10',
          time: '14:30',
          reason: '行動電源逾期未歸還',
          details: '租借行動電源超過24小時未歸還，系統自動記錄違規',
          location: '台北車站站點',
        },
      ],
      '002': [
        {
          date: '2024-01-05',
          time: '09:15',
          reason: '惡意損壞設備',
          details: '歸還的行動電源外殼破損，充電線被剪斷',
          location: '信義商圈站點',
        },
        {
          date: '2024-01-12',
          time: '16:45',
          reason: '多次逾期未歸還',
          details: '連續3次租借行動電源逾期歸還，累計違規次數達到限制',
          location: '西門町站點',
        },
      ],
      '003': [], // 沒有不良紀錄
    },
    selectedUser: null,
    selectedUserName: '',
    historyContent: null,
    activeSection: 'dashboard', // 新增當前活躍的區塊
    showAddEmployeeModal: false, // 新增員工 Modal 狀態
  };

  checkUserHistory = (userId, userName) => {
    this.setState({
      selectedUser: userId,
      selectedUserName: userName,
      historyContent: (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
          <p>正在查詢歷史紀錄...</p>
        </div>
      ),
    });

    setTimeout(() => {
      this.displayUserHistory(userId);
    }, 1000);
  };

  displayUserHistory = (userId) => {
    const badRecords = this.state.userBadRecords[userId] || [];
    if (badRecords.length === 0) {
      this.setState({
        historyContent: (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle"></i> 該用戶無不良紀錄，使用狀況良好！
          </div>
        ),
      });
    } else {
      const content = (
        <div>
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle"></i> 發現 {badRecords.length} 筆不良紀錄
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>日期時間</th>
                  <th>違規原因</th>
                  <th>詳細說明</th>
                  <th>發生地點</th>
                </tr>
              </thead>
              <tbody>
                {badRecords.map((record, index) => (
                  <tr key={index}>
                    <td>
                      {record.date}
                      <br />
                      <small className="text-muted">{record.time}</small>
                    </td>
                    <td>
                      <span className="badge bg-danger">{record.reason}</span>
                    </td>
                    <td>{record.details}</td>
                    <td>{record.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      this.setState({ historyContent: content });
    }
  };

  // 新增切換區塊的方法
  handleSectionChange = (section, title) => {
    this.setState({ 
      activeSection: section,
      historyContent: null // 關閉用戶歷史Modal
    });
  };

  // 新增處理員工 Modal 的方法
  toggleAddEmployeeModal = () => {
    this.setState(prevState => ({
      showAddEmployeeModal: !prevState.showAddEmployeeModal
    }));
  };

  render() {
    const { activeSection, showAddEmployeeModal } = this.state;

    return (
      <div className="container-fluid">
        {/* 內聯樣式定義 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .nav-link.active {
              background-color: rgba(13, 110, 253, 0.2) !important;
              border-left: 3px solid #0d6efd;
            }
            .nav-link:hover {
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 5px;
            }
          `
        }} />
        
        <div className="row">
          {/* 側邊欄 */}
          <div className="col-md-2 p-0">
            <div className="d-flex flex-column vh-100 bg-dark">
              {/* Logo 區域 */}
              <div className="text-center py-4 border-bottom border-secondary">
                <h4 className="text-white mb-1">
                  <i className="fas fa-headset text-primary"></i> 
                  客服系統
                </h4>
                <small className="text-light">後台管理</small>
              </div>

              {/* 導航選單 */}
              <nav className="nav flex-column p-2">
                <a 
                  className={`nav-link text-light d-flex align-items-center py-3 ${activeSection === 'dashboard' ? 'active' : ''}`}
                  href="#" 
                  onClick={(e) => { e.preventDefault(); this.handleSectionChange('dashboard', '儀表板'); }}
                >
                  <i className="fas fa-tachometer-alt me-3"></i>
                  <span>儀表板</span>
                </a>
                
                <a 
                  className={`nav-link text-light d-flex align-items-center py-3 ${activeSection === 'users' ? 'active' : ''}`}
                  href="#" 
                  onClick={(e) => { e.preventDefault(); this.handleSectionChange('users', '使用者管理'); }}
                >
                  <i className="fas fa-users me-3"></i>
                  <span>使用者管理</span>
                </a>
                
                <a 
                  className={`nav-link text-light d-flex align-items-center py-3 ${activeSection === 'employee-logs' ? 'active' : ''}`}
                  href="#" 
                  onClick={(e) => { e.preventDefault(); this.handleSectionChange('employee-logs', '員工使用紀錄'); }}
                >
                  <i className="fas fa-clipboard-list me-3"></i>
                  <span>員工使用紀錄</span>
                </a>
                
                <a 
                  className={`nav-link text-light d-flex align-items-center py-3 ${activeSection === 'employee-data' ? 'active' : ''}`}
                  href="#" 
                  onClick={(e) => { e.preventDefault(); this.handleSectionChange('employee-data', '員工資料'); }}
                >
                  <i className="fas fa-id-card me-3"></i>
                  <span>員工資料</span>
                </a>
              </nav>

              {/* 登出按鈕 */}
              <div className="mt-auto p-3">
                <button className="btn btn-outline-light w-100">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  登出
                </button>
              </div>
            </div>
          </div>

          {/* 主要內容區 */}
          <div className="col-md-10">
            {/* 頂部導航 */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
              <div className="container-fluid">
                <h2 className="navbar-brand mb-0 h1">
                  {activeSection === 'dashboard' && '儀表板'}
                  {activeSection === 'users' && '使用者管理'}
                  {activeSection === 'employee-logs' && '員工使用紀錄'}
                  {activeSection === 'employee-data' && '員工資料'}
                </h2>
                
                <div className="d-flex align-items-center">
                  {/* 搜尋框 */}
                  <div className="input-group me-3" style={{width: '300px'}}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input type="text" className="form-control border-start-0" placeholder="搜尋..." />
                  </div>
                  
                  {/* 通知 */}
                  <div className="dropdown me-3">
                    <button className="btn btn-light position-relative" type="button">
                      <i className="fas fa-bell"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        3
                      </span>
                    </button>
                  </div>
                  
                  {/* 用戶資訊 */}
                  <div className="dropdown">
                    <button className="btn btn-light d-flex align-items-center" type="button">
                      <i className="fas fa-user-circle me-2"></i>
                      <span>管理員</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* 主要內容 */}
            <div className="p-4">
              {/* 儀表板 */}
              {activeSection === 'dashboard' && (
                <div>
                  {/* 統計卡片 */}
                  <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="card-subtitle text-muted mb-2">總站點數</h6>
                              <h2 className="card-title text-primary mb-0">156</h2>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-3 rounded">
                              <i className="fas fa-map-marker-alt text-primary fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="card-subtitle text-muted mb-2">活躍裝置</h6>
                              <h2 className="card-title text-success mb-0">892</h2>
                            </div>
                            <div className="bg-success bg-opacity-10 p-3 rounded">
                              <i className="fas fa-charging-station text-success fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="card-subtitle text-muted mb-2">今日訂單</h6>
                              <h2 className="card-title text-warning mb-0">234</h2>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-3 rounded">
                              <i className="fas fa-shopping-cart text-warning fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-3 col-md-6 mb-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="card-subtitle text-muted mb-2">註冊用戶</h6>
                              <h2 className="card-title text-info mb-0">12,847</h2>
                            </div>
                            <div className="bg-info bg-opacity-10 p-3 rounded">
                              <i className="fas fa-users text-info fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 最近活動 */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                          <h5 className="card-title mb-0">最近活動</h5>
                          <button className="btn btn-sm btn-outline-primary">查看全部</button>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>時間</th>
                                  <th>用戶</th>
                                  <th>活動</th>
                                  <th>狀態</th>
                                  <th>操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>2024-01-15 14:30</td>
                                  <td>張小明</td>
                                  <td>租借行動電源</td>
                                  <td><span className="badge bg-success">成功</span></td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">
                                      <i className="fas fa-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>2024-01-15 14:25</td>
                                  <td>李小華</td>
                                  <td>歸還行動電源</td>
                                  <td><span className="badge bg-success">成功</span></td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">
                                      <i className="fas fa-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>2024-01-15 14:20</td>
                                  <td>王大明</td>
                                  <td>付款失敗</td>
                                  <td><span className="badge bg-danger">失敗</span></td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">
                                      <i className="fas fa-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 使用者管理 */}
              {activeSection === 'users' && (
                <div>
                  <h3>客戶查詢</h3>
                  <form className="row g-3 mb-3">
                    <div className="col-auto">
                      <input type="text" className="form-control" placeholder="輸入客戶名稱或ID" />
                    </div>
                    <div className="col-auto">
                      <button type="submit" className="btn btn-primary mb-3">
                        搜尋
                      </button>
                    </div>
                  </form>

                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>客戶姓名</th>
                          <th>Email</th>
                          <th>電話</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>001</td>
                          <td>王小明</td>
                          <td>ming@example.com</td>
                          <td>0912-345-678</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => this.checkUserHistory('001', '王小明')}
                            >
                              查看詳情
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>002</td>
                          <td>陳美麗</td>
                          <td>mei@example.com</td>
                          <td>0922-888-999</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => this.checkUserHistory('002', '陳美麗')}
                            >
                              查看詳情
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 員工使用紀錄 */}
              {activeSection === 'employee-logs' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">員工使用紀錄</h5>
                    <div className="d-flex gap-2">
                      <div className="input-group" style={{width: '250px'}}>
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                        <input type="text" className="form-control" placeholder="搜尋員工姓名或ID" />
                      </div>
                      <button className="btn btn-outline-primary">
                        <i className="fas fa-filter me-1"></i>篩選
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* 統計卡片 */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card bg-primary text-white">
                          <div className="card-body text-center">
                            <i className="fas fa-users fa-2x mb-2"></i>
                            <h4>24</h4>
                            <small>總員工數</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-success text-white">
                          <div className="card-body text-center">
                            <i className="fas fa-sign-in-alt fa-2x mb-2"></i>
                            <h4>18</h4>
                            <small>今日上線</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-warning text-white">
                          <div className="card-body text-center">
                            <i className="fas fa-clock fa-2x mb-2"></i>
                            <h4>6.5h</h4>
                            <small>平均工時</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-info text-white">
                          <div className="card-body text-center">
                            <i className="fas fa-chart-line fa-2x mb-2"></i>
                            <h4>156</h4>
                            <small>今日操作數</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 使用紀錄表格 */}
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>員工ID</th>
                            <th>員工姓名</th>
                            <th>登入時間</th>
                            <th>登出時間</th>
                            <th>工作時長</th>
                            <th>操作數量</th>
                            <th>狀態</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>EMP001</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{width: '32px', height: '32px'}}>
                                  <span className="text-white fw-bold">張</span>
                                </div>
                                張小明
                              </div>
                            </td>
                            <td>2024-01-15 09:00</td>
                            <td>2024-01-15 18:00</td>
                            <td>
                              <span className="badge bg-success">8h 15m</span>
                            </td>
                            <td>23</td>
                            <td>
                              <span className="badge bg-success">
                                <i className="fas fa-circle me-1" style={{fontSize: '8px'}}></i>在線
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" title="查看詳情">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button className="btn btn-outline-info" title="查看記錄">
                                  <i className="fas fa-history"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 員工資料 */}
              {activeSection === 'employee-data' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">員工資料管理</h5>
                    <div className="d-flex gap-2">
                      <div className="input-group" style={{width: '250px'}}>
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                        <input type="text" className="form-control" placeholder="搜尋員工資料" />
                      </div>
                      <button className="btn btn-primary" onClick={this.toggleAddEmployeeModal}>
                        <i className="fas fa-plus me-1"></i>新增員工
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* 員工統計 */}
                    <div className="row mb-4">
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-users"></i>
                          </div>
                          <h5 className="mb-0">24</h5>
                          <small className="text-muted">總員工</small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-check"></i>
                          </div>
                          <h5 className="mb-0">22</h5>
                          <small className="text-muted">在職</small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-clock"></i>
                          </div>
                          <h5 className="mb-0">1</h5>
                          <small className="text-muted">請假</small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-times"></i>
                          </div>
                          <h5 className="mb-0">1</h5>
                          <small className="text-muted">離職</small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-graduate"></i>
                          </div>
                          <h5 className="mb-0">3</h5>
                          <small className="text-muted">實習生</small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                               style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-tie"></i>
                          </div>
                          <h5 className="mb-0">5</h5>
                          <small className="text-muted">主管</small>
                        </div>
                      </div>
                    </div>

                    {/* 員工資料表格 */}
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>員工編號</th>
                            <th>姓名</th>
                            <th>電子郵件</th>
                            <th>職位</th>
                            <th>部門</th>
                            <th>狀態</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>EMP001</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{width: '32px', height: '32px'}}>
                                  <span className="text-white fw-bold">張</span>
                                </div>
                                <div>
                                  <div className="fw-bold">張小明</div>
                                  <small className="text-muted">客服專員</small>
                                </div>
                              </div>
                            </td>
                            <td>chang.ming@company.com</td>
                            <td>
                              <span className="badge bg-primary">客服專員</span>
                            </td>
                            <td>客戶服務部</td>
                            <td>
                              <span className="badge bg-success">
                                <i className="fas fa-circle me-1" style={{fontSize: '8px'}}></i>在職
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" title="查看資料">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button className="btn btn-outline-success" title="編輯資料">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-outline-warning" title="權限設定">
                                  <i className="fas fa-key"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 用戶歷史紀錄 Modal */}
            {this.state.historyContent && (
              <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        用戶歷史紀錄查詢 - {this.state.selectedUserName}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => this.setState({ historyContent: null })}
                      ></button>
                    </div>
                    <div className="modal-body">{this.state.historyContent}</div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => this.setState({ historyContent: null })}
                      >
                        關閉
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 新增員工 Modal */}
            {showAddEmployeeModal && (
              <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">新增員工</h5>
                      <button type="button" className="btn-close" onClick={this.toggleAddEmployeeModal}></button>
                    </div>
                    <div className="modal-body">
                      <form>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">員工姓名 *</label>
                              <input type="text" className="form-control" required />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">電子郵件 *</label>
                              <input type="email" className="form-control" required />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">職位</label>
                              <select className="form-select">
                                <option value="">請選擇職位</option>
                                <option value="客服專員">客服專員</option>
                                <option value="技術專員">技術專員</option>
                                <option value="系統管理員">系統管理員</option>
                                <option value="主管">主管</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">部門</label>
                              <select className="form-select">
                                <option value="">請選擇部門</option>
                                <option value="客戶服務部">客戶服務部</option>
                                <option value="技術維護部">技術維護部</option>
                                <option value="資訊技術部">資訊技術部</option>
                                <option value="營運部">營運部</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={this.toggleAddEmployeeModal}>取消</button>
                      <button type="button" className="btn btn-primary">儲存員工資料</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default BackHTML;