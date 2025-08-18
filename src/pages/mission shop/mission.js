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
app.get("/mission/:user_id/:date", function (req, res) {
  const userId = req.params.user_id;
  const filterDate = req.params.date;

  const query = `
    SELECT
      um.user_mission_id,
      m.title,
      m.description,
      m.reward_points,
      um.is_completed,
      um.is_claimed,
      um.current_progress,
      m.target_value,
      m.mission_start_date,
      m.mission_end_date
    FROM
      user_missions AS um
    INNER JOIN
      missions AS m ON um.mission_id = m.mission_id
    WHERE
      um.user_id = ?
      AND
      (      (m.mission_start_date <= ? AND m.mission_end_date >= ?)
        OR
        (m.mission_start_date <= ? AND m.mission_end_date IS NULL)
)
  `;
  // 執行 SQL 查詢
  conn.query(
    query,
    [userId, filterDate, filterDate, filterDate],
    (err, results) => {
      // 檢查查詢是否有錯誤
      if (err) {
        console.error("執行查詢時發生錯誤:", err);
        // 回傳 500 內部伺服器錯誤
        res.status(500).json({ error: "無法從資料庫獲取任務資料" });
        return;
      }

      // 成功回傳篩選後的資料
      res.json(results);
    }
  );
});
app.get("/usermission", function (req, res) {
  conn.query("select * from user_missions", [], function (err, rows) {
    res.send(JSON.stringify(rows));
  });
});
// 伺服器啟動
app.listen(4000, () => {
  console.log("API server running on port 4000");
});
