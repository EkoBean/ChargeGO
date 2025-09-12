import express from "express";
import cors from "cors";
import db from "../db.js";
const pool = db;
import util from "util";


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
app.get("/", (req, res) => {
  res.send("API shop is running and ready to go!");
});

app.get("/products", async (req, res) => {
  const query = `
 SELECT * FROM coupon_templates;`;
  const results = await pool.queryAsync(query);
  res.json(results);
});

// 購買,兌換優惠券 (先不做扣點機制)
app.post("/buycoupons", async (req, res) => {
  try {
    console.log("前端送的 template_id:", req.body.template_id);
    console.log("前端送的 user_id:", req.body.user_id);

    const { template_id, user_id } = req.body;

    // 取出 優惠券模板中 的截止日期、消耗點數
    const [templaterows] = await pool.queryAsync(
      "SELECT validity_days, point FROM coupon_templates WHERE template_id = ?",
      [template_id]
    );
    if (templaterows.length === 0) {
      return res.status(404).json({ error: "找不到 coupon_template" });
    }
    // 建立從後端擷取優惠券模板截止日期與消耗點數
    const validity_days = templaterows.validity_days;
    const coupon_point = templaterows.point; // 保留 point 作為價格資訊（但不扣點）
    console.log(" templaterows.validity_days", templaterows.validity_days);
    console.log("templaterows.point", templaterows.point);
    console.log("validity_days", validity_days);
    console.log("coupon_point", coupon_point);
    // 新增 coupon
    const couponResult = await pool.queryAsync(
      `INSERT INTO coupons (template_id, user_id, source_type, status, issued_at, expires_at)
       VALUES (?, ?, 'shop_purchase', 'active', NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [template_id, user_id, validity_days]
    );
    console.log("couponResult", couponResult);
    const coupon_id = couponResult.insertId;
    console.log("coupon_id", coupon_id);
    // 新增 shop_orders
    const orderResult = await pool.queryAsync(
      `INSERT INTO shop_orders
        (user_id, template_id, price, coupon_id, order_status)
       VALUES (?, ?, ?, ?, 'completed')`,
      [user_id, template_id, coupon_point, coupon_id]
    );

    const order_id = orderResult.insertId;
    //使用者點數減少

    const pointsDeduct = await pool.queryAsync(
      `UPDATE user
        SET point = point - ?
        WHERE uid = ?;`,
      [coupon_point, user_id]
    );
    console.log("ponitDeduct", pointsDeduct);
    // 回傳
    res.json({
      success: true,
      message: "優惠券與訂單新增成功（未扣點）",
      coupon_id,
      order_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "資料庫錯誤" });
  }
});

//檢查用戶點數餘額是否足夠
app.get("/checkpoints", async (req, res) => {
  try {
    const { user_id, template_id } = req.query;

    if (!user_id || !template_id) {
      return res.status(400).json({ error: "缺少 user_id 或 template_id" });
    }
    //查模板
    const [templaterows] = await pool.queryAsync(
      "SELECT point FROM coupon_templates WHERE template_id = ?",
      [template_id]
    );
    console.log(templaterows);
    if (templaterows.length === 0) {
      return res.status(404).json({ error: "找不到 coupon_template" });
    }
    //需求點數
    const requiredPoints = templaterows.point;
    console.log("需求點數", requiredPoints);
    //查用戶點數
    const [userRows] = await pool.queryAsync(
      "SELECT point FROM user WHERE uid = ?",
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "找不到使用者" });
    }
    console.log("userRows", userRows);
    const userPoints = userRows.point;
    console.log("userPoints", userPoints);
    const sufficient = userPoints >= requiredPoints;
    console.log("sufficient", sufficient);
    res.json({ sufficient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
});

app.post("/points/deduct", async (req, res) => {
  const query = ``;
});
// const PORT = process.env.PORT || 4001;
// app.listen(PORT, () => {
//   console.log(`API server running on port ${PORT}`);
//   console.log("資料庫連線池已建立。");
// });


export default app;