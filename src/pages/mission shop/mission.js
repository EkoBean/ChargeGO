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

app.post("/usermission/claim", (req, res) => {
  // 從請求主體中取得 user_mission_id
  const { user_mission_id } = req.body;

  // 檢查 user_mission_id 是否存在
  if (!user_mission_id) {
    return res.status(400).json({ message: "缺少 user_mission_id" });
  }

  // SQL 語句，將指定 user_mission_id 的 is_claimed 狀態更新為 1
  const updateQuery = `UPDATE user_missions SET is_claimed = 1 WHERE user_mission_id = ?`;

  conn.query(updateQuery, [user_mission_id], (err, results) => {
    // 檢查更新是否有錯誤
    if (err) {
      console.error("更新任務狀態時發生錯誤:", err);
      return res.status(500).json({ message: "無法更新任務狀態" });
    }

    // 檢查是否有任何行受到影響
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "找不到指定的任務" });
    }

    // 成功回傳訊息
    res.status(200).json({ message: "任務已成功領取" });
  });
});

// 這是一個 GET 路由，用於手動測試特定使用者在特定日期的任務進度。
app.get("/update/orderrecord/:user_id/:date", async (req, res) => {
  // 從 URL 參數中取得使用者 ID 和篩選日期
  const userId = req.params.user_id;
  const filterDate = req.params.date;
  // console.log(typeof userId);
  // 檢查參數是否存在
  if (!userId || !filterDate) {
    return res.status(400).json({ error: "缺少使用者 ID 或篩選日期" });
  }

  try {
    // 使用傳入的 filterDate 來建立日期物件，以便計算當月範圍
    const now = new Date(filterDate);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfMonthISO = startOfMonth.toISOString();
    const startOfNextMonthISO = startOfNextMonth.toISOString();

    console.log(startOfMonthISO);
    console.log(startOfNextMonthISO);

    const monthlyRentalsData = `
      SELECT COUNT(*) AS count
      FROM order_record
      WHERE uid = ?
      AND start_date > ?
      AND end <= ?
    `;

    console.log("monthlyRentalData: " + monthlyRentalsData);

    // **關鍵改變：使用 await 等待資料庫查詢完成**
    // 這行程式碼會暫停執行，直到資料庫回傳結果為止。
    const results = await conn.query(monthlyRentalsData, [
      userId,
      startOfMonthISO,
      startOfNextMonthISO,
    ]);
    console.log(results);
    // **現在，我們已經在回呼函式外部取得了結果**
    // 這裡的程式碼會在 await 完成後，以同步的方式執行
    const count = results[0].count;

    console.log("本月租賃資料筆數:", count);

    // 在函式結束前，用 count 變數來回傳 JSON 格式的回應
    res.status(200).json({
      message: "查詢成功",
      userId: userId,
      monthlyDataCount: count, // 將正確的 count 值放入 JSON 回應中
    });
  } catch (error) {
    console.error("執行查詢時發生錯誤:", error);
    res.status(500).json({ error: "內部伺服器錯誤" });
    // }
  }
});

// POST /mission/update: 處理任務進度更新的路由
// 這個路由將會接收 user_id，並根據 order_record 計算並更新 user_missions 表中的進度。
app.post("/update", async (req, res) => {
  // 從請求主體中取得使用者 ID
  const { userId, filterDate } = req.body;

  // 檢查 userId 是否存在，這是必要的資料
  if (!userId) {
    res.status(200).json({ message: "任務進度更新成功", userId });
  }
  try {
    // --- 處理「當月租借次數」任務類型 (monthly_rentals) ---
    const now = new Date(filterDate);

    // 計算當月的第一天
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // 計算下個月的第一天，這是最安全的做法，避免時間戳記問題
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    // 轉換成字串
    const startOfMonthISO = startOfMonth.toISOString();
    const startOfNextMonthISO = startOfNextMonth.toISOString();
    console.log(startOfMonthISO);
    console.log(startOfNextMonthISO);

    // 這裡你需要寫一個 SQL 查詢，計算該使用者當月完成的租借次數
    // 假設你的 `order_record` 表有一個 `user_id` 和 `end_date` 欄位
    // 這裡我們用一個變數來模擬查詢結果
    const monthlyRentalsQuery = `
       SELECT COUNT(*) AS count
        FROM order_record
        WHERE uid = ?
        AND end IS NOT NULL
      AND end >= ?
      AND end < ?;
    `;
    const [monthlyResult] = await db.query(monthlyRentalsQuery, [
      userId,
      startOfMonth,
      endOfMonth,
    ]);
    const monthlyRentalCount = mothlyResult; //

    // 更新 user_missions 表中所有 `monthly_rentals` 類型的任務進度
    // const updateMonthlyQuery = `
    //     UPDATE user_missions
    //     SET current_progress = ?
    //     WHERE user_id = ?
    //     AND mission_type = 'monthly_rentals'
    //     AND start_date <= ? AND end_date >= ?
    // `;
    // await db.query(updateMonthlyQuery, [monthlyRentalCount, userId, now, now]);

    // --- 處理「租借總時數」任務類型 (total_rental_hours) ---

    // 這裡你需要寫一個 SQL 查詢，計算該使用者總租借時數
    // 假設你的 `order_record` 表有 `start_date` 和 `end_date` 欄位
    // 使用 TIMESTAMPDIFF 或其他方法計算總時數
    // const totalHoursQuery = `
    //     SELECT SUM(TIMESTAMPDIFF(HOUR, start_date, end_date)) AS total_hours
    //     FROM order_record
    //     WHERE user_id = ?
    //     AND end_date IS NOT NULL
    // `;
    // const [totalHoursResult] = await db.query(totalHoursQuery, [userId]);
    const totalRentalHours = 200; // 假資料，請替換為實際查詢結果

    // 更新 user_missions 表中所有 `total_rental_hours` 類型的任務進度
    // const updateTotalHoursQuery = `
    //     UPDATE user_missions
    //     SET current_progress = ?
    //     WHERE user_id = ?
    //     AND mission_type = 'total_rental_hours'
    //     AND start_date <= ? AND end_date >= ?
    // `;
    // await db.query(updateTotalHoursQuery, [totalRentalHours, userId, now, now]);
    res.status(200).json({ message: "任務進度更新成功", userId, filterDate });

    // 回傳成功訊息
  } catch (error) {
    console.error("更新任務進度時發生錯誤:", error);
    res.status(500).json({ error: "內部伺服器錯誤" });
  }
});

// 伺服器啟動;
app.listen(4000, () => {
  console.log("API server running on port 4000");
});
