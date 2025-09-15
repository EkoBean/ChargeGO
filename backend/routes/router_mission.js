import express from "express";
import util from "util";
import db from "../db.js";
const pool = db;

const app = express.Router();

// app.use(express.static("public"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// const pool = mysql.createPool({
//   user: "abuser",
//   password: "123456",
//   host: "localhost",
//   port: 3306,
//   database: "charger_database",
//   connectionLimit: 10, // 設定連線池的大小，可以根據你的需求調整
// });
// 將連線池的 query 方法轉換成 Promise 版本
// 這樣所有的路由都可以使用 async/await 語法，程式碼更清晰
pool.query = util.promisify(pool.query);

// 新增一個處理根路徑的路由
app.get("/", (req, res) => {
  res.send("API is running and ready to go!");
});
//任務查詢
app.get("/:user_id/:date", async function (req, res) {
  const { user_id, date } = req.params;

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
  try {
    // 使用 await 等待查詢結果，這裡使用 pool.query
    const results = await pool.queryAsync(query, [user_id, date, date, date]);
    res.json(results);
  } catch (err) {
    console.error("執行查詢時發生錯誤:", err);
    res.status(500).json({ error: "無法從資料庫獲取任務資料" });
  }
});

// 領取任務獎勵（修正版：正確取得 row、檢查、transaction、回傳更新後 point）
app.post("/usermission/claim", async (req, res) => {
  const { user_mission_id, user_id } = req.body;
  console.log("user_mission", user_mission_id);
  console.log("user_id", user_id);
  if (!user_mission_id || !user_id) {
    return res.status(400).json({ message: "缺少 user_mission_id 或 user_id" });
  }

  try {
    // Step 1: 查詢任務狀態與獎勵點數
    const rows = await pool.queryAsync(
      `SELECT
        um.is_completed,
        um.is_claimed,
        m.reward_points
      FROM user_missions AS um
      JOIN missions AS m
        ON um.mission_id = m.mission_id
      WHERE um.user_mission_id = ?`,
      [user_mission_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "找不到指定的任務" });
    }

    // 取第一筆
    const mission = rows[0];
    console.log("mission row:", mission);

    // Step 2: 檢查狀態
    // 注意強制轉為 Number 檢查 0/1
    if (Number(mission.is_completed) !== 1) {
      return res.status(400).json({ message: "任務尚未完成" });
    }
    if (Number(mission.is_claimed) === 1) {
      return res.status(400).json({ message: "獎勵已領取過" });
    }

    // Step 3: 使用交易處理 領取 + 加點數
    await pool.queryAsync("START TRANSACTION");

    // 標記為已領取
    const updateMissionRes = await pool.queryAsync(
      `UPDATE user_missions 
       SET is_claimed = 1 
       WHERE user_mission_id = ?`,
      [user_mission_id]
    );
    console.log("updateMissionRes:", updateMissionRes);

    // 確保 reward_points 是數字
    const rewardPoints = Number(mission.reward_points) || 0;

    // 增加點數
    const updateUserRes = await pool.queryAsync(
      `UPDATE user 
       SET point = point + ? 
       WHERE uid = ?`,
      [rewardPoints, user_id]
    );
    console.log("updateUserRes:", updateUserRes);

    // commit
    await pool.queryAsync("COMMIT");

    // 讀出更新後的 point
    const userRows = await pool.queryAsync(
      "SELECT point FROM `user` WHERE uid = ?",
      [user_id]
    );
    const updatedPoint = userRows && userRows.length ? userRows[0].point : null;

    res.status(200).json({
      message: "任務已成功領取並增加點數",
      reward: rewardPoints,
      point: updatedPoint,
    });
  } catch (err) {
    try {
      await pool.queryAsync("ROLLBACK");
    } catch (rbErr) {
      console.error("ROLLBACK 失敗:", rbErr);
    }
    console.error("領取任務獎勵時發生錯誤:", err);
    res.status(500).json({ message: "無法領取獎勵，請稍後再試" });
  }
});

// 看當月任務次數
app.get("/update/orderrecord/:user_id/:date", async (req, res) => {
  const userId = req.params.user_id;
  const filterDate = req.params.date;

  if (!userId || !filterDate) {
    return res.status(400).json({ error: "缺少使用者 ID 或篩選日期" });
  }

  try {
    const now = new Date(filterDate);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfMonthISO = startOfMonth.toISOString();
    const startOfNextMonthISO = startOfNextMonth.toISOString();

    const sql = `
            SELECT COUNT(*) AS count
            FROM order_record
            WHERE uid = ? AND start_date >= ? AND end <= ?;
        `;

    // 修正這裡的參數，將開始日期設為 startOfMonthISO
    const results = await pool.queryAsync(sql, [
      userId,
      startOfMonthISO,
      startOfNextMonthISO,
    ]);

    const orderCount = results[0]?.count || 0;

    console.log(`用戶 ${userId} 在指定時間內的訂單總數為: ${orderCount}`);

    res.status(200).json({
      userId: userId,
      filterDate: filterDate,
      orderCount: orderCount,
      message: "查詢成功",
    });
  } catch (error) {
    console.error("資料庫查詢失敗:", error);
    res.status(500).json({
      error: "資料庫查詢失敗",
      details: error.message,
    });
  }
});

//看看當月資料內容
app.get("/get/orderrecord/:user_id/:date", async (req, res) => {
  const userId = req.params.user_id;
  const filterDate = req.params.date;

  if (!userId || !filterDate) {
    return res.status(400).json({ error: "缺少使用者 ID 或篩選日期" });
  }

  try {
    const now = new Date(filterDate);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfMonthISO = startOfMonth.toISOString();
    const startOfNextMonthISO = startOfNextMonth.toISOString();
    const nowISO = now.toISOString();
    console.log(nowISO);
    const sql = `
            SELECT *
            FROM order_record
            WHERE uid = ? AND start_date >= ? AND end < ?;
        `;

    // 使用 await 執行查詢，並取得所有符合條件的資料列
    const records = await pool.queryAsync(sql, [
      userId,
      startOfMonthISO,
      startOfNextMonthISO,
    ]);

    console.log(`用戶 ${userId} 在指定時間內的訂單紀錄:`, records);

    // 返回所有符合條件的資料作為 JSON
    res.status(200).json({
      userId: userId,
      filterDate: filterDate,
      records: records, // 將資料列放入 records 屬性中
      recordCount: records.length,
      message: "查詢成功",
    });
  } catch (error) {
    console.error("資料庫查詢失敗:", error);
    res.status(500).json({
      error: "資料庫查詢失敗",
      details: error.message,
    });
  }
});
// 當月租借次數
app.post("/update/monthRental", async (req, res) => {
  const { userId, filterDate } = req.body;
  //判斷userId,filterDate 是否為null
  if (!userId || !filterDate) {
    res.status(400).json({ error: "缺少使用者 ID 或篩選日期" });
    return;
  }

  try {
    //藉由輸入日期選出月份
    const now = new Date(filterDate);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    //計算月分內的租借筆數
    const monthlyRentalsQuery = `
            SELECT COUNT(*) AS count
            FROM order_record
            WHERE uid = ? AND end IS NOT NULL AND  start_date >= ? AND  end < ?;
        `;
    // 這裡需要使用 pool.query與資料庫連接
    const [monthlyResult] = await pool.queryAsync(monthlyRentalsQuery, [
      userId,
      startOfMonth,
      startOfNextMonth,
    ]);
    //monthlyResult這個query物件中取出需要的count
    const monthlyRentalCount = monthlyResult.count;
    console.log(monthlyRentalCount);

    // is_completed = IF(target_value <= ?, 1, 0)
    //更新當月租借次數任務進度
    const updateMonthlyQueryProgress = `
        UPDATE user_missions
        SET
          current_progress = ?
        WHERE
          user_id = ? AND mission_id IN (
            SELECT
              mission_id
            FROM
              missions
            WHERE
                type = 'monthly_rentals'
                AND
                mission_start_date >= ? AND mission_end_date < ?
          );
        `;
    //更新當月任務完成狀態
    const updateMonthlyQueryIsCompleted = `UPDATE user_missions
      INNER JOIN missions ON user_missions.mission_id = missions.mission_id
      SET
        user_missions.is_completed = IF(user_missions.current_progress >= missions.target_value, 1, 0)
      WHERE
        user_missions.user_id = ?
        AND missions.type = 'monthly_rentals'
        AND missions.mission_start_date >= ?
        AND missions.mission_end_date < ?
  `;
    await pool.queryAsync(updateMonthlyQueryProgress, [
      monthlyRentalCount,
      userId,
      startOfMonth,
      startOfNextMonth,
    ]);
    await pool.queryAsync(updateMonthlyQueryIsCompleted, [
      userId,
      startOfMonth,
      startOfNextMonth,
    ]);

    res.status(200).json({ message: "任務進度更新成功", userId, filterDate });
  } catch (error) {
    console.error("更新任務進度時發生錯誤:", error);
    res.status(500).json({ error: "內部伺服器錯誤" });
  }
});
//當月租借時數
app.post("/update/monthHours", async (req, res) => {
  const { userId, filterDate } = req.body;
  //判斷userId,filterDate 是否為null
  if (!userId || !filterDate) {
    res.status(400).json({ error: "缺少使用者 ID 或篩選日期" });
    return;
  }

  try {
    //藉由輸入日期選出月份
    const now = new Date(filterDate);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // --- 處理「當月租借總時數」任務類型 (total_rental_hours) ---

    const totalHoursQuery = `
                SELECT SUM(TIMESTAMPDIFF(HOUR, start_date, end)) AS total_hours
                FROM order_record
                WHERE uid = ? AND start_date>=?;
            `;
    const [totalHoursResult] = await pool.queryAsync(totalHoursQuery, [
      userId,
      startOfMonth,
    ]);
    console.log("query回傳結果", totalHoursResult);
    const totalRentalHours = totalHoursResult.total_hours || 0;
    console.log("總時數" + totalRentalHours);
    // is_completed = IF(target_value <= ?, 1, 0)
    //更新當月租借時數任務進度
    const updateMonthlyQueryProgress = `
        UPDATE user_missions
        SET
          current_progress = ?
        WHERE
          user_id = ? AND mission_id IN (
            SELECT
              mission_id
            FROM
              missions
            WHERE
                type = 'accumulated_hours'
                AND
                mission_start_date >= ? AND mission_end_date < ?
          );
        `;
    //更新當月任務完成狀態
    const updateMonthlyQueryIsCompleted = `UPDATE user_missions
      INNER JOIN missions ON user_missions.mission_id = missions.mission_id
      SET
        user_missions.is_completed = IF(user_missions.current_progress >= missions.target_value, 1, 0)
      WHERE
        user_missions.user_id = ?
        AND missions.type = 'accumulated_hours'
        AND missions.mission_start_date >= ?
        AND missions.mission_end_date < ?
  `;
    await pool.queryAsync(updateMonthlyQueryProgress, [
      totalRentalHours,
      userId,
      startOfMonth,
      startOfNextMonth,
    ]);
    await pool.queryAsync(updateMonthlyQueryIsCompleted, [
      userId,
      startOfMonth,
      startOfNextMonth,
    ]);

    res.status(200).json({ message: "任務進度更新成功", userId, filterDate });
  } catch (error) {
    console.error("更新任務進度時發生錯誤:", error);
    res.status(500).json({ error: "內部伺服器錯誤" });
  }
});
// 伺服器啟動
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`API server running on port ${PORT}`);
//   console.log("資料庫連線池已建立。");
// });

export default app;
