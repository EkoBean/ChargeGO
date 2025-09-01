import express, { json, urlencoded } from 'express';
const app = express();
import cors from 'cors';

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

// ================== mySql define ====================
import { createConnection } from 'mysql';
const connection = createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'charger_database'
});

// bluebird for promise
import Promise from "bluebird";
global.Promise = Promise;
Promise.promisifyAll(connection);


//============= mySql DB connect and error handling ==============
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
});

app.listen(3000, () => {
    console.log('click to open http://localhost:3000');
});

// ================== db query ====================
// lookup all stations
const selectAllStations = `SELECT * from charger_site`;
// lookup info window data
const selectInfoWindow = `
SELECT cs.site_id, cs.site_name, cs.address, c.charger_id, c.status
from charger_site as cs
LEFT JOIN charger as c ON c.site_id = cs.site_id
WHERE cs.site_id = ?`;
// rent a charger
const searchCharger = `SELECT * from charger 
WHERE charger_id = ?`;
const checkUser = `SELECT order_ID, uid,order_status, start_date FROM order_record WHERE uid = ? AND order_status = '0'`
const checkDeviceOwner = `
SELECT o.order_ID,o.uid as renterUid, c.charger_id,c.status, o.start_date as cherger_status from charger as c
LEFT JOIN order_record as o ON c.charger_id = o.charger_id
WHERE c.charger_id = ? and o.order_status = '0'  
ORDER BY o.start_date DESC 
LIMIT 1;
`;
const rentCharger = `UPDATE charger SET status = '1', site_id = null WHERE charger_id = ? `;
const rentalLog = `INSERT INTO order_record (uid, start_date, rental_site_id, order_status, charger_id) VALUES (?, ?, ?, '0', ?);
`;

// return a charger
const returnCharger = `UPDATE charger SET status = ?, site_id = ? WHERE charger_id = ?`;
const returnLog = `UPDATE order_record SET order_status = '1', return_site_id = ?,  end = ?, comment = ? WHERE charger_id = ? AND order_status = '0'`;
const getRentalTime = `SELECT order_ID, uid,order_status,charger_id, start_date, end  FROM order_record WHERE uid = ? AND order_status = ? AND charger_id = ? ORDER BY end || start_date DESC LIMIT 1;`;
const overTImeReturn = `UPDATE user SET blacklist = blacklist +1
WHERE uid = ?; `



// ================== main API ====================
// get all stations
app.get('/api/stations', (req, res) => {
    connection.query(selectAllStations, (error, results) => {
        if (error) {
            console.error('Error fetching stations:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// get info window data
app.get('/api/infoWindow/:siteId', (req, res) => {
    const siteId = req.params.siteId;
    connection.query(selectInfoWindow, [siteId], (error, results) => {
        if (error) {
            console.error('Error fetching stations:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// check user rental status
app.get('/api/checkRental/:uid', (req, res) => {
    const uid = req.params.uid;
    connection.query(checkUser, [uid], (error, results) => {
        if (error) {
            console.error('Error fetching user rental status:', error);
            return res.status(500).json({ error: 'DB error checking rental' });
        }
        if (results.length === 0) {
            return res.json({ renting: false })
        }
        if (results.length > 0) {
            return res.json({
                renting: true,
                start_date: results[0].start_date,
                order_ID: results[0].order_ID
            })
        }
    });

})

// rent a charger
app.patch('/api/rent', async (req, res) => {
    const { deviceId, uid } = req.body || {};
    const now = new Date();
    try {
        // check if user is renting a device
        const userCheck = await connection.queryAsync(checkUser, [uid]);
        if (userCheck.length > 0) {
            return res.json({
                renting: true,
                start_date: userCheck[0].start_date,
                order_ID: userCheck[0].order_ID
            })
        }

        // check if device exists
        const deviceCheck = await connection.queryAsync(searchCharger, [deviceId]);
        if (!deviceCheck || deviceCheck.length === 0) {
            return res.status(404).json({ success: false, message: '查無此設備' });
        }
        const deviceStatus = deviceCheck[0].status;
        if (deviceStatus === '-1') {
            return res.status(400).json({ success: false, message: '此設備故障，請租借他台' })
        }
        if (deviceStatus === '0') {
            return res.status(400).json({ success: false, message: '此設備目前維修中，請租借他台' })
        }
        if (deviceStatus === '4') {
            return res.status(400).json({ success: false, message: '此設備目前電量未滿，請稍後再試' })
        }
        if (deviceCheck[0].status === '1') {
            // check if the device is rented by the current uid
            const renter = await connection.queryAsync(checkDeviceOwner, [deviceId]);
            // db query error   
            if (!renter && renter.length == 0) {
                return res.status(400).json({ success: false, message: 'db query failed to check currently renter' });
            }
            // if rented by current uid, return the start date

            renter[0].renterUid != uid ? res.status(400).json({ success: false, message: '此設備已被他人租借' }) : res.json({ success: true, startTime: renter[0].start_date });
        }


        // ========== update device status & insert rental log ==============
        await connection.beginTransactionAsync();
        // change device status to rented
        const rent = await connection.queryAsync(rentCharger, [deviceId]);
        if (!rent || rent.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '租借失敗' });
        }
        if (!deviceCheck[0].site_id) return res.status(400).json({ success: false, message: '此設備未正確歸還，請租借他台' });
        // insert rental log
        const rentalLogResult = await connection.queryAsync(rentalLog, [uid, now, deviceCheck[0].site_id, deviceId]);
        if (!rentalLogResult || rentalLogResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'DB log not established' });
        }
        await connection.commitAsync();


        return res.json({ success: true, message: 'Rental successful.', start_date: now });
    }
    catch (err) {
        console.error('err :>> ', err);
        return res.status(500).json({ success: false, message: 'rent error' });
    }



})



// return a charger
app.patch('/api/return', async (req, res) => {

    const { batteryAmount, returnSite, deviceId, uid } = req.body;
    const now = new Date();
    const batteryStatus =
        batteryAmount < 30 ? '4' : //低電量(不給借)
            batteryAmount < 98 ? '3' :  //中電量
                '2'; //滿電量 
    try {
        // check the rental time
        const rentalTimeCheck = await connection.queryAsync(getRentalTime, [uid, '0', deviceId])
        if (!rentalTimeCheck || rentalTimeCheck.length === 0) {
            return res.status(400).json({ success: false, message: '查無租借紀錄，請確認歸還裝置是否正確' });
        }
        if (!rentalTimeCheck[0].start_date) return res.status(400).json({ success: false, message: '查無租借時間，無法歸還' });

        //========== calculate rental time&money ==========
        const startDate = new Date(rentalTimeCheck[0].start_date);
        // console.log('start_date :>> ', startDate);
        const period = Math.ceil((now - startDate) / (1000 * 60)); // minutes
        const periodSession = Math.ceil(period / 30); // 30 minutes session
        const rentalFee = periodSession * 5; // 每30分鐘5元
        // console.log(`租借時間: ${period} 分鐘, 共 ${periodSession} 個半小時時段, 費用: ${rentalFee} 元`);

        // ============== prevent minus fee ==============
        if (rentalFee < 0) return res.status(400).json({ success: false, minusFee: true, message: '租借金額為負數，請聯絡客服' });

        // ============== overtime ==============
        if (period > 4320) return res.status(400).json({ success: false, overTime: true, message: 'Overtime' });

        // ============== update device status & insert return log ==============
        await connection.beginTransactionAsync();

        const deviceBack = await connection.queryAsync(returnCharger, [batteryStatus, returnSite, deviceId]);
        if (!deviceBack || deviceBack.affectedRows === 0) return res.status(404).json({ success: false, message: '歸還失敗' });


        const logBack = await connection.queryAsync(returnLog, [returnSite, now, '', deviceId]);
        if (!logBack || logBack.affectedRows === 0) return res.status(404).json({ success: false, message: 'db log query failed' });


        await connection.commitAsync();
        // ===================================================

        return res.json({ success: true, message: '歸還成功', rentalFee, period });
    }
    catch (err) {
        console.error('err :>> ', err);
        return res.status(500).json({ success: false, err, message: 'rent error' });
    }
});

app.patch('/api/overtimeReturn', async (req, res) => {
    const { batteryAmount, returnSite, deviceId, uid } = req.body;
    const now = new Date();
    const batteryStatus =
        batteryAmount < 30 ? '4' : //低電量(不給借)
            batteryAmount < 98 ? '3' :  //中電量
                '2'; //滿電量 
    try {
        // check the rental time
        const rentalTimeCheck = await connection.queryAsync(getRentalTime, [uid, '0', deviceId])
        if (!rentalTimeCheck || rentalTimeCheck.length === 0) {
            return res.status(400).json({ success: false, message: '查無租借紀錄，請確認歸還裝置是否正確' });
        }
        if (!rentalTimeCheck[0].start_date) return res.status(400).json({ success: false, message: '查無租借時間，無法歸還' });



        //========== calculate rental time&money ==========
        const startDate = new Date(rentalTimeCheck[0].start_date);
        // console.log('start_date :>> ', startDate);
        const period = Math.ceil((now - startDate) / (1000 * 60)); // minutes
        const periodSession = Math.ceil(period / 30); // 30 minutes session
        const rentalFee = periodSession * 5; // 每30分鐘5元
        // console.log(`租借時間: ${period} 分鐘, 共 ${periodSession} 個半小時時段, 費用: ${rentalFee} 元`);

        // ============== prevent minus fee ==============
        if (rentalFee < 0) return res.status(400).json({ success: false, minusFee: true, message: '租借金額為負數，請聯絡客服' });



        // ============== update device status & insert return log ==============
        await connection.beginTransactionAsync();

        const deviceBack = await connection.queryAsync(returnCharger, [batteryStatus, returnSite, deviceId]);
        if (!deviceBack || deviceBack.affectedRows === 0) return res.status(404).json({ success: false, message: '歸還失敗' });


        const logBack = await connection.queryAsync(returnLog, [returnSite, now, 'Overtime return. 逾期歸還', deviceId]);
        if (!logBack || logBack.affectedRows === 0) return res.status(404).json({ success: false, message: 'db log query failed' });
        const overTime = await connection.queryAsync(overTImeReturn, [uid]);
        if (!overTime || overTime.affectedRows === 0) return res.status(404).json({ success: false, message: 'db blacklist log query failed' });

        await connection.commitAsync();
        // ===================================================

        return res.json({ success: true, message: '歸還成功', rentalFee, period });

    }
    catch (err) {
        console.error('err :>> ', err);
        return res.status(500).json({ success: false, message: 'rent error' });
    }
}); 