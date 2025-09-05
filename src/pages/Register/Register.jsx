import React from 'react';
// import './Register.css';
import NavBarPhone from '../../components/NavBarPhone';
import ChargegoLogo from '../../components/ChargegoLogo/ChargegoLogo'; // 修正 import 路徑

export default function Register() {
    return (
        <div className="register-bg">
            <img className="lightning" src="./public/lightning.png" alt="" />
            <ChargegoLogo className="mobile-only-logo" /> {/* 只在手機版顯示 */}
            <NavBarPhone />
            <div className="register-container">
                <div className="register-form-section">
                    <span
                        className="back-icon mobile-only-back"
                        onClick={() => window.history.back()}
                        title="回到上頁"
                    >
                        {/* 可用 emoji 或 SVG */}
                        ◀︎
                    </span>
                    <div className="mobile-arc-bg">
                        <div className="mobile-arc-content">
                            <h2 className="register-title">會員註冊</h2>
                        </div>
                    </div>
                    <form className="register-form">
                        <div className="register-form-row">
                            <div className="register-form-col">
                                <div className="register-input-group">
                                    <input type="text" className="register-input" required />
                                    <span className="register-label">姓名｜</span>
                                </div>
                                <div className="register-input-group">
                                    <input type="text" className="register-input" required />
                                    <span className="register-label">電話｜</span>
                                </div>
                                <div className="register-input-group">
                                    <input type="text" id="email" className="register-input" required />
                                    <span className="register-label">電子郵件｜</span>
                                </div>
                                <div className="register-input-group" id="city-group">
                                    <select id="city" className="register-input" required>
                                        <option value="">請選擇居住縣市</option>
                                        <option value="臺北市">臺北市</option>
                                        <option value="新北市">新北市</option>
                                        <option value="桃園市">桃園市</option>
                                        <option value="臺中市">臺中市</option>
                                        <option value="臺南市">臺南市</option>
                                        <option value="高雄市">高雄市</option>
                                        <option value="基隆市">基隆市</option>
                                        <option value="新竹市">新竹市</option>
                                        <option value="嘉義市">嘉義市</option>
                                        <option value="宜蘭縣">宜蘭縣</option>
                                        <option value="新竹縣">新竹縣</option>
                                        <option value="苗栗縣">苗栗縣</option>
                                        <option value="彰化縣">彰化縣</option>
                                        <option value="南投縣">南投縣</option>
                                        <option value="雲林縣">雲林縣</option>
                                        <option value="嘉義縣">嘉義縣</option>
                                        <option value="屏東縣">屏東縣</option>
                                        <option value="花蓮縣">花蓮縣</option>
                                        <option value="臺東縣">臺東縣</option>
                                    </select>
                                    <span className="register-label">居住縣市｜</span>
                                </div>
                            </div>
                            <div className="register-form-col">
                                <div className="register-input-group">
                                    <input type="text" className="register-input" required />
                                    <span className="register-label">帳號｜</span>
                                </div>
                                <div className="register-input-group">
                                    <input type="text" className="register-input" required />
                                    <span className="register-label">密碼｜</span>
                                </div>
                                <div className="register-input-group">
                                    <input type="text" id="confirm-password" className="register-input" required />
                                    <span className="register-label">確認密碼｜</span>
                                </div>
                                {/* 新增勾選區塊 */}
                                <div className="register-checkbox-group">
                                    <label>
                                        <input type="checkbox" required /> 我同意使用者條款
                                    </label>
                                    <label>
                                        <input type="checkbox" /> 訂閱最新消息
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="correct-btn">確認</button>
                        <button type="button" className="leave-btn">離開</button>
                    </form>
                </div>
            </div>
        </div>
    );
}