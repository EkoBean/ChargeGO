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
  res.send("API ponit is running and ready to go!");
});
//檢查用戶點數餘額是否足夠
// 取得某個使用者的點數
app.get("/checkpoints/:uid", async (req, res) => {
  try {
    // 從 URL params 拿 uid
    const { uid } = req.params;

    // 查詢資料庫
    const [rows] = await pool.query("SELECT point FROM `user` WHERE uid = ?", [
      uid,
    ]);
    console.log(rows);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 回傳點數
    res.json({
      uid,
      point: rows.point,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log("資料庫連線池已建立。");
});
