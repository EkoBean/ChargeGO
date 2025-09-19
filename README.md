# ChargeGO 行動電源租借系統

## 專案概述 (Project Overview)

ChargeGO 是一個整合前後台的行動電源租借系統，旨在提供便利的電力支援服務。系統包含形象網站、租借平台及管理後台，支援手機與電腦端操作。

ChargeGO is an integrated mobile power bank rental system designed to provide convenient power support services. The system includes an image website, rental platform, and admin backend, supporting both mobile and desktop operations.

## 頁面架構 (Page Architecture)

### 1. 主視覺網站 (Main Visual Website)
- **位置**: website.jsx
- **功能**: 品牌形象展示、服務介紹、合作招募。
- **Location**: website.jsx
- **Features**: Brand image display, service introduction, partnership recruitment.

### 2. 租借系統 (Rental System)
#### 2.1 地圖系統本身 (Map System)
- **位置**: `./src/mapIndex/mapindex.jsx`
- **功能**: 地圖導航、站點查詢、QR 碼租借與歸還。
- **Location**: `./src/mapIndex/mapindex.jsx`
- **Features**: Map navigation, station search, QR code rental and return.

#### 2.2 會員系統 (Membership System)
- **位置**: `./src/membersystem/`
- **功能**: 註冊登入、個人資料管理、租借記錄。
- **Location**: `./src/membersystem/`
- **Features**: Registration/login, profile management, rental history.

#### 2.3 優惠券商城 (Coupon Mall)
- **位置**: `./src/mall`
- **功能**: 優惠券瀏覽、兌換、應用於租借。
- **Location**: `./src/mall`
- **Features**: Coupon browsing, redemption, application to rentals.

### 3. 後臺系統 (Admin System)
- **位置**: admin
- **功能**: 訂單管理、站點維護、客戶服務、數據分析。
- **Location**: admin
- **Features**: Order management, station maintenance, customer service, data analysis.

## 技術棧 (Tech Stack)
- 前端: React, Vite
- 後端: Node.js, Express
- 資料庫: MySQL
- 地圖: Google Maps API
