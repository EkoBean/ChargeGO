import React from 'react';
import './Login.css';
import NavBarAPP from '../../components/NavBarAPP';
import ChargegoLogo from '../../components/ChargegoLogo/ChargegoLogo';

export default function Login() {
    return (
        <div className="login-bg">
            <img className="lightning" src="./public/lightning.png" alt="" />
            <ChargegoLogo className="mobile-only-logo" />
            <NavBarPhone />
            <div className="login-container">
                <div className="login-form-section">
                    <span
                        className="back-icon mobile-only-back"
                        onClick={() => window.history.back()}
                        title="回到上頁"
                    >
                        ◀︎
                    </span>
                    <div className="mobile-arc-bg">
                        <div className="mobile-arc-content">
                            <h2 className="login-title">會員登入</h2>
                        </div>
                    </div>
                    <form className="login-form">
                        <input type="text" placeholder="帳號" className="login-input" />
                        <input type="password" placeholder="密碼" className="login-input" />
                        <input type="text" placeholder="驗證碼" className="login-input" />
                        <div className="login-forgot">
                            <span>忘記密碼</span>
                        </div>
                        <button type="submit" className="login-btn">登入</button>
                        <button type="button" className="register-btn">註冊</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
