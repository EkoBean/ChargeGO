// 以 Express 建立 Web 伺服器
var express = require("express");
var app = express();

// 以 body-parser 模組協助 Express 解析表單與JSON資料
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 設置靜態檔案目錄
app.use(express.static(__dirname));

// 設置根路由
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/backend.html');
});

// 以 express-session 管理狀態資訊
var session = require('express-session');
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// 指定 esj 為 Express 的畫面處理引擎
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/view');

// 一切就緒，開始接受用戶端連線
app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");


// 建立資料庫連線 - 改用連線池管理連線
var mysql = require('mysql');
var pool = mysql.createPool({
    host: '127.0.0.1', //localhost
    port: 3306,
    user: 'root',
    password: '',
    database: 'backend',
    connectionLimit: 10, // 最大連線數
    waitForConnections: true // 等待連線
});

// 測試資料庫連線
pool.getConnection(function(err, connection) {
    if (err) {
        console.log('資料庫連線失敗: ');
        console.log(JSON.stringify(err));
        if (connection) connection.release();
        return;
    }
    console.log('成功連接到 backend 資料庫');
    connection.release();
});

// 查詢所有 client
app.get("/api/client", function (request, response) {
    pool.query('SELECT cid, cname, cacct, cpwd FROM client', function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            response.status(500).send('資料庫查詢錯誤');
            return;
        }
        response.json(rows);
    });
});

// 新增 client
app.post("/api/client", function (request, response) {
    pool.query(
        "INSERT INTO client SET cname = ?, cacct = ?, cpwd = ?",
        [request.body.name, request.body.account, request.body.password],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫新增錯誤');
                return;
            }
            response.json({ 
                cid: result.insertId,
                cname: request.body.name,
                cacct: request.body.account,
                cpwd: request.body.password,
                message: "客戶新增成功" 
            });
        }
    );
});

// 更新 client
app.put("/api/client/:cid", function (request, response) {
    pool.query(
        "UPDATE client SET cname = ?, cacct = ?, cpwd = ? WHERE cid = ?",
        [request.body.name, request.body.account, request.body.password, request.params.cid],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫更新錯誤');
                return;
            }
            
            if (result.affectedRows === 0) {
                response.status(404).send('找不到該客戶');
                return;
            }
            
            response.json({ 
                cid: parseInt(request.params.cid),
                cname: request.body.name,
                cacct: request.body.account,
                cpwd: request.body.password,
                message: "客戶更新成功" 
            });
        }
    );
});

// 刪除 client
app.delete("/api/client/:cid", function (request, response) {
    pool.query(
        "DELETE FROM client WHERE cid = ?",
        [request.params.cid],
        function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫刪除錯誤');
                return;
            }
            
            if (result.affectedRows === 0) {
                response.status(404).send('找不到該客戶');
                return;
            }
            
            response.json({ 
                message: "客戶刪除成功" 
            });
        }
    );
});
        function handleDatabaseError(err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                response.status(500).send('資料庫刪除錯誤');
                return;
            }
            
            if (result.affectedRows === 0) {
                response.status(404).send('找不到該客戶');
                return;
            }
            
            response.json({ 
                message: "客戶刪除成功" 
            });
        }
 
