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
// return a charger
const returnCharger = `UPDATE charger SET status = ?, site_id = ? WHERE charger_id = ?`;
const rentalLog = `INSERT INTO rental_log (charger_id) VALUES (?)`;


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
    const deviceID = req.body.deviceID;

    // update the device status
    connection.query(searchCharger, [deviceID], (error, results) => {
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
        connection.query(rentCharger, [deviceID], (error2, results2) => {
            if (error2) {
                console.log('error2 :>> ', error2);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            } if (results.affectedRows === 0) {
                // 沒有資料被更新
                return res.status(404).json({ success: false, message: '資料未變更' });
            } else {
                res.json({ success: true, message: '租借成功' });
                console.log('results2 :>> ', results2);
            }
        })
    }
    );

    // establish rental log
    connection.query(rentalLog, [deviceID])
})



// return a charger
app.patch('/api/return', (req, res) => {
    const { batteryAmount, siteId, deviceId } = req.body;
    const batteryStatus =
        batteryAmount < 30 ? '4' : //低電量(不給借)
            batteryAmount < 98 ? '3' :  //中電量
                '2'; //滿電量 
    connection.query(returnCharger, [batteryStatus, siteId, deviceId], (error, results) => {
        if (error) {
            console.log('error :>> ', error);
            return res.status(500).json({ success: false, message: 'Database query failed' });
        } if (results.affectedRows === 0) {
            // 沒有資料被更新
            return res.status(404).json({ success: false, message: '資料未變更' });
        }
        else {
            res.json({ success: true, message: '歸還成功' });
            console.log('results :>> ', results);
        }
    })
}); 