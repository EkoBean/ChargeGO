import mysql from 'mysql';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // 請填入你的密碼
    database: 'charger_database'
});

db.connect(err => {
    if (err) {
        console.error('MySQL 連線失敗:', err);
    } else {
        console.log('MySQL 連線成功');
    }
});

export default db;
