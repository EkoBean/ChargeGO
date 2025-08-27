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

//============= mySql connect and error handling ==============
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
const rentCharger = `UPDATE charger SET status = '1', site_id = null WHERE charger_id = ? `;
const rentalLog = `INSERT INTO order_record (uid, start_date, rental_site_id, order_status, charger_id) VALUES (?, ?, ?, '0', ?);
`;
// return a charger
const returnCharger = `UPDATE charger SET status = ?, site_id = ? WHERE charger_id = ?`;
const returnLog = `UPDATE order_record SET order_status = '1', return_site_id = ?, end = ? WHERE charger_id = ? AND order_status = '0'`;


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

// rent a charger
app.patch('/api/rent', (req, res) => {
    const { deviceId, uid } = req.body || {};
    const now = new Date();
    let rentalSite = '';

    // update the device status
    connection.query(searchCharger, [deviceId], (error, results) => {
        if (error) {
            console.log('error :>> ', error);
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: '查無此設備' });
        }
        else if (results[0].status == '1') {
            return res.json({ success: true, message: 'renting' });
        }
        rentalSite = results[0].site_id;
        if (rentalSite) {
            // update the device status
            connection.query(rentCharger, [deviceId], (errorUpdate, resultUpdate) => {
                if (errorUpdate) {
                    console.log('errorUpdate :>> ', errorUpdate);
                    return res.status(500).json({ success: false, message: 'Database query failed' });
                } if (results.affectedRows === 0) {
                    // 沒有資料被更新
                    return res.status(404).json({ success: false, message: '資料未變更' });
                }
                console.log('resultUpdate :>> ', resultUpdate);
                // insert rental log
                connection.query(rentalLog, [uid, now, rentalSite, deviceId], (errorLog, resultLog) => {
                    if (errorLog) {
                        console.error('errorLog :>> ', errorLog);
                        return res.status(500).json({ success: false, message: 'DB log establishing failed' });
                    }
                    if (resultLog.affectedRows === 0) {
                        return res.status(404).json({ success: false, message: 'DB log not established' });
                    }
                    console.log('resultLog :>> ', resultLog);
                    return res.json({ success: true, message: 'DB log establishing success.' });
                })

            })
        }
    }
    );


})



// return a charger
app.patch('/api/return', (req, res) => {
    const { batteryAmount, returnSite, deviceId } = req.body;
    const now = new Date();
    const batteryStatus =
        batteryAmount < 30 ? '4' : //低電量(不給借)
            batteryAmount < 98 ? '3' :  //中電量
                '2'; //滿電量 
    // ======== update the device status ========
    connection.query(returnCharger, [batteryStatus, returnSite, deviceId], (error, results) => {
        if (error) {
            console.log('error :>> ', error);
            return res.status(500).json({ success: false, message: 'Database query failed' });
        } if (results.affectedRows === 0) {
            // 沒有資料被更新
            return res.status(404).json({ success: false, message: '資料未變更' });
        }
        // ========= insert return log ========
        connection.query(returnLog, [returnSite, now, deviceId], (error, results) => {
            if (error) {
                console.erroro('error :>> ', error);
                return res.status(500).json({ success: false, message: 'DB log establishing failed' });
            }
            console.log('results :>> ', results);
            res.json({ success: true, message: '歸還成功' });
        })

    })
}); 