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
// ⭐ 把 pool.query 包成 async/await 可用的 Promise 版本
pool.query = util.promisify(pool.query);
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
      `SELECT c.coupon_id, c.template_id, c.status, c.expires_at, c.code, t.type, t.name
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
//商品折扣優惠券(禮物箱)
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

//租借折扣優惠券(結帳用)
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

// 取得單一優惠券折扣資訊 API(結帳用)
app.get("/coupon-info/:user_id/:coupon_id", async (req, res) => {
  const { user_id, coupon_id } = req.params;

  try {
    const results = await pool.query(
      `SELECT c.coupon_id, t.type, t.value
       FROM coupons c
       JOIN coupon_templates t ON c.template_id = t.template_id
       WHERE c.coupon_id = ?
         AND c.user_id = ?
         AND c.status = 'active'
         AND c.is_expired = 0`,
      [coupon_id, user_id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "優惠券不存在或不可使用" });
    }

    const coupon = results[0];
    let operation;
    let description;

    switch (coupon.type) {
      case "rental_discount":
        operation = "subtract";
        description = `折抵 ${coupon.value} 元`;
        break;
      case "percent_off":
        operation = "multiply";
        description = `${coupon.value * 100}% 折扣`;
        break;
      case "free_minutes":
        operation = "free_time";
        description = `加贈 ${coupon.value} 分鐘`;
        break;
      default:
        operation = "unknown";
        description = "未知優惠";
    }

    res.json({
      coupon_id: coupon.coupon_id,
      type: coupon.type,
      value: coupon.value,
      operation,
      description,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
});

// 將優惠券標記為已使用
app.post("/use-coupon", async (req, res) => {
  const { coupon_id } = req.body;

  if (!coupon_id) {
    return res.status(400).json({ error: "缺少 coupon_id" });
  }

  try {
    const result = await pool.query(
      `UPDATE coupons
       SET status = 'used'
       WHERE coupon_id = ?`,
      [coupon_id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "優惠券已成功使用", coupon_id });
    } else {
      res.status(404).json({ message: "優惠券不存在、已使用或不可用" });
    }
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
