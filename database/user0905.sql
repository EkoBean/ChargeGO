-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-09-05 14:59:16
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
-- 資料表結構 `user`
--

CREATE TABLE `user` (
  `uid` int(10) NOT NULL COMMENT '使用者編號',
  `login_id` varchar(255) NOT NULL COMMENT '登入帳號',
  `user_name` varchar(30) NOT NULL COMMENT '使用者姓名',
  `telephone` varchar(30) NOT NULL COMMENT '電話',
  `email` varchar(50) NOT NULL COMMENT '電子郵件',
  `password` varchar(50) NOT NULL COMMENT '雜湊密碼',
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

INSERT INTO `user` (`uid`, `login_id`, `user_name`, `telephone`, `email`, `password`, `country`, `address`, `blacklist`, `wallet`, `point`, `total_carbon_footprint`, `credit_card_number`, `credit_card_date`, `status`) VALUES
(1, 'testuser1', 'user1', '0987654321', 'test@gmail.com', '123456', '台中市', '南屯區公益路二段51號18樓', 0, 200, 100, 300.5550, '123456789101112', '12/26', '0'),
(2, 'testuser2', 'user2', '0975738564', 'test2@gmail.com', '123456', '台中市', '西區臺灣大道二段412號', 3, 0, 0, 300.0000, '492900000000000', '11/30', '0'),
(3, 'testuser3', 'user3', '0987654321', 'test3@gmail.com', '123456', '台北市', '松山區民生東路四段133號8樓', 0, 99999, 99199, 0.0000, '340000000000000', '11/27', '0'),
(6, 'abc123', 'userTT', '0956874519', 'kkk@g.com', '03ac674216', '新竹市', 'XXXXXXXXXX', 0, 0, 0, 0.0000, '1234567891023456', '12/28', '0');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `user`
--
ALTER TABLE `user`
  MODIFY `uid` int(10) NOT NULL AUTO_INCREMENT COMMENT '使用者編號', AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
