-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-08-28 09:41:17
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.0.30

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
  `site_id` varchar(50) DEFAULT NULL COMMENT '站點編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `charger`
--

INSERT INTO `charger` (`charger_id`, `status`, `site_id`) VALUES
(1, '2', '1'),
(2, '2', '1'),
(3, '1', '1'),
(4, '-1', '2'),
(5, '0', NULL),
(6, '1', '2'),
(7, '2', '3'),
(8, '4', '3'),
(9, '3', '3');

-- --------------------------------------------------------

--
-- 資料表結構 `charger_site`
--

CREATE TABLE `charger_site` (
  `site_id` varchar(50) NOT NULL COMMENT '站點編號',
  `site_name` varchar(50) NOT NULL COMMENT '站點名稱',
  `country` varchar(50) NOT NULL COMMENT '縣市',
  `address` varchar(100) NOT NULL COMMENT '地址',
  `latitude` decimal(12,8) NOT NULL COMMENT '緯度',
  `longitude` decimal(12,8) NOT NULL COMMENT '經度'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `charger_site`
--

INSERT INTO `charger_site` (`site_id`, `site_name`, `country`, `address`, `latitude`, `longitude`) VALUES
('1', '7-ELEVEN 鄉林門市', '台中市', '南屯區大業路177號', 24.15339982, 120.65122466),
('2', '摩斯漢堡 台中大業店', '台中市', '南屯區大業路182號', 24.15371920, 120.65091280),
('3', '全家便利商店 台中大進店', '台中市', '南屯區公益路二段39號\r\n', 24.15073682, 120.65147523);

-- --------------------------------------------------------

--
-- 資料表結構 `coupons`
--

CREATE TABLE `coupons` (
  `coupon_id` int(11) NOT NULL COMMENT '優惠券ID',
  `template_id` int(11) NOT NULL COMMENT '範本ID',
  `user_id` int(11) NOT NULL COMMENT '使用者ID',
  `code` varchar(100) DEFAULT NULL COMMENT '優惠券代碼或QR碼',
  `source_type` enum('shop_purchase','store_issued','system_promo') NOT NULL COMMENT '來源類型',
  `source_id` int(11) DEFAULT NULL COMMENT '來源ID(訂單或規則)',
  `status` enum('active','used','expired') NOT NULL DEFAULT 'active' COMMENT '狀態',
  `issued_at` datetime DEFAULT current_timestamp() COMMENT '發放時間',
  `expires_at` datetime DEFAULT NULL COMMENT '過期時間',
  `used_at` datetime DEFAULT NULL COMMENT '使用時間',
  `used_by_store_id` int(11) DEFAULT NULL COMMENT '在哪家店使用',
  `used_by_order_id` int(11) DEFAULT NULL COMMENT '在哪筆訂單使用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='優惠券實例';

--
-- 傾印資料表的資料 `coupons`
--

INSERT INTO `coupons` (`coupon_id`, `template_id`, `user_id`, `code`, `source_type`, `source_id`, `status`, `issued_at`, `expires_at`, `used_at`, `used_by_store_id`, `used_by_order_id`) VALUES
(13, 3, 2, NULL, 'shop_purchase', NULL, 'active', '2025-08-28 15:39:16', '2025-11-26 15:39:16', NULL, NULL, NULL),
(14, 3, 2, NULL, 'shop_purchase', NULL, 'active', '2025-08-28 15:39:24', '2025-11-26 15:39:24', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `coupon_templates`
--

CREATE TABLE `coupon_templates` (
  `template_id` int(11) NOT NULL COMMENT '優惠券範本ID',
  `name` varchar(255) NOT NULL COMMENT '優惠券名稱',
  `type` enum('rental_discount','store_gift','store_discount') NOT NULL COMMENT '優惠券類型(租借折抵、商品折扣、商品兌換)',
  `point` decimal(10,0) DEFAULT 0 COMMENT '點數價格',
  `value` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '優惠券的數值',
  `validity_days` int(11) NOT NULL COMMENT '有效天數',
  `description` text DEFAULT NULL COMMENT '詳細說明與使用規則',
  `is_purchasable` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否能在商城購買',
  `is_issued_by_site` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否能由站點發放',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='優惠券範本';

--
-- 傾印資料表的資料 `coupon_templates`
--

INSERT INTO `coupon_templates` (`template_id`, `name`, `type`, `point`, `value`, `validity_days`, `description`, `is_purchasable`, `is_issued_by_site`, `created_at`, `updated_at`) VALUES
(1, '10元租借折扣券', 'rental_discount', 10, 10.00, 30, '兌換成功後，此折扣券將直接匯入您的租借儲值額度中。此折扣券僅限於指定租借服務，詳情請參閱活動條款。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26'),
(2, '30元租借折扣券', 'rental_discount', 290, 30.00, 60, '兌換成功後，此折扣券將直接匯入您的租借儲值額度中。此折扣券僅限於指定租借服務，詳情請參閱活動條款。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26'),
(3, '7-11 中杯美式咖啡兌換券', 'store_gift', 800, 0.00, 90, '兌換成功後，商品將會匯入兌換券頁面。請至全台7-11門市櫃檯出示兌換。兌換券僅限於中杯美式咖啡，不可更換其他飲品。部分門市不適用，請於兌換前確認。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26'),
(4, '全家霜淇淋兌換券', 'store_gift', 800, 0.00, 90, '兌換成功後，商品將會匯入兌換券頁面。請至全家門市FamiPort機台列印小白單後兌換。兌換券適用於全家霜淇淋，口味以現場供應為主。部分特殊門市不適用，請於兌換前確認。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26'),
(5, '7-11 50元商品抵用券', 'store_discount', 0, 1000.00, 60, '兌換成功後，商品將會匯入兌換券頁面。請至7-11門市結帳時出示條碼。此抵用券可用於7-11商品，菸品及代收服務不適用。不可找零。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26'),
(6, '全家 50元商品抵用券', 'store_discount', 1000, 50.00, 60, '兌換成功後，商品將會匯入兌換券頁面。請至全家門市結帳時出示條碼。此抵用券可用於全家商品，菸品及代收服務不適用。不可找零。', 1, 0, '2025-08-28 10:42:10', '2025-08-28 11:33:26');

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
  `site_id` varchar(50) NOT NULL COMMENT '站點編號',
  `event_start_date` date NOT NULL COMMENT '活動開始時間',
  `event_end_date` date NOT NULL COMMENT '活度結束時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `event`
--

INSERT INTO `event` (`event_id`, `event_title`, `event_content`, `site_id`, `event_start_date`, `event_end_date`) VALUES
(1, '週五涼爽價，租借半價！', '每逢週五，只要租借 ibon 行動電源，即可享有 首小時租金半價 優惠（原價每小時 12 元，優惠價只要 6 元）。讓您輕鬆應對週末出遊、追劇、打 Game 的電力需求，涼爽一夏！', '1', '2025-08-09', '2025-08-31'),
(2, '套餐升級，電力加倍！', '即日起至 8/31，凡購買任一 「摩斯活力套餐」 或 「摘鮮綠漢堡套餐」，即可獲得一張 行動電源 30 分鐘免費租借券。讓您一邊享受美味餐點，一邊為手機補充電力，完美結合美食與便利！', '2', '2025-09-12', '2025-08-31'),
(3, '霜淇淋配電力，現省 10 元！', '即日起至 8/31，只要在全家門市租借 ChargerNow 行動電源，即可獲得一張 Fami霜淇淋 10 元折價券！讓您一邊品嚐冰涼的霜淇淋，一邊為手機充電，身心都得到補給！', '3', '2025-08-20', '2025-08-31');

-- --------------------------------------------------------

--
-- 資料表結構 `missions`
--

CREATE TABLE `missions` (
  `mission_id` int(10) NOT NULL COMMENT '任務編號',
  `title` varchar(255) NOT NULL COMMENT '任務標題',
  `description` text NOT NULL COMMENT '詳細描述',
  `type` enum('accumulated_hours','monthly_rentals','','') NOT NULL COMMENT '類型',
  `reward_points` int(10) NOT NULL COMMENT '獎勵點數',
  `target_value` int(10) NOT NULL COMMENT '目標值',
  `target_unit` enum('Hours','Times','','') NOT NULL COMMENT '目標單位',
  `mission_start_date` datetime NOT NULL COMMENT '開始時間',
  `mission_end_date` datetime DEFAULT NULL COMMENT '結束時間',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '建立時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `missions`
--

INSERT INTO `missions` (`mission_id`, `title`, `description`, `type`, `reward_points`, `target_value`, `target_unit`, `mission_start_date`, `mission_end_date`, `created_at`) VALUES
(1, '八月租借累積5小時', '總結租借時間5小時', 'accumulated_hours', 100, 5, 'Hours', '2025-08-01 02:59:41', '2025-08-31 15:54:15', '2025-08-21 07:54:33'),
(2, '八月總租借10小時', '', 'accumulated_hours', 100, 10, 'Hours', '2025-08-01 00:00:00', '2025-08-31 23:59:59', '2025-08-21 07:56:08'),
(3, '八月總租借15小時', '', 'accumulated_hours', 100, 15, 'Hours', '2025-08-01 00:00:00', '2025-08-31 23:59:59', '2025-08-21 07:56:48'),
(4, '7月租借3次', '', 'monthly_rentals', 30, 3, 'Times', '2025-07-01 00:00:00', '2025-07-31 23:59:59', '2025-08-18 08:16:29'),
(5, '7月租借5次', '', 'monthly_rentals', 50, 5, 'Times', '2025-07-01 00:00:00', '2025-07-31 23:59:59', '2025-08-18 08:16:58'),
(6, '7月租借10次', '', 'monthly_rentals', 100, 10, 'Times', '2025-07-01 00:00:00', '2025-07-31 23:59:59', '2025-08-18 08:16:58'),
(7, '8月租借3次', '', 'monthly_rentals', 50, 5, 'Times', '2025-08-01 00:00:00', '2025-08-31 23:59:59', '2025-08-18 08:16:58'),
(8, '8月租借5次', '', 'monthly_rentals', 50, 5, 'Times', '2025-08-01 00:00:00', '2025-08-31 23:59:59', '2025-08-18 08:16:58'),
(9, '8月租借10次', '', 'monthly_rentals', 100, 10, 'Times', '2025-08-01 00:00:00', '2025-08-31 23:59:59', '2025-08-18 08:16:58'),
(10, '9月租借3次', '', 'monthly_rentals', 30, 3, 'Times', '2025-09-01 00:00:00', '2025-09-30 23:59:59', '2025-08-18 08:16:58'),
(11, '9月租借5次', '', 'monthly_rentals', 50, 5, 'Times', '2025-09-01 00:00:00', '2025-09-30 23:59:59', '2025-08-18 08:16:58'),
(12, '9月租借10次', '', 'monthly_rentals', 100, 10, 'Times', '2025-09-01 00:00:00', '2025-09-30 23:59:59', '2025-08-18 08:18:31');

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
  `comment` varchar(100) DEFAULT NULL COMMENT '訂單備註',
  `rental_site_id` varchar(50) DEFAULT NULL COMMENT '租借站點編號',
  `return_site_id` varchar(50) DEFAULT NULL COMMENT '歸還站點編號',
  `order_status` enum('-1','0','1','2') NOT NULL COMMENT '訂單狀態',
  `charger_id` int(10) NOT NULL COMMENT '裝置編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `order_record`
--

INSERT INTO `order_record` (`order_ID`, `uid`, `start_date`, `end`, `comment`, `rental_site_id`, `return_site_id`, `order_status`, `charger_id`) VALUES
(1, 1, '2025-08-08 03:54:29', '2025-08-09 09:54:30', '', '1', '2', '1', 9),
(2, 2, '2025-08-08 04:03:45', NULL, '', '3', '2', '0', 6),
(3, 3, '2025-08-08 04:04:16', '2025-08-14 10:04:16', '', '2', '3', '-1', 2),
(4, 1, '2025-07-05 10:00:00', '2025-07-05 10:30:00', '', '1', '1', '1', 9),
(5, 1, '2025-07-20 15:00:00', '2025-07-20 16:00:00', '', '2', '2', '1', 2),
(6, 1, '2025-08-01 08:00:00', '2025-08-22 15:45:59', '', '3', '2', '0', 6),
(7, 1, '2025-08-15 12:00:00', '2025-08-15 13:00:00', '', '1', '3', '1', 9),
(8, 1, '2025-09-02 18:00:00', '2025-09-02 18:30:00', '', '2', '1', '1', 2),
(9, 2, '2025-08-10 11:30:00', '2025-08-10 12:00:00', '', '3', '2', '1', 6),
(10, 2, '2025-08-25 09:00:00', '2025-08-25 09:15:00', '', '1', '2', '1', 9),
(11, 2, '2025-09-10 20:00:00', '2025-09-10 21:00:00', '', '2', '3', '1', 2),
(12, 3, '2025-07-01 06:00:00', '2025-07-01 07:00:00', '', '1', '1', '1', 9),
(13, 3, '2025-07-05 14:00:00', '2025-07-05 14:30:00', '', '2', '2', '1', 2),
(14, 3, '2025-07-10 16:00:00', '2025-07-10 16:45:00', '', '3', '2', '1', 6),
(15, 3, '2025-07-15 19:00:00', '2025-07-15 20:00:00', '', '1', '3', '1', 9),
(16, 3, '2025-08-02 10:00:00', '2025-08-02 10:30:00', '', '2', '1', '1', 2),
(17, 3, '2025-08-10 12:00:00', '2025-08-10 13:00:00', '', '3', '2', '1', 6),
(18, 3, '2025-08-20 08:00:00', '2025-08-20 09:00:00', '', '1', '2', '1', 9),
(19, 3, '2025-09-01 11:00:00', '2025-09-01 12:00:00', '', '2', '3', '1', 2),
(20, 3, '2025-09-05 15:00:00', NULL, '', '3', '1', '0', 6),
(21, 3, '2025-09-12 17:00:00', '2025-09-12 17:30:00', '', '1', '2', '-1', 9);

-- --------------------------------------------------------

--
-- 資料表結構 `shop_orders`
--

CREATE TABLE `shop_orders` (
  `order_id` int(11) NOT NULL COMMENT '訂單ID',
  `user_id` int(11) NOT NULL COMMENT '使用者ID',
  `template_id` int(11) NOT NULL COMMENT '優惠券範本ID',
  `order_status` enum('completed','failed') NOT NULL DEFAULT 'completed' COMMENT '訂單狀態',
  `price` decimal(10,2) NOT NULL COMMENT '支付金額',
  `coupon_id` int(11) DEFAULT NULL COMMENT '發放的優惠券ID',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '建立時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='商城訂單';

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
  `hashed_password` varchar(255) NOT NULL COMMENT '雜湊加密密碼',
  `country` varchar(50) NOT NULL COMMENT '縣市',
  `address` varchar(100) NOT NULL COMMENT '居住縣市',
  `blacklist` tinyint(1) NOT NULL COMMENT '黑名單點數',
  `wallet` decimal(5,0) NOT NULL COMMENT '代幣數量',
  `point` decimal(5,0) NOT NULL COMMENT '積分',
  `total_carbon_footprint` decimal(10,4) NOT NULL COMMENT '碳足跡',
  `credit_card_number` varchar(16) NOT NULL COMMENT '信用卡號',
  `credit_card_date` varchar(5) NOT NULL COMMENT '信用卡號終止日期',
  `status` enum('-1','0','1') NOT NULL COMMENT '使用者帳號狀態 ''-1'' (停權) ''0''(正常) ''1''(自行停權)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `user`
--

INSERT INTO `user` (`uid`, `user_name`, `telephone`, `email`, `password`, `hashed_password`, `country`, `address`, `blacklist`, `wallet`, `point`, `total_carbon_footprint`, `credit_card_number`, `credit_card_date`, `status`) VALUES
(1, 'testuser1', '0987654321', 'test@gmail.com', '123456', '', '台中市', '南屯區公益路二段51號18樓', 0, 200, 100, 300.5550, '123456789101112', '12/26', '0'),
(2, 'testuser2', '0975738564', 'test2@gmail.com', '123456', '', '台中市', '西區臺灣大道二段412號', 3, 0, 0, 300.0000, '492900000000000', '11/30', '0'),
(3, 'testuser3', '0987654321', 'test3@gmail.com', '123456', '', '台北市', '松山區民生東路四段133號8樓', 0, 99999, 99999, 0.0000, '340000000000000', '11/27', '0'),
(5, 'abc123', '0956874519', 'kkk@g.com', '1234', '03ac674216', 'county9', 'XXXXXXXXXX', 0, 0, 0, 0.0000, '1234567891023456', '12/28', '');

-- --------------------------------------------------------

--
-- 資料表結構 `user_missions`
--

CREATE TABLE `user_missions` (
  `user_mission_id` int(10) NOT NULL COMMENT '使用者任務編號',
  `user_id` int(10) NOT NULL COMMENT '使用者編號',
  `mission_id` int(10) NOT NULL COMMENT '任務編號',
  `current_progress` int(10) NOT NULL COMMENT '當前進度',
  `is_completed` tinyint(1) NOT NULL COMMENT '任務是否完成',
  `is_claimed` tinyint(1) NOT NULL COMMENT '任務是否領取',
  `completed_at` datetime NOT NULL COMMENT '完成時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `user_missions`
--

INSERT INTO `user_missions` (`user_mission_id`, `user_id`, `mission_id`, `current_progress`, `is_completed`, `is_claimed`, `completed_at`) VALUES
(1, 1, 1, 542, 1, 0, '2025-08-18 03:17:55'),
(2, 1, 2, 542, 1, 0, '2025-08-18 03:17:55'),
(3, 1, 3, 542, 1, 1, '2025-08-18 03:17:55'),
(4, 1, 4, 0, 0, 0, '2025-08-18 03:17:55'),
(5, 1, 5, 0, 0, 0, '2025-08-18 03:17:55'),
(6, 1, 6, 0, 0, 0, '2025-08-18 03:17:55'),
(7, 2, 1, 1, 0, 0, '2025-08-18 03:17:55'),
(8, 2, 2, 1, 0, 0, '2025-08-18 03:17:55'),
(9, 2, 3, 1, 0, 0, '2025-08-18 03:17:55'),
(10, 2, 4, 0, 0, 0, '2025-08-18 03:17:55'),
(11, 2, 5, 0, 0, 0, '2025-08-18 03:17:55'),
(12, 2, 6, 0, 0, 0, '2025-08-18 03:17:55'),
(13, 3, 1, 0, 0, 0, '2025-08-18 03:17:55'),
(14, 3, 2, 0, 0, 0, '2025-08-18 03:17:55'),
(15, 3, 3, 0, 0, 0, '2025-08-18 03:17:55'),
(16, 3, 4, 4, 1, 1, '2025-08-18 03:17:55'),
(17, 3, 5, 4, 0, 0, '2025-08-18 03:17:55'),
(18, 3, 6, 4, 0, 0, '2025-08-18 03:17:55'),
(19, 1, 4, 0, 0, 0, '0000-00-00 00:00:00'),
(20, 1, 5, 0, 0, 0, '0000-00-00 00:00:00'),
(21, 1, 6, 0, 0, 0, '0000-00-00 00:00:00'),
(22, 2, 4, 0, 0, 0, '0000-00-00 00:00:00'),
(23, 2, 5, 0, 0, 0, '0000-00-00 00:00:00'),
(24, 2, 6, 0, 0, 0, '0000-00-00 00:00:00'),
(25, 3, 4, 4, 1, 1, '0000-00-00 00:00:00'),
(26, 3, 5, 4, 0, 0, '0000-00-00 00:00:00'),
(27, 3, 6, 4, 0, 0, '0000-00-00 00:00:00'),
(28, 1, 7, 3, 0, 0, '0000-00-00 00:00:00'),
(29, 1, 8, 3, 0, 0, '0000-00-00 00:00:00'),
(30, 1, 9, 3, 0, 0, '0000-00-00 00:00:00'),
(31, 1, 10, 0, 0, 0, '0000-00-00 00:00:00'),
(32, 1, 11, 0, 0, 0, '0000-00-00 00:00:00'),
(33, 1, 12, 0, 0, 0, '0000-00-00 00:00:00'),
(34, 2, 7, 2, 0, 0, '0000-00-00 00:00:00'),
(35, 2, 8, 2, 0, 0, '0000-00-00 00:00:00'),
(36, 2, 9, 2, 0, 0, '0000-00-00 00:00:00'),
(37, 2, 10, 1, 0, 0, '0000-00-00 00:00:00'),
(38, 2, 11, 1, 0, 0, '0000-00-00 00:00:00'),
(39, 2, 12, 1, 0, 0, '0000-00-00 00:00:00'),
(40, 3, 7, 4, 0, 0, '0000-00-00 00:00:00'),
(41, 3, 8, 4, 0, 0, '0000-00-00 00:00:00'),
(42, 3, 9, 4, 0, 0, '0000-00-00 00:00:00'),
(43, 3, 10, 2, 0, 0, '0000-00-00 00:00:00'),
(44, 3, 11, 2, 0, 0, '0000-00-00 00:00:00'),
(45, 3, 12, 2, 0, 0, '0000-00-00 00:00:00');

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
-- 資料表索引 `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`coupon_id`),
  ADD KEY `fk_coupons_template` (`template_id`),
  ADD KEY `idx_coupons_user` (`user_id`);

--
-- 資料表索引 `coupon_templates`
--
ALTER TABLE `coupon_templates`
  ADD PRIMARY KEY (`template_id`);

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
-- 資料表索引 `missions`
--
ALTER TABLE `missions`
  ADD PRIMARY KEY (`mission_id`);

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
  ADD KEY `site_id` (`rental_site_id`),
  ADD KEY `charger_id` (`charger_id`),
  ADD KEY `return_site_id` (`return_site_id`);

--
-- 資料表索引 `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_orders_template` (`template_id`),
  ADD KEY `fk_orders_coupon` (`coupon_id`),
  ADD KEY `idx_orders_user` (`user_id`);

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`);

--
-- 資料表索引 `user_missions`
--
ALTER TABLE `user_missions`
  ADD PRIMARY KEY (`user_mission_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `mission_id` (`mission_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `charger`
--
ALTER TABLE `charger`
  MODIFY `charger_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '行充編號', AUTO_INCREMENT=10;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `coupons`
--
ALTER TABLE `coupons`
  MODIFY `coupon_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '優惠券ID', AUTO_INCREMENT=15;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `coupon_templates`
--
ALTER TABLE `coupon_templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '優惠券範本ID', AUTO_INCREMENT=7;

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
-- 使用資料表自動遞增(AUTO_INCREMENT) `missions`
--
ALTER TABLE `missions`
  MODIFY `mission_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '任務編號', AUTO_INCREMENT=13;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `notice`
--
ALTER TABLE `notice`
  MODIFY `notice_id` int(50) NOT NULL AUTO_INCREMENT COMMENT '通知編號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_record`
--
ALTER TABLE `order_record`
  MODIFY `order_ID` int(10) NOT NULL AUTO_INCREMENT COMMENT '訂單編號', AUTO_INCREMENT=22;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `shop_orders`
--
ALTER TABLE `shop_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '訂單ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `user`
--
ALTER TABLE `user`
  MODIFY `uid` int(10) NOT NULL AUTO_INCREMENT COMMENT '使用者編號', AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `user_missions`
--
ALTER TABLE `user_missions`
  MODIFY `user_mission_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '使用者任務編號', AUTO_INCREMENT=46;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `charger`
--
ALTER TABLE `charger`
  ADD CONSTRAINT `charger_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `charger_site` (`site_id`);

--
-- 資料表的限制式 `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `fk_coupons_template` FOREIGN KEY (`template_id`) REFERENCES `coupon_templates` (`template_id`);

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
  ADD CONSTRAINT `fk_rental_site` FOREIGN KEY (`rental_site_id`) REFERENCES `charger_site` (`site_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_return_site` FOREIGN KEY (`return_site_id`) REFERENCES `charger_site` (`site_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `order_record_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `order_record_ibfk_3` FOREIGN KEY (`charger_id`) REFERENCES `charger` (`charger_id`);

--
-- 資料表的限制式 `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`),
  ADD CONSTRAINT `fk_orders_template` FOREIGN KEY (`template_id`) REFERENCES `coupon_templates` (`template_id`);

--
-- 資料表的限制式 `user_missions`
--
ALTER TABLE `user_missions`
  ADD CONSTRAINT `user_missions_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`mission_id`),
  ADD CONSTRAINT `user_missions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
