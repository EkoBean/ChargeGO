//後端 nodemon server.js
// pkill -f node 停止所有 node 進程防止卡死
import express from 'express';
import cors from 'cors';
import db from '../db.js';
const connect = db;

const app = express.Router();

app.use(cors());
app.use(express.json());

// 健康檢查
app.get('/health', (_req, res) => res.json({ ok: true }));

// === DB 連線：charger_database ===
// var connect = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "",
//   database: "charger_database"
// });

// === DB 連線：bank ===
// 該功能已取消
// var connBank = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "",
//   database: "bank"
// });

import Promise from "bluebird";
global.Promise = Promise;
Promise.promisifyAll(connect);

// 啟動伺服器
// app.listen(3000, () => {
//   console.log("Web伺服器就緒 → http://127.0.0.1:3000");
//   console.log("「Ctrl + C」可結束伺服器程式.");
// });

// 連線 DB（開機檢查）
// connect.connect(function (err) {
//   if (err) {
//     console.error("charger_database 連線失敗：", err && err.code);
//   } else {
//     console.log("charger_database 連線成功");
//     connect.query("SELECT COUNT(*) AS cnt FROM user", (e, r) => {
//       if (e) console.error("user 表查詢失敗：", e.code);
//       else console.log("user 表筆數：", r[0].cnt);
//     });
//   }
// });

// connBank.connect(function (err) {
//   if (err) {
//     console.error("bank 連線失敗：", err && err.code);
//   } else {
//     console.log("bank 連線成功");
//     connBank.query("SELECT COUNT(*) AS cnt FROM credit_card", (e, r) => {
//       if (e) {
//         console.error("credit_card 表查詢失敗：", e.code);
//       } else {
//         console.log("credit_card 表筆數：", r[0].cnt);
//       }
//     });
//   }
// });



// ===== 首頁（導覽）=====
app.get("/", (req, res) => {
  res.send(`
    <h3>伺服器運作正常，試試以下 API：</h3>
    <ul>
      <li><a href="/api/admin/user/list">/api/admin/user/list</a>（charger_database.user）</li>
      <li><a href="/api/admin/sites">/api/admin/sites</a>（站點）</li>
      <li><a href="/api/admin/chargers">/api/admin/chargers</a>（行充含站點）</li>
      <li><a href="/api/admin/orders">/api/admin/orders</a>（訂單含關聯）</li>
      <li><a href="/api/admin/employee_log">/api/admin/employee_log</a>（職員操作紀錄）</li>
      <li><a href="/api/admin/employees">/api/admin/employees</a>（員工清單）</li>
      <li><a href="/api/admin/events">/api/admin/events</a>（活動清單）</li>
    </ul>
  `);
});

// 處理 DB 錯誤的函式（若需要）
const handleDBError = (res, err) => {
  console.error("DB錯誤:", err);
  return res.status(500).json({ error: "DB error", code: err.code });
};

// ===== charger_database 區 =====

// 使用者清單
app.get("/user/list", (req, res) => {
  connect.query(`
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

  connect.query(
    `UPDATE user SET ${sets.join(", ")} WHERE uid = ?`,
    params,
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error", code: err.code });
      if (result.affectedRows === 0) return res.status(404).json({ message: "user not found" });

      connect.query(
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
app.get("/sites", (req, res) => {
  connect.query(`
    SELECT site_id, site_name, country,address, longitude, latitude
    FROM charger_site ORDER BY site_id ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", code: err.code });
    res.json(rows);
  });
});

// 更新站點
app.post("/sites", async (req, res) => {
  const { site_name, country, address, latitude, longitude } = req.body;
  const queryIsert = `
   insert into charger_site (site_id, site_name, country, address, latitude, longitude) values
  (?, ?, ?, ?, ?, ?);
  `
  const queryCheckId = `SELECT site_id FROM charger_site WHERE site_id LIKE ? ORDER BY site_id DESC LIMIT 1`
  // ========= generate site id ============
  // 台灣縣市對應城市代碼
  const countryCode = {
    "基隆市": "KLU",
    "新北市": "TPH",
    "台北市": "TPE",
    "桃園市": "TYC",
    "新竹縣": "HSH",
    "新竹市": "HSC",
    "苗栗縣": "MAL",
    "台中市": "TXG",
    "彰化縣": "CWH",
    "南投縣": "NTO",
    "雲林縣": "YLH",
    "嘉義縣": "CHY",
    "嘉義市": "CYI",
    "台南市": "TNN",
    "高雄市": "KHH",
    "屏東縣": "IUH",
    "宜蘭縣": "ILN",
    "花蓮縣": "HWA",
    "台東縣": "TTT",
    "澎湖縣": "PEH",
    "金門縣": "KMN",
    "連江縣": "LNN"
  };
  async function generateSiteId(connect, country) {
    const prefix = countryCode[country];
    if (!prefix) throw new Error("Invalid country");
    const checkId = await connect.queryAsync(queryCheckId, [`${prefix}%`]);
    if(checkId.length === 0){
      return `${prefix}0001`;
    }
    if (checkId.length > 0) {
      const latestId = checkId[0].site_id;
      const number = parseInt(latestId.slice(3)) + 1;
      const nextId = `${prefix}${number.toString().padStart(4, '0')}`;
      if(!nextId){
        return res.status(505).json({message: "site_id generate failed"})}
      return nextId;
    }
  }
  // ======================================

  // 執行新增
  try {
    const site_id = await generateSiteId(connect, country);
    const insertSite = await connect.queryAsync(queryIsert, [site_id,site_name, country, address, latitude, longitude]);
    if(insertSite.affectedRows === 0){
      return res.status(500).json({message: "insert site failed"})
    }
    return res.json({ message: "site created", site: { site_id, site_name, country, address, latitude, longitude } });
  }
  catch (err) {
    console.error("[ERROR] POST /sites failed:", err);
  }


});
// 編輯站點
app.patch('/sites', async (req, res) => {
  const query =
    `UPDATE charger_site
    SET site_name = ?,
	  country = ?,
	  address = ?,
	  latitude = ?,
	  longitude = ?
    WHERE site_id = ?;`
  const { site_name, country, address, latitude, longitude, site_id } = req.body;

  try {
    const updateSite = await connect.queryAsync(query, [site_name, country, address, latitude, longitude, site_id]);
    if (updateSite.affectedRows === 0) {
      return res.status(404).json({ message: "site not found" });
    }

    return res.json({ message: "site updated", site: req.body });
  }
  catch (err) {
    console.error("[ERROR] PATCH /sites failed:", err);
  }
})

// 修正獲取站點充電器 - 包含即時租借狀態檢查
app.get("/sites/:id/chargers", (req, res) => {
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

  connect.query(q, [site_id], (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /sites/:id/chargers failed:", err);
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
app.get("/chargers", (req, res) => {
  connect.query(`
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
app.get("/orders", (req, res) => {
  console.log('獲取所有訂單請求');

  const selectQuery = `
  SELECT o.order_ID,
   o.uid,
   u.user_name, u.telephone, u.email,
   o.start_date, o.end,
   o.rental_site_id, rs.site_name as rental_site_name,
   o.return_site_id, rts.site_name as return_site_name,
   o.order_status, o.charger_id,
   c.status AS charger_status,
   o.comment, o.total_amount  -- 確認這裡有包含 total_amount
FROM order_record o
LEFT JOIN user u ON o.uid = u.uid
LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
LEFT JOIN charger c ON o.charger_id = c.charger_id
ORDER BY o.order_ID DESC
`;

  connect.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /orders failed:", err);
      return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
    }

    console.log(`查詢到 ${rows.length} 筆訂單，按 order_ID 降序排列`);
    res.json(rows);
  });
});

// 如果您有帶分頁的訂單查詢，也要加上排序
app.get("/orders/page", (req, res) => {
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

  connect.query(q, [limit, offset], (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /orders/page failed:", err);
      return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
    }

    // 同時獲取總數量
    const countQuery = "SELECT COUNT(*) as total FROM order_record";
    connect.query(countQuery, (countErr, countRows) => {
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
app.post("/orders", (req, res) => {
  const { uid, start_date, end, rental_site_id, return_site_id, order_status, charger_id, comment, total_amount } = req.body;

  console.log('接收到新增訂單請求:', req.body);

  // 驗證必要欄位
  if (!uid || !start_date || !rental_site_id || typeof order_status === "undefined" || !charger_id) {
    return res.status(400).json({
      message: "缺少必要欄位 (需要: uid, start_date, rental_site_id, order_status, charger_id)"
    });
  }

  // 檢查用戶是否存在
  connect.query('SELECT user_name FROM user WHERE uid = ?', [uid], (userErr, userRows) => {
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

    connect.query(insertQuery, values, (insertErr, result) => {
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
   o.comment, o.total_amount  -- 確認這裡有包含 total_amount
FROM order_record o
LEFT JOIN user u ON o.uid = u.uid
LEFT JOIN charger_site rs ON o.rental_site_id = rs.site_id
LEFT JOIN charger_site rts ON o.return_site_id = rts.site_id
LEFT JOIN charger c ON o.charger_id = c.charger_id
ORDER BY o.order_ID DESC
`;
      
      connect.query(selectQuery, [result.insertId], (selectErr, orderRows) => {
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

// 修改用戶資訊 API，添加操作記錄
app.put("/users/:uid", (req, res) => {
  const uid = req.params.uid;
  const { user_name, telephone, email, registration_date } = req.body;

  console.log('接收到更新用戶請求:', { uid, ...req.body });
  
  // 先獲取原始用戶資料
  const selectQuery = 'SELECT * FROM user WHERE uid = ?';
  
  connect.query(selectQuery, [uid], (selectErr, originalData) => {
    if (selectErr) {
      console.error('獲取原始用戶資料失敗:', selectErr);
      return res.status(500).json({ error: "獲取用戶資料失敗", message: selectErr.message });
    }
    
    if (originalData.length === 0) {
      return res.status(404).json({ message: "找不到指定用戶" });
    }
    
    const originalUser = originalData[0];
    
    // 建構動態更新語句
    const updateFields = [];
    const updateValues = [];
    const changedFields = [];

    if (user_name !== undefined && user_name !== originalUser.user_name) {
      updateFields.push('user_name = ?');
      updateValues.push(user_name);
      changedFields.push(`姓名: ${originalUser.user_name} → ${user_name}`);
    }
    if (telephone !== undefined && telephone !== originalUser.telephone) {
      updateFields.push('telephone = ?');
      updateValues.push(telephone);
      changedFields.push(`電話: ${originalUser.telephone} → ${telephone}`);
    }
    if (email !== undefined && email !== originalUser.email) {
      updateFields.push('email = ?');
      updateValues.push(email);
      changedFields.push(`信箱: ${originalUser.email} → ${email}`);
    }
    if (registration_date !== undefined && registration_date !== originalUser.registration_date) {
      updateFields.push('registration_date = ?');
      updateValues.push(registration_date);
      changedFields.push(`註冊日期: ${originalUser.registration_date} → ${registration_date}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "沒有提供要更新的欄位" });
    }

    // 添加 uid 到 WHERE 條件
    updateValues.push(uid);

    const updateQuery = `UPDATE user SET ${updateFields.join(', ')} WHERE uid = ?`;

    console.log('執行更新 SQL:', updateQuery);
    console.log('參數:', updateValues);

    connect.query(updateQuery, updateValues, (updateErr, result) => {
      if (updateErr) {
        console.error('更新用戶失敗:', updateErr);
        return res.status(500).json({ error: "更新用戶失敗", code: updateErr.code, message: updateErr.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "找不到指定的用戶" });
      }

      // 查詢並返回完整的用戶資料
      const selectUpdatedQuery = `
        SELECT uid, user_name, telephone, email, registration_date 
        FROM user WHERE uid = ?
      `;

      connect.query(selectUpdatedQuery, [uid], (selectUpdatedErr, userRows) => {
        if (selectUpdatedErr) {
          console.error('查詢更新後用戶失敗:', selectUpdatedErr);
          return res.status(500).json({ error: "查詢更新後用戶失敗", message: selectUpdatedErr.message });
        }

        console.log('用戶更新成功:', userRows[0]);
        res.json({
          user: userRows[0],
          changedFields: changedFields
        });
      });
    });
  });
});

// 設備使用率、訂單完成率、系統運行狀態
app.get('/system-status', (req, res) => {
  connect.query(
    'SELECT COUNT(*) AS total, SUM(status IN ("1","2","3")) AS used FROM charger',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const total = rows[0].total || 1;
      const used = rows[0].used || 0;
      connect.query(
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
  connect.end(() => {
    // connBank.end(() => process.exit(0));
  });
});




// 員工登入 API
app.post('/employee/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('員工登入請求:', { email });
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: '請輸入信箱和密碼' 
    });
  }

  const query = 'SELECT * FROM employee WHERE employee_email = ? AND password = ?';
  
  connect.query(query, [email, password], (err, rows) => {
    if (err) {
      console.error('登入查詢失敗:', err);
      return res.status(500).json({ 
        success: false, 
        message: '資料庫錯誤' 
      });
    }
    
    if (rows.length === 0) {
      console.log('登入失敗: 帳號或密碼錯誤');
      return res.status(401).json({ 
        success: false, 
        message: '帳號或密碼錯誤' 
      });
    }
    
    const employee = rows[0];
    console.log('登入成功:', employee.employee_name);
    
    res.json({
      success: true,
      employee: {
        id: employee.employee_id,
        name: employee.employee_name,
        email: employee.employee_email
      }
    });
  });
});

// 新增：記錄員工操作日誌 API
app.post("/employee_log", (req, res) => {
  const { employee_id, log } = req.body;

  console.log('新增員工操作日誌請求:', req.body);

  // 驗證必要欄位
  if (!employee_id || !log) {
    console.log('缺少必要欄位:', { employee_id, log });
    return res.status(400).json({ 
      error: '缺少必要欄位', 
      message: 'employee_id 和 log 為必填欄位' 
    });
  }

  // 先檢查 employee_log 表結構
  connect.query("DESCRIBE employee_log", (descErr, descResult) => {
    if (descErr) {
      console.error('無法獲取 employee_log 表結構:', descErr);
      return res.status(500).json({ 
        error: '資料表結構錯誤', 
        message: descErr.message 
      });
    }
    
    console.log('employee_log 表結構:', descResult);

    const insertQuery = `
      INSERT INTO employee_log (employee_id, log, employee_log_date)
      VALUES (?, ?, NOW())
    `;

    const values = [employee_id, log];

    console.log('準備執行 SQL:', insertQuery);
    console.log('參數:', values);

    connect.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('新增員工操作日誌失敗:', err);
        console.error('錯誤代碼:', err.code);
        console.error('錯誤訊息:', err.message);
        console.error('SQL 狀態:', err.sqlState);
        console.error('SQL 訊息:', err.sqlMessage);
        
        return res.status(500).json({ 
          error: '新增操作日誌失敗', 
          code: err.code, 
          message: err.message,
          sqlMessage: err.sqlMessage
        });
      }

      console.log('員工操作日誌新增成功, insertId:', result.insertId);
      res.status(201).json({
        message: '操作日誌新增成功',
        log_id: result.insertId
      });
    });
  });
});



// 新增：獲取員工操作日誌 API
app.get("/employee_log", (req, res) => {
  console.log('獲取員工操作日誌請求');

  const q = `
    SELECT 
      el.employee_log_date,
      el.employee_id,
      e.employee_name,
      el.log
    FROM employee_log el
    LEFT JOIN employee e ON el.employee_id = e.employee_id
    ORDER BY el.employee_log_date DESC
  `;

  connect.query(q, [], (err, rows) => {
    if (err) {
      console.error('獲取員工操作日誌失敗:', err);
      return res.status(500).json({ 
        error: '獲取操作日誌失敗', 
        code: err.code, 
        message: err.message 
      });
    }

    console.log(`返回 ${rows.length} 筆員工操作日誌`);
    res.json(rows);
  });
});


// 更新訂單 API，添加更嚴格的日期格式驗證
app.put("/orders/:order_ID", (req, res) => {
  const order_ID = req.params.order_ID;
  const { 
    uid, start_date, end, rental_site_id, return_site_id, order_status, charger_id, comment, 
    total_amount, fee, paid_amount, charge_method, payment_status
  } = req.body;

  console.log('接收到更新租借記錄請求:', { order_ID, ...req.body });
  
  // 嚴格的日期格式驗證和轉換函數
  const validateAndFormatDateTime = (dateStr, fieldName) => {
    if (!dateStr) return null;
    
    console.log(`處理 ${fieldName}:`, dateStr);
    
    // 如果已經是 MySQL 格式，直接返回
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      console.log(`${fieldName} 已是 MySQL 格式:`, dateStr);
      return dateStr;
    }
    
    // 嘗試解析各種可能的日期格式
    let date;
    try {
      if (dateStr.includes('T')) {
        // ISO 8601 格式
        date = new Date(dateStr);
      } else if (dateStr.includes('-') && dateStr.includes(':')) {
        // 可能是其他格式
        date = new Date(dateStr);
      } else {
        throw new Error('不支援的日期格式');
      }
      
      if (isNaN(date.getTime())) {
        throw new Error('無效的日期');
      }
      
      // 轉換為 MySQL DATETIME 格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const mysqlFormat = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      console.log(`${fieldName} 轉換為 MySQL 格式:`, mysqlFormat);
      return mysqlFormat;
      
    } catch (error) {
      console.error(`${fieldName} 格式化錯誤:`, error);
      return null;
    }
  };

  // 建構動態更新語句
  const updateFields = [];
  const updateValues = [];

  // 先獲取原始訂單資料以比較變更
  connect.query('SELECT * FROM order_record WHERE order_ID = ?', [order_ID], (selectErr, originalData) => {
    if (selectErr) {
      console.error('獲取原始訂單資料失敗:', selectErr);
      return res.status(500).json({ error: "獲取訂單資料失敗", message: selectErr.message });
    }
    
    if (originalData.length === 0) {
      return res.status(404).json({ message: "找不到指定訂單" });
    }
    
    const originalOrder = originalData[0];

    if (uid !== undefined && String(uid) !== String(originalOrder.uid)) {
      updateFields.push('uid = ?');
      updateValues.push(uid);
    }
    
    // 處理 start_date - 嚴格驗證
    if (start_date !== undefined) {
      const validatedStartDate = validateAndFormatDateTime(start_date, 'start_date');
      if (validatedStartDate === null && start_date !== null) {
        return res.status(400).json({ 
          error: "start_date 格式錯誤", 
          message: `無法解析日期格式: ${start_date}` 
        });
      }
      
      if (validatedStartDate && validatedStartDate !== originalOrder.start_date) {
        updateFields.push('start_date = ?');
        updateValues.push(validatedStartDate);
      }
    }
    
    // 處理 end - 嚴格驗證
    if (end !== undefined) {
      const validatedEnd = validateAndFormatDateTime(end, 'end');
      if (validatedEnd === null && end !== null) {
        return res.status(400).json({ 
          error: "end 格式錯誤", 
          message: `無法解析日期格式: ${end}` 
        });
      }
      
      if (validatedEnd !== originalOrder.end) {
        updateFields.push('end = ?');
        updateValues.push(validatedEnd);
      }
    }

    // 處理其他欄位...
    if (rental_site_id !== undefined && String(rental_site_id) !== String(originalOrder.rental_site_id)) {
      updateFields.push('rental_site_id = ?');
      updateValues.push(rental_site_id);
    }
    
    if (return_site_id !== undefined && String(return_site_id) !== String(originalOrder.return_site_id)) {
      updateFields.push('return_site_id = ?');
      updateValues.push(return_site_id);
    }
    
    if (order_status !== undefined && String(order_status) !== String(originalOrder.order_status)) {
      updateFields.push('order_status = ?');
      updateValues.push(order_status);
    }
    
    if (charger_id !== undefined && String(charger_id) !== String(originalOrder.charger_id)) {
      updateFields.push('charger_id = ?');
      updateValues.push(charger_id);
    }
    
    if (comment !== undefined && comment !== originalOrder.comment) {
      updateFields.push('comment = ?');
      updateValues.push(comment);
    }
    
    if (total_amount !== undefined && String(total_amount) !== String(originalOrder.total_amount)) {
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

    connect.query(updateQuery, updateValues, (updateErr, result) => {
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

      connect.query(selectQuery, [order_ID], (selectErr, orderRows) => {
        if (selectErr) {
          console.error('查詢更新後訂單失敗:', selectErr);
          return res.status(500).json({ error: "查詢更新後訂單失敗", code: selectErr.code, message: selectErr.message });
        }

        console.log('訂單更新成功:', orderRows[0]);
        res.json(orderRows[0]);
      });
    });
  });
});

// 修正獲取所有活動 - 移除可能不存在的 creator_id 欄位
app.get("/events", (req, res) => {
  console.log('開始查詢活動資料...'); // 加入 debug 日誌

  connect.query(`
    SELECT e.event_id, 
           e.event_title, 
           e.event_content, 
           e.site_id, 
           e.event_start_date, 
           e.event_end_date,
           IFNULL(s.site_name, '全站活動') as site_name
    FROM event e
    LEFT JOIN charger_site s ON e.site_id = s.site_id
    ORDER BY e.event_id DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({
        error: '獲取活動資料失敗',
        details: err.message,
        code: err.code
      });
    }
    console.log('成功獲取活動資料, 筆數:', rows.length);
    console.log('活動資料:', rows);
    res.json(rows);
  });
});

// 修改新增活動 
app.post("/events", (req, res) => {
  const { 
    event_title, 
    event_content, 
    site_id, 
    event_start_date, 
    event_end_date, 
    operator_id 
  } = req.body;

  console.log('接收到新增活動請求:', req.body);
  console.log('操作者ID:', operator_id);

  if (!operator_id) {
    console.error('缺少操作者ID');
    return res.status(400).json({ error: '缺少操作者ID' });
  }

  // 1. 先建立活動
  const eventQuery = `
    INSERT INTO event (event_title, event_content, site_id, event_start_date, event_end_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  const eventValues = [
    event_title, 
    event_content, 
    site_id || null, 
    event_start_date, 
    event_end_date
  ];

  connect.query(eventQuery, eventValues, (err, result) => {
    if (err) {
      console.error('建立活動失敗:', err);
      
      // 記錄失敗操作
      const logContent = `CREATE_EVENT-{"title":"${event_title.substring(0, 20)}","status":"failed"}`;
      const logQuery = `
        INSERT INTO employee_log (employee_id, log, employee_log_date)
        VALUES (?, ?, NOW())
      `;
      
      connect.query(logQuery, [operator_id, logContent]);
      return res.status(500).json({ error: '建立活動失敗', message: err.message });
    }

    const eventId = result.insertId;
    
    // 2. 記錄操作日誌
    const logContent = `CREATE_EVENT-{"event_id":${eventId},"title":"${event_title.substring(0, 20)}","status":"success"}`;
    const logQuery = `
      INSERT INTO employee_log (employee_id, log, employee_log_date)
      VALUES (?, ?, NOW())
    `;
    
    connect.query(logQuery, [operator_id, logContent], (logErr) => {
      if (logErr) {
        console.error('記錄操作日誌失敗:', logErr);
      }
      
      // 3. 無論日誌是否記錄成功，都返回活動建立成功的訊息
      res.status(201).json({ 
        success: true,
        event_id: eventId,
        message: '活動建立成功'
      });
    });
  });
});

// 更新活動
app.put("/events/:id", (req, res) => {
  const eventId = req.params.id;
  const { event_title, event_content, site_id, event_start_date, event_end_date } = req.body;

  // 動態生成 SET 子句
  const sets = [];
  const params = [];

  if (event_title !== undefined) {
    sets.push('event_title = ?');
    params.push(event_title);
  }
  if (event_content !== undefined) {
    sets.push('event_content = ?');
    params.push(event_content);
  }
  if (site_id !== undefined) {
    sets.push('site_id = ?');
    params.push(site_id || null);
  }
  if (event_start_date !== undefined) {
    sets.push('event_start_date = ?');
    params.push(event_start_date);
  }
  if (event_end_date !== undefined) {
    sets.push('event_end_date = ?');
    params.push(event_end_date);
  }

  if (!sets.length) {
    return res.status(400).json({ error: '請提供至少一個要更新的欄位' });
  }

  params.push(eventId);

  connect.query(`
    UPDATE event SET ${sets.join(', ')} WHERE event_id = ?
  `, params, (err, result) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ error: '更新活動失敗' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到要更新的活動' });
    }
    res.json({ message: '活動更新成功' });
  });
});

// 刪除活動
app.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;

  connect.query('DELETE FROM event WHERE event_id = ?', [eventId], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ error: '刪除活動失敗' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到要刪除的活動' });
    }
    res.json({ message: '活動刪除成功' });
  });
});

// 新增：發送活動給用戶的 API
app.post("/events/:id/send", (req, res) => {
  const eventId = req.params.id;
  const { targetUsers } = req.body; // 'all' 或 [uid1, uid2, ...]

  console.log(`準備發送活動 ${eventId} 給用戶:`, targetUsers);

  // 先獲取活動詳情
  connect.query(
    'SELECT * FROM event WHERE event_id = ?',
    [eventId],
    (err, eventResult) => {
      if (err || eventResult.length === 0) {
        return res.status(404).json({ error: '活動不存在' });
      }

      const event = eventResult[0];

      // 根據目標用戶類型獲取用戶列表
      let userQuery = '';
      let userParams = [];

      if (targetUsers === 'all') {
        userQuery = 'SELECT uid FROM user WHERE blacklist = 0'; // 排除黑名單用戶
      } else if (Array.isArray(targetUsers)) {
        userQuery = `SELECT uid FROM user WHERE uid IN (${targetUsers.map(() => '?').join(',')}) AND blacklist = 0`;
        userParams = targetUsers;
      } else {
        return res.status(400).json({ error: '無效的目標用戶參數' });
      }

      // 獲取目標用戶
      connect.query(userQuery, userParams, (err, users) => {
        if (err) {
          console.error('獲取用戶列表失敗:', err);
          return res.status(500).json({ error: '獲取用戶列表失敗' });
        }

        if (users.length === 0) {
          return res.status(400).json({ error: '沒有找到符合條件的用戶' });
        }

        // 準備插入通知的資料
        const notices = users.map(user => [
          user.uid,
          event.event_title,
          event.event_content,
          new Date() // notice_date
        ]);

        // 批次插入通知
        const insertQuery = 'INSERT INTO notice (uid, notice_title, notice_content, notice_date) VALUES ?';

        connect.query(insertQuery, [notices], (err, result) => {
          if (err) {
            console.error('插入通知失敗:', err);
            return res.status(500).json({ error: '發送活動失敗' });
          }

          console.log(`成功發送活動給 ${users.length} 位用戶`);
          res.json({
            message: `活動已成功發送給 ${users.length} 位用戶`,
            sentCount: users.length,
            insertedNotices: result.affectedRows
          });
        });
      });
    }
  );
});

// 新增：獲取用戶列表 API（用於選擇發送對象）
app.get("/users/active", (req, res) => {
  connect.query(`
    SELECT uid, user_name, email, telephone
    FROM user 
    WHERE blacklist = 0
    ORDER BY uid ASC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching active users:', err);
      return res.status(500).json({ error: '獲取用戶列表失敗' });
    }
    res.json(rows);
  });
});

// 新增：獲取所有用戶列表（包含狀態）- 用於SendEventModal
app.get("/users", (req, res) => {
  console.log('查詢所有用戶列表...');

  connect.query(`
    SELECT uid as user_id, uid, user_name, telephone, email, address, 
           CASE 
             WHEN blacklist = 1 THEN 'blacklist'
             ELSE 'normal'
           END as status,
           blacklist, wallet, point, total_carbon_footprint
    FROM user 
    ORDER BY uid ASC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: '獲取用戶列表失敗', code: err.code });
    }
    console.log('用戶列表查詢成功，筆數:', rows.length);
    res.json(rows);
  });
});

// 新增：取得單一用戶（供前端 GET /users/:uid 使用）
app.get("/users/:uid", (req, res) => {
  const uid = req.params.uid;
  if (!uid) return res.status(400).json({ message: "缺少 uid" });

  connect.query(
    `SELECT uid, user_name, telephone, email, address, blacklist, wallet, point, total_carbon_footprint
     FROM user WHERE uid = ? LIMIT 1`,
    [uid],
    (err, rows) => {
      if (err) {
        console.error("[ERROR] GET /users/:uid failed:", err);
        return res.status(500).json({ error: "DB error", code: err.code, message: err.message });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "user not found" });
      }
      res.json(rows[0]);
    }
  );
});

// 新增：獲取活動發送統計
app.get("/events/send-counts", (req, res) => {
  console.log('查詢活動發送統計...');

  // 查詢每個活動的通知發送數量
  connect.query(`
    SELECT 
      e.event_id,
      COUNT(n.notice_id) as send_count
    FROM event e
    LEFT JOIN notice n ON n.notice_title = e.event_title
    GROUP BY e.event_id
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching send counts:', err);
      // 如果查詢失敗，返回空對象
      return res.json({});
    }

    // 轉換為 { event_id: count } 格式
    const counts = {};
    rows.forEach(row => {
      counts[row.event_id] = row.send_count || 0;
    });

    console.log('活動發送統計:', counts);
    res.json(counts);
  });
});

// 新增：發送活動通知 API
app.post("/events/send-notification", async (req, res) => {
  const { event_id, user_ids, operator_id, send_all, status_filter } = req.body;

  console.log('接收到發送活動通知請求:', {
    event_id,
    user_ids,
    operator_id,
    send_all,
    status_filter
  });

  try {
    // 1. 先獲取活動詳情
    const [event] = await connect.queryAsync(
      'SELECT * FROM event WHERE event_id = ?',
      [event_id]
    );

    if (!event) {
      return res.status(404).json({ error: '找不到指定活動' });
    }

    // 2. 根據發送類型構建用戶查詢
    let userQuery = '';
    let userParams = [];

    if (send_all) {
      // 全部用戶情況
      switch (status_filter) {
        case 'normal':
          userQuery = 'SELECT uid, user_name FROM user WHERE blacklist = 0';
          break;
        case 'blacklist':
          userQuery = 'SELECT uid, user_name FROM user WHERE blacklist = 1';
          break;
        default:
          userQuery = 'SELECT uid, user_name FROM user';
      }
    } else if (Array.isArray(user_ids) && user_ids.length > 0) {
      // 指定用戶情況
      userQuery = `SELECT uid, user_name FROM user WHERE uid IN (${user_ids.map(() => '?').join(',')})`;
      userParams = user_ids;
    } else {
      return res.status(400).json({ error: '無效的發送參數' });
    }

    // 3. 查詢目標用戶
    console.log('執行用戶查詢:', userQuery, userParams);
    const users = await connect.queryAsync(userQuery, userParams);

    if (users.length === 0) {
      return res.status(400).json({ error: '沒有找到符合條件的用戶' });
    }

    // 4. 準備批次插入通知
    const noticeValues = users.map(user => [
      user.uid,
      `活動通知：${event.event_title}`,
      event.event_content,
      new Date()
    ]);

    // 5. 插入通知記錄
    const noticeResult = await connect.queryAsync(
      'INSERT INTO notice (uid, notice_title, notice_content, notice_date) VALUES ?',
      [noticeValues]
    );

    // 6. 記錄操作日誌
    const logContent = `SEND_EVENT-${JSON.stringify({
      event_id: event.event_id,
      title: event.event_title,
      users: users.length,
      type: send_all ? 'all' : 'selected',
      status: 'success'
    })}`;

    await connect.queryAsync(
      'INSERT INTO employee_log (employee_id, log, employee_log_date) VALUES (?, ?, NOW())',
      [operator_id, logContent]
    );

    // 7. 返回成功響應
    console.log(`成功發送活動通知給 ${users.length} 位用戶`);
    res.json({
      success: true,
      message: `活動通知發送成功`,
      sent_count: users.length,
      event_title: event.event_title
    });

  } catch (err) {
    console.error('發送活動通知失敗:', err);
    res.status(500).json({ 
      error: '發送活動通知失敗', 
      message: err.message 
    });
  }
});

// 新增：獲取活動詳細發送記錄 API（可選）
app.get("/events/:id/send-history", (req, res) => {
  const eventId = req.params.id;

  console.log(`查詢活動 ${eventId} 的發送記錄`);

  connect.query(`
    SELECT n.notice_id, n.uid, u.user_name, n.notice_date
    FROM notice n
    LEFT JOIN user u ON n.uid = u.uid
    LEFT JOIN event e ON n.notice_title LIKE CONCAT('活動通知：', e.event_title)
    WHERE e.event_id = ?
    ORDER BY n.notice_date DESC
  `, [eventId], (err, rows) => {
    if (err) {
      console.error('查詢發送記錄失敗:', err);
      return res.status(500).json({ error: '查詢發送記錄失敗' });
    }

    console.log(`活動 ${eventId} 的發送記錄筆數:`, rows.length);
    res.json(rows);
  });
});

// 任務 (missions) 清單
app.get("/missions", (req, res) => {
  console.log('GET /missions');
  const q = `
    SELECT 
      mission_id,
      title,
      description,
      type,
      reward_points,
      target_value,
      target_unit,
      mission_start_date,
      mission_end_date,
      created_at
    FROM missions
    ORDER BY mission_id DESC
  `;
  connect.query(q, [], (err, rows) => {
    if (err) {
      console.error('Error fetching missions:', err);
      return res.status(500).json({ error: '獲取任務列表失敗', details: err.message });
    }
    res.json(rows);
  });
});


// 新增任務
app.post("/missions", (req, res) => {
  const { title, description, type, reward_points, target_value, target_unit, mission_start_date, mission_end_date } = req.body;

  console.log('接收到新增任務請求:', req.body);

  // 基本驗證
  if (!title || !description) {
    return res.status(400).json({ error: '任務標題不能為空; 任務內容不能為空' });
  }

  if (!reward_points || reward_points <= 0) {
    return res.status(400).json({ error: '獎勵點數必須大於 0' });
  }

  if (!target_value || target_value <= 0) {
    return res.status(400).json({ error: '目標數值必須大於 0' });
  }

  const insertQuery = `
    INSERT INTO missions (title, description, type, reward_points, target_value, target_unit, mission_start_date, mission_end_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    title,
    description,
    type || 'accumulated_hours',
    parseInt(reward_points),
    parseInt(target_value),
    target_unit || 'Hours',
    mission_start_date || null,
    mission_end_date || null
  ];

  console.log('執行插入 SQL:', insertQuery);
  console.log('參數:', values);

  connect.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error creating mission:', err);
      return res.status(500).json({
        error: '建立任務失敗',
        details: err.message,
        code: err.code
      });
    }

    console.log('任務建立成功, ID:', result.insertId);

    // 回傳新建立的任務資料
    connect.query(
      'SELECT * FROM missions WHERE mission_id = ?',
      [result.insertId],
      (selectErr, selectResult) => {
        if (selectErr) {
          console.error('查詢新建任務失敗:', selectErr);
          return res.status(500).json({ error: '查詢新建任務失敗' });
        }

        res.status(201).json({
          mission_id: result.insertId,
          message: '任務建立成功',
          mission: selectResult[0]
        });
      }
    );
  });
});

// 修正：獲取所有員工清單 - 配合實際資料庫結構
app.get("/employees", (req, res) => {
  console.log('獲取員工清單請求');

  const q = `
    SELECT employee_id, employee_name, employee_email
    FROM employee
    ORDER BY employee_id ASC
  `;

  console.log('執行 SQL:', q);

  connect.query(q, (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /employees failed:", err);
      return res.status(500).json({ 
        error: "資料庫查詢錯誤", 
        code: err.code, 
        message: err.message
      });
    }

    console.log(`成功查詢到 ${rows.length} 筆員工資料`);
    console.log('員工資料:', rows);
    
    // 移除敏感的密碼資訊，並添加預設值
    const safeEmployees = rows.map(emp => ({
      employee_id: emp.employee_id,
      employee_name: emp.employee_name,
      employee_email: emp.employee_email,
      job_title: '員工', // 預設值
      department: '一般部門', // 預設值
      entry_date: null, // 預設值
      status: 'active', // 預設值
      last_login: null // 預設值
    }));

    res.json(safeEmployees);
  });
});

// 修正：獲取員工操作紀錄 - 配合實際資料庫結構
app.get("/employee_log", (req, res) => {
  console.log('獲取員工操作紀錄請求');

  const q = `
    SELECT el.employee_log_date, el.employee_id, el.log,
           e.employee_name, e.employee_email
    FROM employee_log el
    LEFT JOIN employee e ON el.employee_id = e.employee_id
    ORDER BY el.employee_log_date DESC
    LIMIT 100
  `;

  connect.query(q, (err, rows) => {
    if (err) {
      console.error("[ERROR] GET /employee_log failed:", err);
      return res.status(500).json({ 
        error: "資料庫查詢錯誤", 
        code: err.code, 
        message: err.message
      });
    }

    console.log(`成功查詢到 ${rows.length} 筆員工操作紀錄`);
    
    // 將資料格式化為前端期望的格式
    const formattedLogs = rows.map(log => ({
      log_id: log.employee_id + '_' + log.employee_log_date, // 生成唯一 ID
      employee_id: log.employee_id,
      action: log.log,
      action_time: log.employee_log_date,
      target_table: null, // 您的表沒有這個欄位
      target_id: null, // 您的表沒有這個欄位
      description: log.log,
      employee_name: log.employee_name,
      employee_email: log.employee_email
    }));

    res.json(formattedLogs);
  });
});

// 修正：新增員工 - 配合實際資料庫結構
app.post("/employees", (req, res) => {
  const { employee_name, employee_email, password } = req.body;

  console.log('接收到新增員工請求:', req.body);

  // 驗證必要欄位
  if (!employee_name || !employee_email || !password) {
    return res.status(400).json({
      message: "缺少必要欄位 (需要: employee_name, employee_email, password)"
    });
  }

  // 檢查員工 email 是否已存在
  connect.query('SELECT employee_id FROM employee WHERE employee_email = ?', [employee_email], (checkErr, checkRows) => {
    if (checkErr) {
      console.error('檢查員工 email 失敗:', checkErr);
      return res.status(500).json({ error: "資料庫錯誤", code: checkErr.code });
    }

    if (checkRows.length > 0) {
      return res.status(400).json({ message: "該 email 已被使用" });
    }

    // 插入新員工 - 只使用實際存在的欄位
    const insertQuery = `
      INSERT INTO employee (employee_name, employee_email, password)
      VALUES (?, ?, ?)
    `;

    const values = [employee_name, employee_email, password];

    connect.query(insertQuery, values, (insertErr, result) => {
      if (insertErr) {
        console.error('插入員工失敗:', insertErr);
        return res.status(500).json({ error: "新增員工失敗", code: insertErr.code });
      }

      console.log('員工新增成功, ID:', result.insertId);
      res.status(201).json({
        employee_id: result.insertId,
        message: '員工新增成功'
      });
    });
  });
});

// 修正：更新員工 - 配合實際資料庫結構
app.put("/employees/:id", (req, res) => {
  const employeeId = req.params.id;
  const { employee_name, employee_email } = req.body;

  console.log('接收到更新員工請求:', { employeeId, ...req.body });

  const updateFields = [];
  const updateValues = [];

  if (employee_name !== undefined) {
    updateFields.push('employee_name = ?');
    updateValues.push(employee_name);
  }
  if (employee_email !== undefined) {
    updateFields.push('employee_email = ?');
    updateValues.push(employee_email);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "沒有提供要更新的欄位" });
  }

  updateValues.push(employeeId);

  const updateQuery = `UPDATE employee SET ${updateFields.join(', ')} WHERE employee_id = ?`;

  connect.query(updateQuery, updateValues, (err, result) => {
    if (err) {
      console.error('更新員工失敗:', err);
      return res.status(500).json({ error: "更新員工失敗", code: err.code });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到指定的員工" });
    }

    console.log('員工更新成功');
    res.json({ message: '員工更新成功' });
  });
});

// 刪除員工保持不變，因為使用的是主鍵
app.delete("/employees/:id", (req, res) => {
  const employeeId = req.params.id;

  console.log('接收到刪除員工請求, ID:', employeeId);

  connect.query('DELETE FROM employee WHERE employee_id = ?', [employeeId], (err, result) => {
    if (err) {
      console.error('刪除員工失敗:', err);
      return res.status(500).json({ error: "刪除員工失敗", code: err.code });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到要刪除的員工" });
    }

    console.log('員工刪除成功');
    res.json({ message: '員工刪除成功' });
  });
});



export default app;