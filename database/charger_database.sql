-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-08-09 11:36:07
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `charger_database`
--

-- --------------------------------------------------------

--
-- 資料表結構 `charger`
--

CREATE TABLE `charger` (
  `charger_id` int(10) NOT NULL COMMENT '行充編號',
  `status` enum('-1','0','1','2','3','4') NOT NULL COMMENT '裝置狀態',
  `site_id` int(10) DEFAULT NULL COMMENT '站點編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `charger`
--

INSERT INTO `charger` (`charger_id`, `status`, `site_id`) VALUES
(1, '2', 1),
(2, '2', 1),
(3, '1', 1),
(4, '-1', 2),
(5, '0', NULL),
(6, '1', 2),
(7, '2', 3),
(8, '4', 3),
(9, '3', 3);

-- --------------------------------------------------------

--
-- 資料表結構 `charger_site`
--

CREATE TABLE `charger_site` (
  `site_id` int(10) NOT NULL COMMENT '站點編號',
  `site_name` varchar(50) NOT NULL COMMENT '站點名稱',
  `address` varchar(100) NOT NULL COMMENT '地址',
  `longitude` decimal(12,8) NOT NULL COMMENT '經度',
  `latitude` decimal(12,8) NOT NULL COMMENT '緯度'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `charger_site`
--

INSERT INTO `charger_site` (`site_id`, `site_name`, `address`, `longitude`, `latitude`) VALUES
(1, '7-ELEVEN 鄉林門市', '台中市南屯區大業路177號', 24.15339982, 120.65122466),
(2, '摩斯漢堡 台中大業店', '台中市南屯區大業路182號', 24.15371920, 120.65091280),
(3, '全家便利商店 台中大進店', '台中市南屯區公益路二段39號\r\n', 24.15073682, 120.65147523);

-- --------------------------------------------------------

--
-- 資料表結構 `discount_code`
--

CREATE TABLE `discount_code` (
  `discount_id` int(20) NOT NULL COMMENT '折扣編號',
  `uid` int(10) NOT NULL COMMENT '使用者編號',
  `discount_code` varchar(20) NOT NULL COMMENT '折扣碼',
  `discount_formula` varchar(100) NOT NULL COMMENT '折扣公式',
  `valid_date` date NOT NULL COMMENT '折扣碼結束日期',
  `usage_limit` int(5) NOT NULL COMMENT '可使用次數'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `discount_code`
--

INSERT INTO `discount_code` (`discount_id`, `uid`, `discount_code`, `discount_formula`, `valid_date`, `usage_limit`) VALUES
(1, 1, 'AAAA', 'price*0.9', '2025-08-26', 5),
(2, 2, 'BBBB', 'price*0.8', '2025-08-30', 4),
(3, 3, 'C', 'price*0.8', '2025-08-30', 4);

-- --------------------------------------------------------

--
-- 資料表結構 `employee`
--

CREATE TABLE `employee` (
  `employee_id` int(10) NOT NULL COMMENT '員工使用者編號',
  `employee_name` varchar(30) NOT NULL COMMENT '員工姓名',
  `employee_email` varchar(50) NOT NULL COMMENT '員工信箱'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `employee`
--

INSERT INTO `employee` (`employee_id`, `employee_name`, `employee_email`) VALUES
(1, 'employee1', 'employee1@gmail.com'),
(2, 'employee2', 'employee2@gmail.com'),
(3, 'employee3', 'eployee3@gmail.com');

-- --------------------------------------------------------

--
-- 資料表結構 `employee_log`
--

CREATE TABLE `employee_log` (
  `employee_log_date` datetime NOT NULL COMMENT '使用日期',
  `employee_id` int(10) NOT NULL COMMENT '員工編號',
  `log` varchar(100) NOT NULL COMMENT '使用紀錄'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `employee_log`
--

INSERT INTO `employee_log` (`employee_log_date`, `employee_id`, `log`) VALUES
('2025-08-08 08:53:53', 1, 'log in'),
('2025-08-08 09:06:03', 2, 'log in'),
('2025-08-08 09:08:04', 2, 'changed userinfo'),
('2025-08-08 09:12:03', 2, 'log out'),
('2025-08-08 14:59:30', 1, 'log out');

-- --------------------------------------------------------

--
-- 資料表結構 `event`
--

CREATE TABLE `event` (
  `event_id` int(10) NOT NULL COMMENT '活動編號',
  `event_title` varchar(30) NOT NULL COMMENT '活動標題',
  `event_content` varchar(200) NOT NULL COMMENT '活動內容',
  `site_id` int(10) NOT NULL COMMENT '站點編號',
  `event_start_date` date NOT NULL COMMENT '活動開始時間',
  `event_end_date` date NOT NULL COMMENT '活度結束時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `event`
--

INSERT INTO `event` (`event_id`, `event_title`, `event_content`, `site_id`, `event_start_date`, `event_end_date`) VALUES
(1, '週五涼爽價，租借半價！', '每逢週五，只要租借 ibon 行動電源，即可享有 首小時租金半價 優惠（原價每小時 12 元，優惠價只要 6 元）。讓您輕鬆應對週末出遊、追劇、打 Game 的電力需求，涼爽一夏！', 1, '2025-08-09', '2025-08-31'),
(2, '套餐升級，電力加倍！', '即日起至 8/31，凡購買任一 「摩斯活力套餐」 或 「摘鮮綠漢堡套餐」，即可獲得一張 行動電源 30 分鐘免費租借券。讓您一邊享受美味餐點，一邊為手機補充電力，完美結合美食與便利！', 2, '2025-09-12', '2025-08-31'),
(3, '霜淇淋配電力，現省 10 元！', '即日起至 8/31，只要在全家門市租借 ChargerNow 行動電源，即可獲得一張 Fami霜淇淋 10 元折價券！讓您一邊品嚐冰涼的霜淇淋，一邊為手機充電，身心都得到補給！', 3, '2025-08-20', '2025-08-31');

-- --------------------------------------------------------

--
-- 資料表結構 `notice`
--

CREATE TABLE `notice` (
  `notice_id` int(50) NOT NULL COMMENT '通知編號',
  `uid` int(10) NOT NULL COMMENT '使用者編號',
  `notice_title` varchar(100) NOT NULL COMMENT '通知標題',
  `notice_content` varchar(500) NOT NULL COMMENT '通知內容',
  `notice_date` date NOT NULL COMMENT '通知建立日期'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `notice`
--

INSERT INTO `notice` (`notice_id`, `uid`, `notice_title`, `notice_content`, `notice_date`) VALUES
(1, 1, '限時優惠！租借首小時免費！', '手機快沒電了嗎？即日起至 8/31，立即打開 App 租借行動電源，即可享第一小時免費優惠！別錯過省錢的好機會！', '2025-08-09'),
(2, 2, '充電拿積分，會員獨享！', '親愛的會員，每次成功歸還行動電源，都能獲得 10 點充電積分。累積積分可兌換租借時數或超商折扣券喔！', '2025-08-14'),
(3, 3, '您附近有可租借的行動電源！', '偵測到您位於百貨公司附近，距離您最近的租借點步行僅需 3 分鐘。隨時為您的手機補充電力，讓您安心逛街！\r\n\r\n', '2025-08-31');

-- --------------------------------------------------------

--
-- 資料表結構 `order_record`
--

CREATE TABLE `order_record` (
  `order_ID` int(10) NOT NULL COMMENT '訂單編號',
  `uid` int(10) NOT NULL COMMENT '使用者編號',
  `start_date` datetime NOT NULL COMMENT '開始日期',
  `end` datetime DEFAULT NULL COMMENT '結束日期\r\n',
  `site_id` int(10) NOT NULL COMMENT '站點編號',
  `order_status` enum('-1','0','1','') NOT NULL COMMENT '訂單狀態',
  `charger_id` int(10) NOT NULL COMMENT '裝置編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `order_record`
--

INSERT INTO `order_record` (`order_ID`, `uid`, `start_date`, `end`, `site_id`, `order_status`, `charger_id`) VALUES
(1, 1, '2025-08-08 03:54:29', '2025-08-09 09:54:30', 1, '1', 9),
(2, 2, '2025-08-08 04:03:45', NULL, 3, '0', 6),
(3, 3, '2025-08-08 04:04:16', '2025-08-14 10:04:16', 2, '-1', 2);

-- --------------------------------------------------------

--
-- 資料表結構 `shop`
--

CREATE TABLE `shop` (
  `product_id` int(10) NOT NULL COMMENT '產品編號',
  `product_name` varchar(30) NOT NULL COMMENT '產品名稱',
  `product_price` decimal(10,0) NOT NULL COMMENT '價格'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `shop`
--

INSERT INTO `shop` (`product_id`, `product_name`, `product_price`) VALUES
(1, '夏日海灘聯名款行動電源', 100),
(2, 'VIP 會員限定 30 天充電吃到飽', 200),
(3, '「美食地圖」充電套組', 300);

-- --------------------------------------------------------

--
-- 資料表結構 `user`
--

CREATE TABLE `user` (
  `uid` int(10) NOT NULL COMMENT '使用者編號',
  `user_name` varchar(30) NOT NULL COMMENT '姓名',
  `telephone` varchar(30) NOT NULL COMMENT '電話',
  `email` varchar(50) NOT NULL COMMENT '電子郵件',
  `password` varchar(50) NOT NULL COMMENT '密碼',
  `address` varchar(100) NOT NULL COMMENT '居住縣市',
  `blacklist` tinyint(1) NOT NULL COMMENT '黑名單點數',
  `wallet` decimal(5,0) NOT NULL COMMENT '代幣數量',
  `point` decimal(5,0) NOT NULL COMMENT '積分',
  `total_carbon_footprint` decimal(10,4) NOT NULL COMMENT '碳足跡',
  `credit_card_number` varchar(16) NOT NULL COMMENT '信用卡號',
  `credit_card_date` varchar(5) NOT NULL COMMENT '信用卡號終止日期'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `user`
--

INSERT INTO `user` (`uid`, `user_name`, `telephone`, `email`, `password`, `address`, `blacklist`, `wallet`, `point`, `total_carbon_footprint`, `credit_card_number`, `credit_card_date`) VALUES
(1, 'testuser1', '0987654321', 'test@gmail.com', '123456', '台中市南屯區公益路二段51號18樓', 0, 200, 100, 300.5550, '123456789101112', '12/26'),
(2, 'testuser2', '0975738564', 'test2@gmail.com', '123456', '台中市西區臺灣大道二段412號', 3, 0, 0, 300.0000, '492900000000000', '11/30'),
(3, 'testuser3', '0987654321', 'test3@gmail.com', '123456', '台北市松山區民生東路四段133號8樓', 0, 99999, 99999, 0.0000, '340000000000000', '11/27');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `charger`
--
ALTER TABLE `charger`
  ADD PRIMARY KEY (`charger_id`),
  ADD KEY `site_id` (`site_id`);

--
-- 資料表索引 `charger_site`
--
ALTER TABLE `charger_site`
  ADD PRIMARY KEY (`site_id`);

--
-- 資料表索引 `discount_code`
--
ALTER TABLE `discount_code`
  ADD PRIMARY KEY (`discount_id`,`uid`),
  ADD KEY `uid` (`uid`);

--
-- 資料表索引 `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employee_id`);

--
-- 資料表索引 `employee_log`
--
ALTER TABLE `employee_log`
  ADD PRIMARY KEY (`employee_log_date`,`employee_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- 資料表索引 `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `site_id` (`site_id`);

--
-- 資料表索引 `notice`
--
ALTER TABLE `notice`
  ADD PRIMARY KEY (`notice_id`),
  ADD KEY `uid` (`uid`);

--
-- 資料表索引 `order_record`
--
ALTER TABLE `order_record`
  ADD PRIMARY KEY (`order_ID`),
  ADD KEY `uid` (`uid`),
  ADD KEY `device_id` (`charger_id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `charger_id` (`charger_id`);

--
-- 資料表索引 `shop`
--
ALTER TABLE `shop`
  ADD PRIMARY KEY (`product_id`);

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `charger`
--
ALTER TABLE `charger`
  MODIFY `charger_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行充編號', AUTO_INCREMENT=10;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `charger_site`
--
ALTER TABLE `charger_site`
  MODIFY `site_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '站點編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `discount_code`
--
ALTER TABLE `discount_code`
  MODIFY `discount_id` int(20) NOT NULL AUTO_INCREMENT COMMENT '折扣編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `employee`
--
ALTER TABLE `employee`
  MODIFY `employee_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '員工使用者編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '活動編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `notice`
--
ALTER TABLE `notice`
  MODIFY `notice_id` int(50) NOT NULL AUTO_INCREMENT COMMENT '通知編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_record`
--
ALTER TABLE `order_record`
  MODIFY `order_ID` int(10) NOT NULL AUTO_INCREMENT COMMENT '訂單編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `shop`
--
ALTER TABLE `shop`
  MODIFY `product_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '產品編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `user`
--
ALTER TABLE `user`
  MODIFY `uid` int(10) NOT NULL AUTO_INCREMENT COMMENT '使用者編號', AUTO_INCREMENT=4;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `charger`
--
ALTER TABLE `charger`
  ADD CONSTRAINT `charger_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `charger_site` (`site_id`);

--
-- 資料表的限制式 `discount_code`
--
ALTER TABLE `discount_code`
  ADD CONSTRAINT `discount_code_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`);

--
-- 資料表的限制式 `employee_log`
--
ALTER TABLE `employee_log`
  ADD CONSTRAINT `employee_log_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`);

--
-- 資料表的限制式 `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `charger_site` (`site_id`);

--
-- 資料表的限制式 `notice`
--
ALTER TABLE `notice`
  ADD CONSTRAINT `notice_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`);

--
-- 資料表的限制式 `order_record`
--
ALTER TABLE `order_record`
  ADD CONSTRAINT `order_record_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `order_record_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `charger_site` (`site_id`),
  ADD CONSTRAINT `order_record_ibfk_3` FOREIGN KEY (`charger_id`) REFERENCES `charger` (`charger_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
