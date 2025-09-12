import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import db from './db.js'; 

import mapRoutes from './routes/mapIndex.js';
import memberRoutes from './routes/memberapp.js';
import couponRoutes from './routes/router_coupon.js';
import missionRoutes from './routes/router_mission.js';
import shopRoutes from './routes/router_shop.js';
import pointRouters from './routes/router_point.js';

const app = express();

// ======= Middleware between session, sitezone ========
app.use(express.json());
app.use(cookieParser()); // 新增
app.use(cors({
    origin: 'http://localhost:5173', // 前端網址
    credentials: true // 允許跨域帶 cookie
}));
app.use(session({
    secret: 'your_secret_key', // 請改成安全的字串
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1天
    }
}));

app.use('/api/map', mapRoutes)
app.use('/api/member', memberRoutes)
app.use('/api/coupon', couponRoutes)
app.use('/api/mission', missionRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/point', pointRouters)

app.get('/', (req, res) => {
    res.send('server.js is running.');
}); 
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});