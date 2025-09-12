import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import db from './db.js'; 

import mapRoutes from './routes/mapIndex.js';
import memberRoutes from './routes/memberRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

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