//後端
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());
app.use(express.json());

// 健康檢查
app.get('/health', (_req, res) => res.json({ ok: true }));

// === DB 連線：charger_database ===
var connCharger = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "charger_database"
});

// === DB 連線：bank ===
var connBank = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bank"
});

// 啟動伺服器
app.listen(3000, () => {
  console.log("Web伺服器就緒 → http://127.0.0.1:3000");
  console.log("「Ctrl + C」可結束伺服器程式.");
});

// 連線 DB（開機檢查）
connCharger.connect(function (err) {
  if (err) {
    console.error("charger_database 連線失敗：", err && err.code);
  } else {
    console.log("charger_database 連線成功");
    connCharger.query("SELECT COUNT(*) AS cnt FROM user", (e, r) => {
      if (e) console.error("user 表查詢失敗：", e.code);
      else console.log("user 表筆數：", r[0].cnt);
    });
  }
});

connBank.connect(function (err) {
  if (err) {
    console.error("bank 連線失敗：", err && err.code);
  } else {
    console.log("bank 連線成功");
    connBank.query("SELECT COUNT(*) AS cnt FROM credit_card", (e, r) => {
      if (e) {
        console.error("credit_card 表查詢失敗：", e.code);
      } else {
        console.log("credit_card 表筆數：", r[0].cnt);
      }
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
      <li><a href="/api/employee_log">/api/employee_log</a>（職員操作紀錄）</li>
      <li><a href="/api/employees">/api/employees</a>（員工清單）</li>
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

// 更新使用者
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

// 站點清單
app.get("/api/sites", (req, res) => {
  connCharger.query(`
    SELECT site_id, site_name, address, longitude, latitude
    FROM charger_site ORDER BY site_id ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 某站點的行充
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
  const q = `
    SELECT o.order_ID,
           o.uid,
           u.user_name, u.telephone, u.email,
           o.start_date, o.\`end\` AS \`end\`,
           o.rental_site_id, rs.site_name AS rental_site_name, rs.address AS rental_site_address,
           o.return_site_id, rt.site_name AS return_site_name, rt.address AS return_site_address,
           o.order_status, o.charger_id,
           c.status AS charger_status
    FROM order_record o
    LEFT JOIN user u ON o.uid = u.uid
    LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
    LEFT JOIN charger_site rt ON o.return_site_id = rt.site_id
    LEFT JOIN charger c ON o.charger_id = c.charger_id
    ORDER BY o.order_ID DESC
  `;
  connCharger.query(q, [], (err2, rows) => {
    if (err2) {
      console.error("[ERROR] GET /api/orders failed:", err2);
      return res.status(500).json({ error: "DB error", code: err2.code, message: err2.message });
    }
    res.json(rows);
  });
});

// 新增站點
app.post("/api/sites", (req, res) => {
  const { site_name, address, longitude, latitude } = req.body;
  if (!site_name || !address || typeof longitude === "undefined" || typeof latitude === "undefined") {
    return res.status(400).json({ message: "缺少必要欄位：站點名稱、地址、經緯度" });
  }
  const lon = parseFloat(longitude);
  const lat = parseFloat(latitude);
  if (Number.isNaN(lon) || Number.isNaN(lat)) {
    return res.status(400).json({ message: "經緯度必須為數字" });
  }
  connCharger.query(
    `INSERT INTO charger_site (site_name, address, longitude, latitude)
     VALUES (?, ?, ?, ?)`,
    [site_name, address, lon, lat],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
      connCharger.query(
        `SELECT site_id, site_name, address, longitude, latitude
         FROM charger_site WHERE site_id = ?`,
        [result.insertId],
        (e2, rows) => {
          if (e2) return res.status(500).json({ error: "DB error", code: e2.code, message: e2.message });
          res.json(rows[0]);
        }
      );
    }
  );
});

// 更新站點
app.put("/api/sites/:site_id", (req, res) => {
  const site_id = req.params.site_id;
  if (!/^\d+$/.test(String(site_id))) return res.status(400).json({ message: "invalid site_id" });

  const { site_name, address, longitude, latitude } = req.body;
  const sets = [];
  const params = [];
  const add = (col, val) => {
    if (typeof val !== "undefined") {
      sets.push(`${col} = ?`);
      params.push(val);
    }
  };

  add("site_name", site_name);
  add("address", address);

  if (typeof longitude !== "undefined") {
    const lon = parseFloat(longitude);
    if (Number.isNaN(lon)) return res.status(400).json({ message: "longitude 格式錯誤" });
    add("longitude", lon);
  }
  if (typeof latitude !== "undefined") {
    const lat = parseFloat(latitude);
    if (Number.isNaN(lat)) return res.status(400).json({ message: "latitude 格式錯誤" });
    add("latitude", lat);
  }

  if (!sets.length) return res.status(400).json({ message: "no fields to update" });

  params.push(site_id);

  connCharger.query(
    `UPDATE charger_site SET ${sets.join(", ")} WHERE site_id = ?`,
    params,
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code });
      if (result.affectedRows === 0) return res.status(404).json({ message: "site not found" });

      connCharger.query(
        `SELECT site_id, site_name, address, longitude, latitude
         FROM charger_site WHERE site_id = ?`,
        [site_id],
        (e2, rows) => {
          if (e2) return res.status(500).json({ error: "DB error", code: e2.code });
          res.json(rows[0]);
        }
      );
    }
  );
});

// helper: toMySQLDatetime
function toMySQLDatetime(v) {
  if (v === null || typeof v === "undefined" || v === "") return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 新增訂單
app.post("/api/orders", (req, res) => {
  const { uid, start_date, end, site_id, rental_site_id, return_site_id, order_status, charger_id } = req.body;
  if (!uid || !start_date || (!site_id && !rental_site_id) || typeof order_status === "undefined" || typeof charger_id === "undefined") {
    return res.status(400).json({ message: "缺少必要欄位 (需 uid, start_date, rental_site 或 site_id, order_status, charger_id)" });
  }

  const rentSite = (typeof rental_site_id !== "undefined") ? rental_site_id : site_id;
  const retSite = (typeof return_site_id !== "undefined") ? return_site_id : null;
  const endNormalized = toMySQLDatetime(end);

  const q = `
    INSERT INTO order_record (uid, start_date, \`end\`, rental_site_id, return_site_id, order_status, charger_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connCharger.query(q, [uid, start_date, endNormalized, rentSite, retSite, order_status, charger_id], (err2, result) => {
    if (err2) return res.status(500).json({ error: "DB error", code: err2.code, message: err2.message });
    connCharger.query(`SELECT * FROM order_record WHERE order_ID = ?`, [result.insertId], (e2, rows) => {
      if (e2) return res.status(500).json({ error: "DB error", code: e2.code, message: e2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// 更新訂單
app.put("/api/orders/:order_ID", (req, res) => {
  const order_ID = req.params.order_ID;
  if (!/^\d+$/.test(String(order_ID))) return res.status(400).json({ message: "invalid order_ID" });

  const payload = req.body || {};
  const sets = [];
  const params = [];
  const add = (col, val) => {
    if (typeof val !== "undefined") {
      sets.push(`${col} = ?`);
      params.push(val);
    }
  };

  if (Object.prototype.hasOwnProperty.call(payload, "uid")) add("uid", payload.uid);
  if (Object.prototype.hasOwnProperty.call(payload, "start_date")) add("start_date", payload.start_date);

  if (Object.prototype.hasOwnProperty.call(payload, "end")) {
    add("`end`", payload.end === null ? null : toMySQLDatetime(payload.end));
  }

  if (Object.prototype.hasOwnProperty.call(payload, "rental_site_id") ||
      Object.prototype.hasOwnProperty.call(payload, "site_id")) {
    const rentVal = Object.prototype.hasOwnProperty.call(payload, "rental_site_id")
      ? payload.rental_site_id
      : payload.site_id;
    add("rental_site_id", rentVal === "" ? null : rentVal);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "return_site_id")) {
    add("return_site_id", payload.return_site_id === "" ? null : payload.return_site_id);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "order_status")) add("order_status", payload.order_status);
  if (Object.prototype.hasOwnProperty.call(payload, "charger_id")) {
    add("charger_id", payload.charger_id === "" ? null : payload.charger_id);
  }

  if (!sets.length) return res.status(400).json({ message: "no fields to update" });

  params.push(order_ID);
  const sql = `UPDATE order_record SET ${sets.join(", ")} WHERE order_ID = ?`;
  connCharger.query(sql, params, (qErr, result) => {
    if (qErr) return res.status(500).json({ error: "DB_ERROR", message: qErr.message, code: qErr.code });
    if (result.affectedRows === 0) return res.status(404).json({ message: "order not found" });

    connCharger.query(`SELECT * FROM order_record WHERE order_ID = ?`, [order_ID], (e2, rows) => {
      if (e2) return res.status(500).json({ error: "DB_ERROR", message: e2.message });
      res.json(rows[0]);
    });
  });
});

// helper：安全執行 query（包含詳細錯誤日誌）
function safeQuery(conn, sql, params, res, cb) {
  if (!conn || typeof conn.query !== 'function') {
    console.error('[ERROR] DB connection invalid:', conn);
    return res.status(500).json({ error: 'DB connection invalid' });
  }

  conn.query(sql, params, (err, rows) => {
    if (err) {
      // 先輸出詳細錯誤到 server console（方便除錯）
      console.error('[DB QUERY ERROR]', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
      });
      // 常見情況：資料表不存在 -> 回空陣列避免前端崩潰
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.warn('[WARN] table not found for sql:', sql);
        return res.json([]);
      }
      // 其餘錯誤回 500（並帶簡短代碼與訊息）
      return res.status(500).json({ error: 'DB error', code: err.code, message: err.message });
    }
    cb(rows);
  });
}

// ===== 新增/替換：職員操作紀錄（employee_log）API =====
app.get('/api/employee_log', (req, res) => {
  connCharger.query('DESCRIBE employee_log', (dErr, cols) => {
    if (dErr) {
      if (dErr.code === 'ER_NO_SUCH_TABLE') {
        console.warn('[WARN] employee_log table missing:', dErr.message);
        return res.json([]);
      }
      console.error('[ERROR] DESCRIBE employee_log failed:', dErr);
      return res.status(500).json({ error: 'DB error', code: dErr.code, message: dErr.message });
    }

    const available = new Set((cols || []).map(c => c.Field));
    const want = ['employee_log_date', 'employee_id', 'log', 'details', 'meta'];
    const fields = want.filter(f => available.has(f));
    if (!fields.length) {
      console.warn('[WARN] no expected columns found in employee_log, returning empty array');
      return res.json([]);
    }

    const orderBy = available.has('employee_log_date') ? 'employee_log_date' : fields[0];
    const sql = `SELECT ${fields.join(', ')} FROM employee_log ORDER BY ${orderBy} DESC LIMIT 1000`;
    connCharger.query(sql, [], (err, rows) => {
      if (err) {
        console.error('[ERROR] GET /api/employee_log failed:', err);
        // 若欄位錯誤等常見問題，回空陣列避免前端崩潰
        if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
          return res.json([]);
        }
        return res.status(500).json({ error: 'DB error', code: err.code, message: err.message });
      }
      console.log(`[INFO] /api/employee_log returned ${Array.isArray(rows) ? rows.length : 0} rows`);
      res.json(Array.isArray(rows) ? rows : []);
    });
  });
});

// 更穩健的員工清單 API：先 DESCRIBE 再選取可用欄位
app.get('/api/employees', (req, res) => {
  connCharger.query('DESCRIBE employee', (dErr, cols) => {
    if (dErr) {
      if (dErr.code === 'ER_NO_SUCH_TABLE') {
        console.warn('[WARN] employee table missing:', dErr.message);
        return res.json([]);
      }
      console.error('[ERROR] DESCRIBE employee failed:', dErr);
      return res.status(500).json({ error: 'DB error', code: dErr.code, message: dErr.message });
    }

    const available = new Set((cols || []).map(c => c.Field));

    // 決定要選取的欄位：優先對應到 employee_id / employee_name / employee_email
    const idCandidates = ['employee_id', 'id'];
    const nameCandidates = ['employee_name', 'name', 'username', 'account'];
    const emailCandidates = ['employee_email', 'employee_mail', 'email'];

    const pick = (cands) => cands.find(c => available.has(c)) || null;

    const idCol = pick(idCandidates);
    const nameCol = pick(nameCandidates);
    const emailCol = pick(emailCandidates);

    // 若三者皆沒找到，則退而求其次選全部欄位
    let selectParts = [];
    if (idCol) selectParts.push(`${idCol} AS employee_id`);
    if (nameCol) selectParts.push(`${nameCol} AS employee_name`);
    if (emailCol) selectParts.push(`${emailCol} AS employee_email`);

    if (!selectParts.length) {
      // 若沒有對應欄位，選取所有欄位以便前端可檢視
      selectParts = ['*'];
    }

    const select = selectParts.join(', ');
    const orderBy = idCol ? `${idCol}` : '1';

    const sql = `SELECT ${select} FROM employee ORDER BY ${orderBy} ASC LIMIT 1000`;
    connCharger.query(sql, [], (err, rows) => {
      if (err) {
        console.error('[ERROR] GET /api/employees failed:', err);
        if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
          return res.json([]);
        }
        return res.status(500).json({ error: 'DB error', code: err.code, message: err.message });
      }

      // 確保回傳的每筆都有三個欄位（若缺欄位以空字串補足）
      const normalized = (rows || []).map(r => ({
        employee_id: (r.employee_id !== undefined) ? r.employee_id : (r.id !== undefined ? r.id : null),
        employee_name: (r.employee_name !== undefined) ? r.employee_name : '',
        employee_email: (r.employee_email !== undefined) ? r.employee_email : ''
      }));

      console.log(`[INFO] /api/employees returned ${normalized.length} rows (selected: ${select})`);
      res.json(normalized);
    });
  });
});

// 設備使用率、訂單完成率、系統運行狀態
app.get('/api/system-status', (req, res) => {
  connCharger.query(
    'SELECT COUNT(*) AS total, SUM(status IN ("1","2","3")) AS used FROM charger',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const total = rows[0].total || 1;
      const used = rows[0].used || 0;
      connCharger.query(
        'SELECT COUNT(*) AS totalOrders, SUM(order_status=2) AS completedOrders FROM order_record',
        [],
        (err2, rows2) => {
          const totalOrders = rows2?.[0]?.totalOrders || 1;
          const completedOrders = rows2?.[0]?.completedOrders || 0;
          // 系統運行狀態可根據你的需求計算，這裡暫時寫死 0.85
          res.json({
            systemStatus: 0.85,
            deviceUsage: used / total,
            orderCompletion: completedOrders / totalOrders,
          });
        }
      );
    }
  );
});

// 關閉時優雅斷線
process.on("SIGINT", () => {
  console.log("\n關閉連線並結束程式...");
  connCharger.end(() => {
    connBank.end(() => process.exit(0));
  });
});

// 處理 DB 錯誤的函式（若需要）
const handleDBError = (res, err) => {
  console.error("DB錯誤:", err);
  return res.status(500).json({ error: "DB error", code: err.code });
};
