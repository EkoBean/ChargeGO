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

//購買,兌換優惠券
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

// 取得優惠券
//根據輸入的優惠券
app.get("/mycouponsparam/:user_id", async (req, res) => {
  const { user_id } = req.params; // <-- 抓路由上的 user_id
  // console.log("user_id:", user_id);

  try {
    // 1. 先將過期優惠券改為 expired
    await pool.query(
      `UPDATE coupons
       SET status = 'expired'
       WHERE user_id = ? AND expires_at < NOW()`,
      [user_id]
    );

    // 2. 查詢尚未過期或狀態非 expired 的優惠券
    const coupons = await pool.query(
      `SELECT c.coupon_id, c.template_id, c.status, c.expires_at, c.code, t.name
       FROM coupons c
       LEFT JOIN coupon_templates t ON c.template_id = t.template_id
       WHERE c.user_id = ? AND c.status != 'expired'`,
      [user_id]
    );

    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
});
//商品類兌換折扣券使用
//功能為跳出QRcode
app.post("/redeem/:couponCode", async (req, res) => {
  const coupon_Code = req.params;
  console.log("coupon_Code", coupon_Code);

  const coupon_id = coupon_Code.couponCode;
  console.log("coupon_id", coupon_id);

  console.log(typeof coupon_id);
  try {
    const result = await pool.query(
      `UPDATE coupons
       SET status = 'used'
       WHERE coupon_id = ? AND status = 'active'`,
      [coupon_id]
    );
    console.log("result：");
    console.log(result);
    console.log("result.affectedRows");
    console.log(result.affectedRows);
    if (result.affectedRows > 0) {
      res.json({ message: "兌換成功" });
    } else {
      res.json({ message: "優惠券不存在或已使用" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "資料庫錯誤" });
  }
});

//結帳時租借優惠券使用
app.get("/mycoupons/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // 先更新過期的
    await pool.query(
      `UPDATE coupons
       SET is_expired = 1
       WHERE user_id = ? AND expires_at < NOW()`,
      [user_id]
    );

    // 查詢符合三種 type 的 coupon
    const coupons = await pool.query(
      `SELECT c.coupon_id, c.template_id, c.status,c.is_expired, c.expires_at, t.name, t.type
       FROM coupons c
       JOIN coupon_templates t ON c.template_id = t.template_id
       WHERE c.user_id = ?
         AND t.type IN ('rental_discount', 'free_minutes', 'percent_off')
         AND c.status = 'active'
         AND c.is_expired = 0`,
      [user_id]
    );

    res.json(coupons);
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
