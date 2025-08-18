import express from "express";
import cors from "cors";
import mysql from "mysql";

var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var conn = mysql.createConnection({
  user: "abuser",
  password: "123456",
  host: "localhost",
  port: 3306,
  database: "charger_database",
});
conn.connect(function (err) {
  console.log(err);
});
// 新增一個處理根路徑的路由
app.get("/", (req, res) => {
  res.send("API is running and ready to go!");
});
app.get("/mission", function (req, res) {
  conn.query("select * from missions", [], function (err, rows) {
    res.send(JSON.stringify(rows));
  });
});
app.get("/usermission", function (req, res) {
  conn.query("select * from user_missions", [], function (err, rows) {
    res.send(JSON.stringify(rows));
  });
});
// 伺服器啟動
app.listen(3000, () => {
  console.log("API server running on port 3000");
});
