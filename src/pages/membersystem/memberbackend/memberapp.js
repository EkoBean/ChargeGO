const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

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

// 伺服器啟動
app.listen(3000, () => {
    console.log('API server running on port 3000');
});