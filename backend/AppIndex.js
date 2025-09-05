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

// db queries import
import { dbQueries as mapQuery } from './map_dbQuery.js';

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


// ================== main API ====================
// get all stations
app.get('/api/stations', (req, res) => {
    connection.query(mapQuery.selectAllStations, (error, results) => {
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
    connection.query(mapQuery.selectInfoWindow, [siteId], (error, results) => {
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
    connection.query(mapQuery.checkUser, [uid], (error, results) => {
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
        const userCheck = await connection.queryAsync(mapQuery.checkUser, [uid]);
        if (userCheck.length > 0) {
            if (deviceId != userCheck[0].charger_id) return res.status(400).json({ success: false, message: '此帳號已有租借中的設備，無法重複租借' });
            return res.json({
                renting: true,
                start_date: userCheck[0].start_date,
                order_ID: userCheck[0].order_ID
            })
        }

        // check if device exists
        const deviceCheck = await connection.queryAsync(mapQuery.searchCharger, [deviceId]);
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
            const renter = await connection.queryAsync(mapQuery.checkDeviceOwner, [deviceId]);
            // db query error   
            if (!renter && renter.length == 0) {
                return res.status(400).json({ success: false, message: '連線錯誤', deatils: 'db query failed to check currently renter' });
            }
            // if rented by current uid, return the start date

            renter[0].renterUid != uid ? res.status(400).json({ success: false, message: '此設備已被他人租借' }) : res.json({ success: true, startTime: renter[0].start_date });
        }


        // ========== update device status & insert rental log ==============
        await connection.beginTransactionAsync();
        // change device status to rented
        const rent = await connection.queryAsync(mapQuery.rentCharger, [deviceId]);
        if (!rent || rent.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '租借失敗' });
        }
        if (!deviceCheck[0].site_id) return res.status(400).json({ success: false, message: '此設備未正確歸還，請租借他台' });
        // insert rental log
        const rentalLogResult = await connection.queryAsync(mapQuery.rentalLog, [uid, now, deviceCheck[0].site_id, deviceId]);
        if (!rentalLogResult || rentalLogResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '連線失敗', details: 'DB log not established' });
        }
        await connection.commitAsync();


        return res.json({ success: true, message: 'Rental successful.', start_date: now });
    }
    catch (err) {
        console.error('err :>> ', err);
        return res.status(500).json({ success: false, message: '租借錯誤' });
    }



})



// return a charger
app.patch('/api/return', async (req, res) => {

    const { batteryAmount, returnSite, deviceId, uid, overtimeConfirm } = req.body;
    const now = new Date();
    const batteryStatus =
        batteryAmount < 30 ? '4' : //低電量(不給借)
            batteryAmount < 98 ? '3' :  //中電量
                '2'; //滿電量 
    const WARNING_MINUTES = 4320;
    try {
        // check the rental time
        const rentalTimeCheck = await connection.queryAsync(mapQuery.getRentalTime, [uid, '0', deviceId])
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
        if (rentalFee < 0) return res.status(400).json({ success: false, minusFee: true, message: '歸還金額異常，請聯絡客服 02-48273335' });

        // ============== overtime ==============
        if (period > WARNING_MINUTES && !overtimeConfirm) return res.status(201).json({ success: false, overtime: true, rentalFee, message: '超過三天未歸還，請查閱確認視窗。' });

        // ============== update device status & insert return log ==============
        await connection.beginTransactionAsync();

        const deviceBack = await connection.queryAsync(mapQuery.returnCharger, [batteryStatus, returnSite, deviceId]);
        if (!deviceBack || deviceBack.affectedRows === 0) return res.status(404).json({ success: false, message: '歸還失敗，請稍後再試。', details: 'Returning query error.' });


        const logBack = await connection.queryAsync(mapQuery.returnLog, [returnSite,
            now,
            rentalFee,
            period > WARNING_MINUTES ? `Overtime return.逾期未歸還。${Math.floor(period/60)}小時 ${period%60}分鐘` : '',
            deviceId]);
        if (!logBack || logBack.affectedRows === 0) return res.status(404).json({ success: false, message: '歸還失敗，請稍後再試。', details: 'Log update query error.' });

        if (period > WARNING_MINUTES) {
            const overTimeLog = await connection.queryAsync(mapQuery.overTImeReturn, [uid]);
            if (!overTimeLog || overTimeLog.affectedRows === 0) return res.status(404).json({ success: false, message: '歸還失敗，請稍後再試。', details: 'Overtime blacklist point query error.' });
        }


        await connection.commitAsync();
        // ===================================================

        return res.json({ success: true, message: '歸還成功', rentalFee, period });
    }
    catch (err) {
        console.error('err :>> ', err);
        return res.status(500).json({ success: false, err, message: '租借錯誤' });
    }
});
