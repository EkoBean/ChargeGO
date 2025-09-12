import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import db from './db.js'; // 引入 db.js
import nodemailer from 'nodemailer';



const app = express();
app.use(express.json());
app.use(cookieParser()); // 新增
app.use(cors({
    origin: 'http://localhost:5173', // 前端網址
    credentials: true // 允許跨域帶 cookie
}));
app.use(session({
    secret: 'your_secret_key', // 請改成安全的字串
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1天
    }
}));

// 密碼雜湊函式（SHA256取前10碼）
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex').slice(0, 10);
}

// 取得所有會員資料
app.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 取得單一會員資料
app.get('/user/:uid', (req, res) => {
    db.query('SELECT * FROM user WHERE uid = ?', [req.params.uid], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results[0]);
    });
});


// 註冊會員 API
app.post('/mber_register', (req, res) => {
    const {
        login_id,
        user_name,
        password, // 已是雜湊值
        email,
        telephone,
        country,
        address,
        credit_card_number, // 信用卡號
        credit_card_month, // MM
        credit_card_year, // YY
        cvv // CVV
    } = req.body;

    // 檢查 login_id 或 email 是否重複
    db.query(
        'SELECT login_id, email FROM user WHERE login_id = ? OR email = ?',
        [login_id, email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length > 0) {
                if (results[0].login_id === login_id) {
                    return res.json({ success: false, message: '帳號已被註冊' });
                }
                if (results[0].email === email) {
                    return res.json({ success: false, message: 'Email已被註冊' });
                }
            }

            // 預設值
            const blacklist = 0;
            const wallet = 0;
            const point = 0;
            const total_carbon_footprint = 0;
            const status = "0";

            // 先新增 user 資料
            db.query(
                `INSERT INTO user (
                    login_id, user_name, telephone, email, password, country, address,
                    blacklist, wallet, point, total_carbon_footprint, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    login_id,
                    user_name,
                    telephone,
                    email,
                    password, // 已是雜湊值
                    country,
                    address,
                    blacklist,
                    wallet,
                    point,
                    total_carbon_footprint,
                    status,
                ],
                (err2, result) => {
                    if (err2) return res.status(500).json({ error: err2 });
                    const uid = result.insertId;
                    // 新增 user_creditcard 資料
                    db.query(
                        `INSERT INTO user_creditcard (uid, user_name, creditcard, CVV, MM, YY) VALUES (?, ?, ?, ?, ?, ?)`,
                        [uid, user_name, credit_card_number, cvv, credit_card_month, credit_card_year],
                        (err3, result2) => {
                            if (err3) return res.status(500).json({ error: err3 });
                            res.json({ success: true, uid });
                        }
                    );
                }
            );
        }
    );
});

// 登入 API
app.post('/mber_login', (req, res) => {
    const { login_id, password } = req.body;
    // 前端已雜湊，直接比對
    db.query(
        'SELECT uid, login_id, user_name, status, blacklist, email, telephone, country, address FROM user WHERE login_id = ? AND password = ?',
        [login_id, password],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '帳號或密碼錯誤'
                });
            }

            const user = results[0];

            if (user.blacklist > 0) {
                return res.status(403).json({
                    success: false,
                    message: '此帳號已被停用，請聯繫客服'
                });
            }

            // 登入成功，將 user 資料存入 session
            req.session.user = user; // session cookie 會自動儲存於瀏覽器

            return res.json({
                success: true,
                message: '登入成功',
                user
            });
        }
    );
});

// 檢查是否登入 API (前端可用來驗證登入狀態，並取得 user 資料)
app.post('/check-auth', (req, res) => {
    // 直接從 session 取得 user
    if (req.session.user) {
        return res.json({
            success: true,
            authenticated: true,
            user: req.session.user // 提供 user 資料給前端
        });
    } else {
        return res.json({
            success: false,
            authenticated: false
        });
    }
});

// 會員停權 API
app.post('/api/user/deactivate', (req, res) => {
    const { user_id, status } = req.body;
    if (!user_id || typeof status === 'undefined') {
        return res.status(400).json({ success: false, message: '缺少 user_id 或 status' });
    }
    // 轉型確保一致
    const uid = Number(user_id);
    const statusStr = String(status);
    db.query(
        'UPDATE user SET status = ? WHERE uid = ?',
        [statusStr, uid],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: '找不到該會員或未更新' });
            }
            // 更新後回傳最新會員資料（只回傳必要欄位）
            db.query('SELECT uid, user_name, status, email, telephone, country, address FROM user WHERE uid = ?', [uid], (err2, results) => {
                if (err2) return res.status(500).json({ success: false, error: err2 });
                // 更新 session user 狀態
                if (req.session.user && req.session.user.uid === uid) {
                    req.session.user.status = statusStr;
                }
                res.json({ success: true, message: '會員已停權', user: results[0] });
            });
        }
    );
});

// 取得會員通知資料
app.get('/user/:uid/notices', (req, res) => {
    const uid = Number(req.params.uid);
    db.query(
        'SELECT * FROM notice WHERE uid = ? ORDER BY notice_date DESC',
        [uid],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

// 取得所有優惠券資料 API
// 前端可用於顯示所有 coupon（直立式排列）
// GET /api/coupons
app.get('/api/coupons', (req, res) => {
    db.query('SELECT * FROM coupon ORDER BY issued_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 取得某會員的優惠券資料
app.get('/user/:uid/coupons', (req, res) => {
    const uid = Number(req.params.uid);
    db.query(
        `SELECT coupon_id, code, description, usage_count, issued_at, expires_at
         FROM coupon
         WHERE user_id = ? AND is_expired = 0 AND status = '0'
         ORDER BY issued_at DESC`,
        [uid],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

app.get('/', (req, res) => {
    res.send('伺服器連線成功！');
});

// 取得目前登入會員的租借紀錄（透過 session）
app.get('/user/:uid/orders', (req, res) => {
    if (!req.session.user || !req.session.user.uid) {
        return res.status(401).json({ success: false, message: '尚未登入' });
    }
    const uid = req.session.user.uid;
    db.query(`SELECT 
        order_ID, uid, start_date, end, total_amount, comment, rental_site_id, return_site_id, order_status, charger_id
        FROM order_record WHERE uid = ?`, [uid], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, orders: results });
    });
});

// 取得目前登入會員的優惠券（透過 session）
app.get('/user/session/coupons', (req, res) => {
    if (!req.session.user || !req.session.user.uid) {
        return res.status(401).json({ success: false, message: '尚未登入' });
    }
    const uid = req.session.user.uid;
    db.query(
        `SELECT coupon_id, code, description, usage_count, issued_at, expires_at
         FROM coupon
         WHERE user_id = ? AND is_expired = 0 AND status = '0'
         ORDER BY issued_at DESC`,
        [uid],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

// 取得會員點數 API
app.get('/user/:uid/points', (req, res) => {
    const uid = Number(req.params.uid);
    db.query('SELECT point FROM user WHERE uid = ?', [uid], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: '找不到會員' });
        res.json({ points: results[0].point });
    });
});

// 會員資料修改 API
app.post('/update-user', (req, res) => {
    const { uid, user_name, telephone, email, country, address } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: '缺少 uid' });
    db.query(
        'UPDATE user SET user_name = ?, telephone = ?, email = ?, country = ?, address = ? WHERE uid = ?',
        [user_name, telephone, email, country, address, uid],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: '找不到該會員或未更新' });
            }
            // 更新 session user 資料
            if (req.session.user && req.session.user.uid === uid) {
                req.session.user.user_name = user_name;
                req.session.user.telephone = telephone;
                req.session.user.email = email;
                req.session.user.country = country;
                req.session.user.address = address;
            }
            res.json({ success: true, message: '會員資料已更新' });
        }
    );
});

// 新增信用卡 API
app.post('/user/add-creditcard', (req, res) => {
    const { userId, user_name, cardNumber, cvv, expMonth, expYear } = req.body;
    if (!userId || !cardNumber || !cvv || !expMonth || !expYear) {
        return res.status(400).json({ success: false, message: '缺少必要欄位' });
    }
    db.query(
        `INSERT INTO user_creditcard (uid, user_name, creditcard, CVV, MM, YY) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, user_name, cardNumber, cvv, expMonth, expYear],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });
            res.json({ success: true });
        }
    );
});

// 發送信箱驗證碼 API
app.post('/api/send-captcha', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: '缺少 email 或 code' });

    db.query('SELECT uid FROM user WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: '資料庫錯誤', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: '查無此Email' });

        const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5分鐘後
        db.query(
            'UPDATE user SET code = ?, code_expire = ? WHERE email = ?',
            [code, expireTime, email],
            async (err2) => {
                if (err2) return res.status(500).json({ message: '更新驗證碼失敗', error: err2.message });
                // 使用 nodemailer 寄送驗證碼
                // gmail 需要開啟「低安全性應用程式存取權」
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'rcsatie112@gmail.com',
                            pass: 'sdkm ehxg fsds phkv'
                        }
                    });
                    await transporter.sendMail({
                        from: 'rcsatie112@gmail.com',
                        to: email,
                        subject: '您的驗證碼',
                        text: `您的驗證碼是：${code}，5分鐘內有效。`
                    });
                    res.json({ message: '驗證碼已寄出' });
                } catch (e) {
                    console.error('Email send error:', e); // 顯示詳細錯誤
                    res.status(500).json({ message: '寄送Email失敗', error: e.message, detail: e });
                }
            });
    });
});

// 重設密碼 API
app.post('/api/reset-password', (req, res) => {
    const { email, newPassword, captcha } = req.body;
    if (!email || !newPassword || !captcha) return res.status(400).json({ message: '缺少 email、newPassword 或 captcha' });

    // 先查詢驗證碼
    db.query('SELECT code, code_expire FROM user WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: '資料庫錯誤', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: '查無此Email' });

        const { code, code_expire } = results[0];
        const now = new Date();
        if (code !== captcha) return res.status(400).json({ message: '驗證碼錯誤' });
        if (now > code_expire) return res.status(400).json({ message: '驗證碼已過期' });

        const hashedPassword = hashPassword(newPassword);
        db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email], (err2, result) => {
            if (err2) return res.status(500).json({ message: '資料庫錯誤', error: err2.message });
            res.json({ message: '密碼已重設' });
        });
    });
});

// 伺服器啟動
app.listen(3000, () => {
    console.log('API server running on port 3000');
});



