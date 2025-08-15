import express from 'express';
import mysql from 'mysql';
import cors from 'express'; // 若沒安裝 cors，需執行 npm install cors

const app = express();
app.use(express.json());
app.use(cors()); // 啟用跨域支援

// MySQL 連線設定
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // 請填入你的密碼
    database: 'charger_database'
});

// 測試連線
db.connect(err => {
    if (err) {
        console.error('MySQL 連線失敗:', err);
    } else {
        console.log('MySQL 連線成功');
    }
});

// 取得所有會員資料
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 取得單一會員資料
app.get('/api/user/:uid', (req, res) => {
    db.query('SELECT * FROM user WHERE uid = ?', [req.params.uid], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results[0]);
    });
});

// 取得會員訂單
app.get('/api/user/:uid/orders', (req, res) => {
    db.query('SELECT * FROM order_record WHERE uid = ?', [req.params.uid], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// 註冊會員 API
app.post('/api/register', (req, res) => {
    const {
        user_name,
        telephone,
        email,
        password,
        address,
        credit_card_number,
        credit_card_date
    } = req.body;

    // 預設值
    const blacklist = 0;
    const wallet = 0;
    const point = 0;
    const total_carbon_footprint = 0;

    db.query(
        `INSERT INTO user (user_name, telephone, email, password, address, blacklist, wallet, point, total_carbon_footprint, credit_card_number, credit_card_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_name,
            telephone,
            email,
            password,
            address,
            blacklist,
            wallet,
            point,
            total_carbon_footprint,
            credit_card_number,
            credit_card_date
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true, uid: result.insertId });
        }
    );
});

// 登入 API
app.post('/api/login', (req, res) => {
    const { user_name, password } = req.body;
    
    if (!user_name || !password) {
        return res.status(400).json({ 
            success: false, 
            message: '請提供帳號和密碼' 
        });
    }
    
    db.query(
        'SELECT uid, user_name, email, telephone, address, blacklist, wallet, point, total_carbon_footprint FROM user WHERE user_name = ? AND password = ?',
        [user_name, password],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '帳號或密碼錯誤'
                });
            }
            
            // 不回傳密碼等敏感資訊
            const user = results[0];
            
            // 檢查是否被列入黑名單
            if (user.blacklist === 1) {
                return res.status(403).json({
                    success: false,
                    message: '此帳號已被停用，請聯繫客服'
                });
            }
            
            return res.json({
                success: true,
                message: '登入成功',
                user
            });
        }
    );
});

// 檢查是否登入 API (前端可用來驗證登入狀態)
app.post('/api/check-auth', (req, res) => {
    const { uid } = req.body;
    
    if (!uid) {
        return res.json({ 
            success: false, 
            authenticated: false 
        });
    }
    
    db.query('SELECT uid, user_name FROM user WHERE uid = ?', [uid], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ 
                success: false, 
                authenticated: false 
            });
        }
        
        return res.json({
            success: true,
            authenticated: true,
            user: results[0]
        });
    });
});

app.get('/', (req, res) => {
  res.send('伺服器連線成功！');
});

// 伺服器啟動
app.listen(3000, () => {
    console.log('API server running on port 3000');
});
