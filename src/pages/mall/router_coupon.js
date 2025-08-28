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
app.post("/buycoupons", async (req, res) => {
  try {
    console.log("前端送的 template_id:", req.body.template_id);

    const { template_id, user_id } = req.body;

    // 取出 template 的 validity_days
    const [templates] = await pool.query(
      "SELECT validity_days FROM coupon_templates WHERE template_id = ?",
      [template_id]
    );
    console.log(templates);
    if (templates.length === 0) {
      return res.status(404).json({ error: "找不到 coupon_template" });
    }
    console.log("templates[0].validity_days");
    console.log(templates.validity_days);

    const validity_days = templates.validity_days;
    console.log("validity_days");
    console.log(validity_days);
    // expires_at = NOW() + validity_days
    const result = await pool.query(
      `INSERT INTO coupons (template_id, user_id, source_type, status, issued_at, expires_at)
       VALUES (?, ?, 'shop_purchase', 'active', NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [template_id, user_id, validity_days]
    );
    console.log("SQL 查詢結果:", result);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "找不到對應的 coupon template" });
    }
    const coupon_id = result.insertId;
    //將花費點數儲存
    const price = await pool.query(
      `SELECT c.coupon_id, c.template_id, t.point
   FROM coupons c
   JOIN coupon_templates t ON c.template_id = t.template_id
   WHERE c.coupon_id = ?`,
      [coupon_id]
    );
    console.log(price);
    // 3. 新增 shop_orders
    const orderResult = await pool.query(
      `INSERT INTO shop_orders
        (user_id, template_id, price, coupon_id, order_status)
       VALUES (?, ?, ?, ?, 'completed')`,
      [user_id, template_id, price, coupon_id]
    );
    const order_id = orderResult.insertId;
    // 4. 回傳
    res.json({
      message: "優惠券與訂單新增成功",
      coupon_id,
      order_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
});
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log("資料庫連線池已建立。");
});
