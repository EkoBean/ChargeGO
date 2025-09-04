import express from "express";
import cors from "cors";
import mysql from "mysql";
import util from "util";

var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var pool = mysql.createPool({
  user: "abuser",
  password: "123456",
  host: "localhost",
  port: 3306,
  database: "charger_database",
  connectionLimit: 10, // 設定連線池的大小，可以根據你的需求調整
});
// 將連線池的 query 方法轉換成 Promise 版本
// 這樣所有的路由都可以使用 async/await 語法，程式碼更清晰
pool.query = util.promisify(pool.query);
app.get("/", (req, res) => {
  res.send("API shop is running and ready to go!");
});

app.get("/products", async (req, res) => {
  const query = `
 SELECT * FROM coupon_templates;`;
  const results = await pool.query(query);
  res.json(results);
});
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log("資料庫連線池已建立。");
});
