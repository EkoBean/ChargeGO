import express from 'express';
import cors from 'cors';
import crypto from 'crypto'; 
import session from 'express-session'; 
import cookieParser from 'cookie-parser'; 
import db from './db.js'; // 引入 db.js

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

// 取得會員訂單
app.get('/user/:uid/orders', (req, res) => {
    db.query('SELECT * FROM order_record WHERE uid = ?', [req.params.uid], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 註冊會員 API
app.post('/mber_register', (req, res) => {
    const {
        user_name,
        telephone,
        email,
        password,
        country,
        address,
        credit_card_number,
        credit_card_date
    } = req.body;



    // 檢查 username 或 email 是否重複
    db.query(
        'SELECT user_name, email FROM user WHERE user_name = ? OR email = ?',
        [user_name, email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length > 0) {
                if (results[0].user_name === user_name) {
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

            // 密碼雜湊（10碼）
            const hashed_password = hashPassword(password);

            db.query(
                `INSERT INTO user (user_name, telephone, email, password, country, address, blacklist, wallet, point, total_carbon_footprint, credit_card_number, credit_card_date, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_name,
                    telephone,
                    email,
                    hashed_password, // 存雜湊值
                    country,
                    address,
                    blacklist,
                    wallet,
                    point,
                    total_carbon_footprint,
                    credit_card_number,
                    credit_card_date,
                    status,
                ],
                (err2, result) => {
                    if (err2) return res.status(500).json({ error: err2 });
                    res.json({ success: true, uid: result.insertId });
                }
            );
        }
    );
});

// 登入 API
app.post('/mber_login', (req, res) => {
    const { user_name, password } = req.body;

    db.query(
        'SELECT uid, user_name, status, blacklist, email, telephone, country, address FROM user WHERE user_name = ? AND password = ?',
        [user_name, password],
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
            req.session.user = user;

            return res.json({
                success: true,
                message: '登入成功',
                user
            });
        }
    );
});

// 檢查是否登入 API (前端可用來驗證登入狀態)
app.post('/check-auth', (req, res) => {
    // 直接從 session 取得 user
    if (req.session.user) {
        return res.json({
            success: true,
            authenticated: true,
            user: req.session.user
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

// 伺服器啟動
app.listen(3000, () => {
    console.log('API server running on port 3000');
});

