-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-08-26 09:40:50
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.1.25

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

--
-- 已傾印資料表的索引
--

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
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_record`
--
ALTER TABLE `order_record`
  MODIFY `order_ID` int(10) NOT NULL AUTO_INCREMENT COMMENT '訂單編號', AUTO_INCREMENT=22;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `order_record`
--
ALTER TABLE `order_record`
  ADD CONSTRAINT `fk_rental_site` FOREIGN KEY (`rental_site_id`) REFERENCES `charger_site` (`site_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_return_site` FOREIGN KEY (`return_site_id`) REFERENCES `charger_site` (`site_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `order_record_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `order_record_ibfk_3` FOREIGN KEY (`charger_id`) REFERENCES `charger` (`charger_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
