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
import adminRouters from './routes/admin.js';

import { apiRoutes } from '../src/components/apiRoutes.js';

const app = express();

// ======= Middleware between session, sitezone ========
app.use(express.json());
app.use(cookieParser()); 
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: true, // 前端網址
    credentials: true // 允許跨域帶 cookie
}));
app.use(session({
    secret: 'your_secret_key', // 請改成安全的字串
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1天
        secure: false,  // 開發環境設為 false
        sameSite: 'lax'  // 或 'none' 如果需要 strict 跨域
    }
}));

app.use(apiRoutes.map, mapRoutes)
app.use(apiRoutes.member, memberRoutes)
app.use(apiRoutes.coupon, couponRoutes)
app.use(apiRoutes.mission, missionRoutes)
app.use(apiRoutes.shop, shopRoutes)
app.use(apiRoutes.point, pointRouters)
app.use(apiRoutes.admin, adminRouters)

// start server listening
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
// app.get('/', (req, res) => {
//     res.send('server.js is running.');
// }); 