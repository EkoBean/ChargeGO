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
const selectAllStations = `SELECT * from charger_site`


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