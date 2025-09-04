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

// 修正獲取站點充電器 - 包含即時租借狀態檢查
app.get("/api/sites/:id/chargers", (req, res) => {
  const site_id = req.params.id;
  
  console.log(`查詢站點 ${site_id} 的充電器及租借狀態`);
  
  const q = `
    SELECT c.*,
           CASE 
             WHEN active_orders.charger_id IS NOT NULL THEN 1 
             ELSE 0 
           END as is_rented,
           active_orders.uid as current_renter_uid,
           u.user_name as current_renter,
           active_orders.start_date as rented_since,
           active_orders.order_ID as current_order_id,
           active_orders.order_status as current_order_status
    FROM charger c
    LEFT JOIN (
      SELECT charger_id, uid, start_date, order_ID, order_status
      FROM order_record 
      WHERE order_status = '0' 
        AND (end IS NULL OR end > NOW())
    ) active_orders ON c.charger_id = active_orders.charger_id
    LEFT JOIN user u ON active_orders.uid = u.uid
    WHERE c.site_id = ?
    ORDER BY c.charger_id ASC
  `;
  
  connCharger.query(q, [site_id], (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /api/sites/:id/chargers failed:", err);
      return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
    }
    
    console.log(`站點 ${site_id} 充電器查詢結果:`, rows.map(r => ({
      charger_id: r.charger_id,
      status: r.status,
      is_rented: r.is_rented,
      current_renter: r.current_renter,
      current_order_id: r.current_order_id
    })));
    
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

// 修正獲取所有訂單 - 按 order_ID 降序排列（最新的在上面）
app.get("/api/orders", (req, res) => {
  console.log('獲取所有訂單請求');
  
  const q = `
    SELECT o.order_ID,
           o.uid,
           u.user_name, u.telephone, u.email,
           o.start_date, o.end,
           o.rental_site_id, rs.site_name as rental_site_name,
           o.return_site_id, rts.site_name as return_site_name,
           o.order_status, o.charger_id,
           c.status AS charger_status,
           o.comment, o.total_amount 
    FROM order_record o
    LEFT JOIN user u ON o.uid = u.uid
    LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
    LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
    LEFT JOIN charger c ON o.charger_id = c.charger_id
    ORDER BY o.order_ID DESC
  `;
  
  connCharger.query(q, (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /api/orders failed:", err);
      return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
    }
    
    console.log(`查詢到 ${rows.length} 筆訂單，按 order_ID 降序排列`);
    res.json(rows);
  });
});

// 如果您有帶分頁的訂單查詢，也要加上排序
app.get("/api/orders/page", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  
  console.log(`獲取訂單分頁請求 - 頁數: ${page}, 每頁: ${limit}`);
  
  const q = `
    SELECT o.order_ID,
           o.uid,
           u.user_name, u.telephone, u.email,
           o.start_date, o.end,
           o.rental_site_id, rs.site_name as rental_site_name,
           o.return_site_id, rts.site_name as return_site_name,
           o.order_status, o.charger_id,
           c.status AS charger_status,
           o.comment, o.total_amount 
    FROM order_record o
    LEFT JOIN user u ON o.uid = u.uid
    LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
    LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
    LEFT JOIN charger c ON o.charger_id = c.charger_id
    ORDER BY o.order_ID DESC
    LIMIT ? OFFSET ?
  `;
  
  connCharger.query(q, [limit, offset], (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /api/orders/page failed:", err);
      return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
    }
    
    // 同時獲取總數量
    const countQuery = "SELECT COUNT(*) as total FROM order_record";
    connCharger.query(countQuery, (countErr, countRows) => {
      if (countErr) {
        console.error("[ERROR] Count orders failed:", countErr);
        return res.status(500).json({ error: "Count error", code: countErr.code, message: countErr.message });
      }
      
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit);
      
      console.log(`返回第 ${page} 頁訂單，共 ${total} 筆，${totalPages} 頁`);
      
      res.json({
        orders: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: total,
          limit: limit
        }
      });
    });
  });
});

// 新增訂單 - 最終版本
app.post("/api/orders", (req, res) => {
  const { uid, start_date, end, rental_site_id, return_site_id, order_status, charger_id, comment, total_amount } = req.body;
  
  console.log('接收到新增訂單請求:', req.body);
  
  // 驗證必要欄位
  if (!uid || !start_date || !rental_site_id || typeof order_status === "undefined" || !charger_id) {
    return res.status(400).json({ 
      message: "缺少必要欄位 (需要: uid, start_date, rental_site_id, order_status, charger_id)" 
    });
  }

  // 檢查用戶是否存在
  connCharger.query('SELECT user_name FROM user WHERE uid = ?', [uid], (userErr, userRows) => {
    if (userErr) {
      console.error('查詢用戶失敗:', userErr);
      return res.status(500).json({ error: "DB error", code: userErr.code, message: userErr.message });
    }
    
    if (userRows.length === 0) {
      return res.status(400).json({ message: "用戶不存在" });
    }

    // 插入訂單資料
    const insertQuery = `
      INSERT INTO order_record (uid, start_date, end, rental_site_id, return_site_id, order_status, charger_id, comment, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      uid, 
      start_date, 
      end || null, 
      rental_site_id, 
      return_site_id || null, 
      order_status, 
      charger_id, 
      comment || null,
      total_amount || 0
    ];
    
    console.log('執行插入 SQL:', insertQuery);
    console.log('參數:', values);
    
    connCharger.query(insertQuery, values, (insertErr, result) => {
      if (insertErr) {
        console.error('插入訂單失敗:', insertErr);
        return res.status(500).json({ error: "插入訂單失敗", code: insertErr.code, message: insertErr.message });
      }
      
      // 查詢並返回完整的訂單資料
      const selectQuery = `
        SELECT o.order_ID,
               o.uid,
               u.user_name, u.telephone, u.email,
               o.start_date, o.end,
               o.rental_site_id, rs.site_name as rental_site_name,
               o.return_site_id, rts.site_name as return_site_name,
               o.order_status, o.charger_id,
               c.status AS charger_status,
               o.comment, o.total_amount 
        FROM order_record o
        LEFT JOIN user u ON o.uid = u.uid
        LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
        LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
        LEFT JOIN charger c ON o.charger_id = c.charger_id
        WHERE o.order_ID = ?
      `;
      
      connCharger.query(selectQuery, [result.insertId], (selectErr, orderRows) => {
        if (selectErr) {
          console.error('查詢新建訂單失敗:', selectErr);
          return res.status(500).json({ error: "查詢新建訂單失敗", code: selectErr.code, message: selectErr.message });
        }
        
        console.log('訂單新增成功:', orderRows[0]);
        res.status(201).json(orderRows[0]);
      });
    });
  });
});

// 獲取用戶資訊（用於新增訂單時自動帶入用戶名稱）- 加強 debug
app.get("/api/users/:uid", (req, res) => {
  const uid = req.params.uid;
  console.log('查詢用戶 ID:', uid, typeof uid); // 加入 debug 日誌
  
  connCharger.query(
    'SELECT uid, user_name, telephone, email FROM user WHERE uid = ?',
    [uid],
    (err, rows) => {
      if (err) {
        console.error('查詢用戶失敗:', err);
        return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
      }
      
      console.log('用戶查詢結果:', rows); // 加入 debug 日誌
      
      if (rows.length === 0) {
        console.log('找不到用戶 ID:', uid);
        return res.status(404).json({ message: "用戶不存在" });
      }
      
      console.log('找到用戶:', rows[0]);
      res.json(rows[0]);
    }
  );
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

// 員工登入
app.post('/api/employee/login', (req, res) => {
  const { email, password } = req.body;
  connCharger.query(
    'SELECT * FROM employee WHERE employee_email = ? AND password = ?',
    [email, password],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: '資料庫錯誤' });
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
      }
      res.json({
        success: true,
        employee: {
          id: rows[0].employee_id,
          name: rows[0].employee_name,
          email: rows[0].employee_email
        }
      });
    }
  );
});

// 更新訂單
app.put("/api/orders/:order_ID", (req, res) => {
  const order_ID = req.params.order_ID;
  const { uid, start_date, end, rental_site_id, return_site_id, order_status, charger_id, comment, total_amount } = req.body;
  
  console.log('接收到更新訂單請求:', { order_ID, ...req.body });
  
  // 建構動態更新語句
  const updateFields = [];
  const updateValues = [];
  
  if (uid !== undefined) {
    updateFields.push('uid = ?');
    updateValues.push(uid);
  }
  if (start_date !== undefined) {
    updateFields.push('start_date = ?');
    updateValues.push(start_date);
  }
  if (end !== undefined) {
    updateFields.push('end = ?');
    updateValues.push(end);
  }
  if (rental_site_id !== undefined) {
    updateFields.push('rental_site_id = ?');
    updateValues.push(rental_site_id);
  }
  if (return_site_id !== undefined) {
    updateFields.push('return_site_id = ?');
    updateValues.push(return_site_id);
  }
  if (order_status !== undefined) {
    updateFields.push('order_status = ?');
    updateValues.push(order_status);
  }
  if (charger_id !== undefined) {
    updateFields.push('charger_id = ?');
    updateValues.push(charger_id);
  }
  if (comment !== undefined) {
    updateFields.push('comment = ?');
    updateValues.push(comment);
  }
  if (total_amount !== undefined) {
    updateFields.push('total_amount = ?');
    updateValues.push(total_amount);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ message: "沒有提供要更新的欄位" });
  }
  
  // 添加 order_ID 到 WHERE 條件
  updateValues.push(order_ID);
  
  const updateQuery = `
    UPDATE order_record 
    SET ${updateFields.join(', ')} 
    WHERE order_ID = ?
  `;
  
  console.log('執行更新 SQL:', updateQuery);
  console.log('參數:', updateValues);
  
  connCharger.query(updateQuery, updateValues, (updateErr, result) => {
    if (updateErr) {
      console.error('更新訂單失敗:', updateErr);
      return res.status(500).json({ error: "更新訂單失敗", code: updateErr.code, message: updateErr.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到指定的訂單" });
    }
    
    // 查詢並返回完整的訂單資料
    const selectQuery = `
      SELECT o.order_ID,
             o.uid,
             u.user_name, u.telephone, u.email,
             o.start_date, o.end,
             o.rental_site_id, rs.site_name as rental_site_name,
             o.return_site_id, rts.site_name as return_site_name,
             o.order_status, o.charger_id,
             c.status AS charger_status,
             o.comment, o.total_amount 
      FROM order_record o
      LEFT JOIN user u ON o.uid = u.uid
      LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
      LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
      LEFT JOIN charger c ON o.charger_id = c.charger_id
      WHERE o.order_ID = ?
    `;
    
    connCharger.query(selectQuery, [order_ID], (selectErr, orderRows) => {
      if (selectErr) {
        console.error('查詢更新後訂單失敗:', selectErr);
        return res.status(500).json({ error: "查詢更新後訂單失敗", code: selectErr.code, message: selectErr.message });
      }
      
      console.log('訂單更新成功:', orderRows[0]);
      res.json(orderRows[0]);
    });
  });
});
