var express = require("express");
var cors = require("cors");
var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "abuser",
  password: "",
  database: "charger_database",
});

connection.connect(function (err) {
  if (err) {
    console.log(JSON.stringify(err));
    return;
  }
  connection.query("SELECT * FROM user", function (err, rows) {
    if (err) {
      console.log("資料表查詢失敗：" + JSON.stringify(err));
    } else {
      console.log("資料表查詢成功，筆數：");
    }
  });
});
// 正確範例：res 存在於路由處理函式中
app.get("/your-api-path", (req, res) => {
  // res 在這裡可用
  connection.query("SELECT * FROM user", (err, rows) => {
    if (err) {
      // 處理錯誤
      return res.status(500).send("資料庫查詢失敗" + err);
    }
    res.json(rows); // 這裡可以安全地使用 res
  });
});

app.get("/user/list", (req, res) => {
  connection.query("SELECT * FROM user", (err, rows) => {
    if (err) {
      return res.status(500).send("資料庫查詢失敗" + err);
    }
    res.json(rows);
  });
});

