// server.js
var express = require("express");
var cors = require("cors");
var mysql = require("mysql");

var app = express();

// Middlewares
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// === DB 連線：charger_database ===
var connCharger = mysql.createConnection({
  host: "localhost",
  port: 3306,           
  user: "abuser",
  password: "",
  database: "charger_database"
});

// === DB 連線：bank ===
var connBank = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "abuser",
  password: "",
  database: "bank"
});

// 啟動伺服器
app.listen(3000, () => {
  console.log("Web伺服器就緒 → http://127.0.0.1:3000");
  console.log("「Ctrl + C」可結束伺服器程式.");
});

// 連線資料庫（開機自檢）
connCharger.connect(function (err) {
  if (err) console.error("charger_database 連線失敗：", err.code);
  else {
    console.log("charger_database 連線成功");
    connCharger.query("SELECT COUNT(*) AS cnt FROM user", (e, r) => {
      if (e) console.error("user 表查詢失敗：", e.code);
      else console.log("user 表筆數：", r[0].cnt);
    });
  }
});
connBank.connect(function (err) {
  if (err) console.error("bank 連線失敗：", err.code);
  else {
    console.log("bank 連線成功");
    connBank.query("SELECT COUNT(*) AS cnt FROM credit_card", (e, r) => {
      if (e) console.error("credit_card 表查詢失敗：", e.code);
      else console.log("credit_card 表筆數：", r[0].cnt);
    });
  }
});

// ===== 首頁（導覽）=====
app.get("/", (req, res) => {
  res.send(`
    <h3>伺服器運作正常，試試以下 API：</h3>
    <ul>
      <li><a href="/user/list">/user/list</a>（charger_database.user）</li>
      <li><a href="/api/sites">/api/sites</a>（站點）</li>
      <li><a href="/api/chargers">/api/chargers</a>（行充含站點）</li>
      <li><a href="/api/orders">/api/orders</a>（訂單含關聯）</li>
      <li><a href="/bank/cards">/bank/cards</a>（信用卡清單-遮蔽）</li>
    </ul>
  `);
});

// ===== charger_database 區 =====

// 使用者清單（不回傳敏感信用卡欄位）
app.get("/user/list", (req, res) => {
  connCharger.query(`
    SELECT uid, user_name, telephone, email, address, blacklist, wallet, point, total_carbon_footprint
    FROM user ORDER BY uid ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 新增：更新使用者資料
app.put("/user/:uid", (req, res) => {
  const uid = req.params.uid;
  const {
    user_name,
    email,
    telephone,
    address,
    wallet,
    point,
    blacklist,
  } = req.body;

  const sets = [];
  const params = [];

  const add = (col, val) => {
    if (typeof val !== "undefined") {
      sets.push(`${col} = ?`);
      params.push(val);
    }
  };

  add("user_name", user_name);
  add("email", email);
  add("telephone", telephone);
  add("address", address);
  if (typeof wallet !== "undefined") add("wallet", Number(wallet) || 0);
  if (typeof point !== "undefined") add("point", Number(point) || 0);
  if (typeof blacklist !== "undefined") add("blacklist", blacklist ? 1 : 0);

  if (!sets.length) {
    return res.status(400).json({ message: "no fields to update" });
  }

  params.push(uid);

  connCharger.query(
    `UPDATE user SET ${sets.join(", ")} WHERE uid = ?`,
    params,
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code });
      if (result.affectedRows === 0) return res.status(404).json({ message: "user not found" });

      connCharger.query(
        `SELECT uid, user_name, telephone, email, address, blacklist, wallet, point, total_carbon_footprint
         FROM user WHERE uid = ?`,
        [uid],
        (e2, rows) => {
          if (e2) return res.status(500).json({ error: "DB error", code: e2.code });
          res.json(rows[0]);
        }
      );
    }
  );
});

// 站點清單（charger_site）
app.get("/api/sites", (req, res) => {
  connCharger.query(`
    SELECT site_id, site_name, address, longitude, latitude
    FROM charger_site ORDER BY site_id ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 某站點的行充（charger）
app.get("/api/sites/:id/chargers", (req, res) => {
  connCharger.query(`
    SELECT charger_id, status, site_id
    FROM charger WHERE site_id = ? ORDER BY charger_id ASC
  `, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 行充總覽（含站點 join）
app.get("/api/chargers", (req, res) => {
  connCharger.query(`
    SELECT c.charger_id, c.status, c.site_id,
           s.site_name, s.address, s.longitude, s.latitude
    FROM charger c
    LEFT JOIN charger_site s ON c.site_id = s.site_id
    ORDER BY c.charger_id ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 訂單清單（order_record + user/charger_site/charger）
app.get("/api/orders", (req, res) => {
  connCharger.query(`
    SELECT o.order_ID, o.uid, u.user_name, u.telephone, u.email,
           o.start_date, o.end, o.site_id, s.site_name, s.address,
           o.order_status, o.charger_id, c.status AS charger_status
    FROM order_record o
    JOIN user u ON o.uid = u.uid
    JOIN charger_site s ON o.site_id = s.site_id
    JOIN charger c ON o.charger_id = c.charger_id
    ORDER BY o.order_ID DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 新增訂單
app.post("/api/orders", (req, res) => {
  const {
    uid,
    start_date,
    end,
    site_id,
    order_status,
    charger_id
  } = req.body;

  if (!uid || !start_date || !site_id || !order_status || !charger_id) {
    return res.status(400).json({ message: "缺少必要欄位" });
  }

  connCharger.query(
    `INSERT INTO order_record (uid, start_date, end, site_id, order_status, charger_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uid, start_date, end, site_id, order_status, charger_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code });
      // 回傳新訂單資料
      connCharger.query(
        `SELECT * FROM order_record WHERE order_ID = ?`,
        [result.insertId],
        (e2, rows) => {
          if (e2) return res.status(500).json({ error: "DB error", code: e2.code });
          res.json(rows[0]);
        }
      );
    }
  );
});

// 更新訂單
app.put("/api/orders/:order_ID", (req, res) => {
  const order_ID = req.params.order_ID;
  const {
    uid,
    start_date,
    end,
    site_id,
    order_status,
    charger_id
  } = req.body;

  const sets = [];
  const params = [];

  const add = (col, val) => {
    if (typeof val !== "undefined") {
      sets.push(`${col} = ?`);
      params.push(val);
    }
  };

  add("uid", uid);
  add("start_date", start_date);
  add("end", end);
  add("site_id", site_id);
  add("order_status", order_status);
  add("charger_id", charger_id);

  if (!sets.length) {
    return res.status(400).json({ message: "no fields to update" });
  }

  params.push(order_ID);

  connCharger.query(
    `UPDATE order_record SET ${sets.join(", ")} WHERE order_ID = ?`,
    params,
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code });
      if (result.affectedRows === 0) return res.status(404).json({ message: "order not found" });

      connCharger.query(
        `SELECT * FROM order_record WHERE order_ID = ?`,
        [order_ID],
        (e2, rows) => {
          if (e2) return res.status(500).json({ error: "DB error", code: e2.code });
          res.json(rows[0]);
        }
      );
    }
  );
});

// ===== bank 區 =====

// 信用卡清單（遮蔽卡號，不回傳 cvc）
app.get("/bank/cards", (req, res) => {
  connBank.query(`
    SELECT bankuser_id, bankuser_name, credit_card_number, credit_card_date
    FROM credit_card ORDER BY bankuser_id ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });

    // 遮蔽：只露出最後 4 碼
    const masked = rows.map(r => {
      const num = String(r.credit_card_number || "");
      const last4 = num.slice(-4);
      return {
        bankuser_id: r.bankuser_id,
        bankuser_name: r.bankuser_name,
        credit_card_number_masked: num.length ? `${"*".repeat(Math.max(0, num.length - 4))}${last4}` : "",
        credit_card_date: r.credit_card_date
      };
    });
    res.json(masked);
  });
});

// （可選）依使用者 email 或姓名嘗試對應 bank 卡片（示範）
// 這裡用 email 查 charger_database.user，再用 credit_card_number 去 bank 佐證是否存在
app.get("/user/:uid/card/match", (req, res) => {
  connCharger.query(`
    SELECT uid, user_name, email, credit_card_number, credit_card_date
    FROM user WHERE uid = ?
  `, [req.params.uid], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    if (!rows.length) return res.status(404).json({ message: "user not found" });

    const u = rows[0];
    if (!u.credit_card_number) return res.json({ uid: u.uid, match: false });

    connBank.query(`
      SELECT bankuser_id, bankuser_name, credit_card_number, credit_card_date
      FROM credit_card WHERE credit_card_number = ? LIMIT 1
    `, [u.credit_card_number], (e2, r2) => {
      if (e2) return res.status(500).json({ error: "DB error", code: e2.code });
      if (!r2.length) return res.json({ uid: u.uid, match: false });

      // 僅回遮蔽資訊
      const num = String(r2[0].credit_card_number || "");
      const last4 = num.slice(-4);
      return res.json({
        uid: u.uid,
        match: true,
        bankuser_id: r2[0].bankuser_id,
        bankuser_name: r2[0].bankuser_name,
        credit_card_number_masked: `${"*".repeat(Math.max(0, num.length - 4))}${last4}`,
        credit_card_date: r2[0].credit_card_date
      });
    });
  });
});

// （可選）關閉時優雅斷線
process.on("SIGINT", () => {
  console.log("\n關閉連線並結束程式...");
  connCharger.end(() => {
    connBank.end(() => process.exit(0));
  });
});
