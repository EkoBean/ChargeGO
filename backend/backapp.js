import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import ejs from "ejs";
import mysql from "mysql";
import path from "path";
import { fileURLToPath } from "url";

// 取得 __dirname 替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 以 body-parser 模組協助 Express 解析表單與JSON資料
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 設置靜態檔案目錄
app.use(express.static(__dirname));

// 設置根路由
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'backend.html'));
});

// 以 express-session 管理狀態資訊
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// 指定 esj 為 Express 的畫面處理引擎
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'view'));

// 一切就緒，開始接受用戶端連線
app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");


// 建立資料庫連線 - 改用連線池管理連線
const pool = mysql.createPool({
    host: '127.0.0.1', //localhost
    port: 3306,
    user: 'root',
    password: '',
    database: 'charger_database', // ← 修改這裡
    // 等DB建好就更改database名稱
    connectionLimit: 10, // 最大連線數
    waitForConnections: true // 等待連線
});

// 測試資料庫連線
pool.getConnection(function (err, connection) {
    if (err) {
        console.log('資料庫連線失敗: ');
        console.log(JSON.stringify(err));
        if (connection) connection.release();
        return;
    }
    console.log('成功連接到 backend 資料庫');
    connection.release();
});

// 查詢所有 user
app.get("/api/user", function (request, response) {
    pool.query(
        'SELECT uid, user_name, telephone, email, password, address, blacklist, wallet, point, total_carbon_footprint, credit_card_number, credit_card_date FROM user',
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫查詢錯誤');
                return;
            }
            response.json(rows);
        }
    );
});

// 新增 user
app.post("/api/user", function (request, response) {
    pool.query(
        "INSERT INTO user SET user_name = ?, telephone = ?, email = ?, password = ?, address = ?, blacklist = ?, wallet = ?, point = ?, total_carbon_footprint = ?, credit_card_number = ?, credit_card_date = ?",
        [
            request.body.user_name,
            request.body.telephone,
            request.body.email,
            request.body.password,
            request.body.address,
            request.body.blacklist || 0,
            request.body.wallet || 0,
            request.body.point || 0,
            request.body.total_carbon_footprint || 0,
            request.body.credit_card_number,
            request.body.credit_card_date
        ],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫新增錯誤');
                return;
            }
            response.json({
                uid: result.insertId,
                ...request.body,
                message: "使用者新增成功"
            });
        }
    );
});

// 更新 user
app.put("/api/user/:uid", function (request, response) {
    pool.query(
        "UPDATE user SET user_name = ?, telephone = ?, email = ?, password = ?, address = ?, blacklist = ?, wallet = ?, point = ?, total_carbon_footprint = ?, credit_card_number = ?, credit_card_date = ? WHERE uid = ?",
        [
            request.body.user_name,
            request.body.telephone,
            request.body.email,
            request.body.password,
            request.body.address,
            request.body.blacklist,
            request.body.wallet,
            request.body.point,
            request.body.total_carbon_footprint,
            request.body.credit_card_number,
            request.body.credit_card_date,
            request.params.uid
        ],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫更新錯誤');
                return;
            }
            if (result.affectedRows === 0) {
                response.status(404).send('找不到該使用者');
                return;
            }
            response.json({
                uid: parseInt(request.params.uid),
                ...request.body,
                message: "使用者更新成功"
            });
        }
    );
});

// 刪除 user
app.delete("/api/user/:uid", function (request, response) {
    pool.query(
        "DELETE FROM user WHERE uid = ?",
        [request.params.uid],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫刪除錯誤');
                return;
            }
            if (result.affectedRows === 0) {
                response.status(404).send('找不到該使用者');
                return;
            }
            response.json({
                message: "使用者刪除成功"
            });
        }
    );
});

// 註冊 API
app.post("/api/register", function (req, res) {
    const {
        user_name,
        telephone,
        email,
        password,
        address,
        credit_card_number,
        credit_card_date
    } = req.body;

    pool.query(
        "INSERT INTO user SET user_name = ?, telephone = ?, email = ?, password = ?, address = ?, blacklist = 0, wallet = 0, point = 0, total_carbon_footprint = 0, credit_card_number = ?, credit_card_date = ?",
        [
            user_name,
            telephone,
            email,
            password,
            address,
            credit_card_number,
            credit_card_date
        ],
        function (err, result) {
            if (err) {
                res.status(500).json({ message: "註冊失敗", error: err });
                return;
            }
            res.json({
                uid: result.insertId,
                user_name,
                telephone,
                email,
                address,
                message: "註冊成功"
            });
        }
    );
});

// 登入 API
app.post("/api/login", function (req, res) {
    const { email, password } = req.body;
    pool.query(
        "SELECT * FROM user WHERE email = ? AND password = ?",
        [email, password],
        function (err, rows) {
            if (err) {
                res.status(500).json({ message: "登入失敗", error: err });
                return;
            }
            if (rows.length === 0) {
                res.status(401).json({ message: "帳號或密碼錯誤" });
                return;
            }
            // 可根據需求設定 session
            req.session.user = rows[0];
            res.json({
                message: "登入成功",
                user: rows[0]
            });
        }
    );
});

