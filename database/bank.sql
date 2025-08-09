-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-08-09 11:37:05
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
-- 資料庫： `bank`
--

-- --------------------------------------------------------

--
-- 資料表結構 `credit_card`
--

CREATE TABLE `credit_card` (
  `bankuser_id` int(10) NOT NULL COMMENT '銀行使用者編號',
  `bankuser_name` varchar(30) NOT NULL COMMENT '客戶姓名',
  `credit_card_number` varchar(16) NOT NULL COMMENT '信用卡號',
  `credit_card_date` varchar(5) NOT NULL COMMENT '信用卡終止日期',
  `cvc` varchar(3) NOT NULL COMMENT '安全碼'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `credit_card`
--

INSERT INTO `credit_card` (`bankuser_id`, `bankuser_name`, `credit_card_number`, `credit_card_date`, `cvc`) VALUES
(1, 'testuser1', '123456789101112', '12/26', '123'),
(2, 'testuser2', '492900000000000', '11/30', '321'),
(3, 'testuser3', '340000000000000', '11/27', '789');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `credit_card`
--
ALTER TABLE `credit_card`
  ADD PRIMARY KEY (`bankuser_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `credit_card`
--
ALTER TABLE `credit_card`
  MODIFY `bankuser_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '銀行使用者編號', AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
