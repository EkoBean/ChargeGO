<<<<<<< HEAD
# React + Vite

## 在公開本專案前，要先把API key藏好後再公開！！！

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

/The_Final_Profject
  ├── /src                   # 前端程式碼（React 或原生 HTML/JS）
  │     ├── /pages           # 各個頁面
  │     │     ├── Home.jsx   # 首頁
  │     │     ├── Login.jsx  # 登入頁
  │     │     ├── App.jsx    # APP頁
  │     │     ├── Admin.jsx  # 後台操作頁
  │     ├── /components      # 可重複使用的元件
  │     │     ├── NavBar.jsx # 導覽列元件
  │     │     ├── Footer.jsx # 頁尾元件
  │     ├── /styles          # SCSS/CSS 樣式檔案
  │     │     ├── home.scss  # 首頁樣式
  │     │     ├── login.scss # 登入頁樣式
  │     │     ├── app.scss   # APP頁樣式
  │     │     ├── admin.scss # 後台操作樣式
  │     │     └── global.scss # 全域樣式
  │     ├── main.jsx         # React 入口檔案
  │     └── index.html       # Vite 的 HTML 入口檔案
  ├── /backend               # 後端程式碼（Node.js/Express）
  │     ├── server.js        # 後端主程式
  │     ├── /routes          # API 路由
  │     │     ├── auth.js    # 登入相關 API
  │     │     ├── admin.js   # 後台操作相關 API
  │     ├── /controllers     # 控制器邏輯
  │     │     ├── authController.js
  │     │     ├── adminController.js
  │     ├── /models          # 資料庫模型
  │     │     ├── userModel.js
  │     │     ├── adminModel.js
  ├── /public                # 靜態資源（圖片、字型等）
  │     ├── /images          # 圖片檔案
  │     ├── /fonts           # 字型檔案
  ├── /node_modules          # npm 安裝的套件
  ├── package.json           # npm 設定檔
  ├── vite.config.js         # Vite 設定檔
  └── README.md              # 專案說明文件

=======
# ChargeGO 行動電源租借系統

ChargeGO 是一個整合前後台的行動電源租借系統。系統包含形象網站、租借平台及管理後台，支援手機與電腦端操作。

ChargeGO is an integrated mobile power bank rental system. The system includes an image website, rental platform, and admin backend, supporting both mobile and desktop operations.

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
>>>>>>> bad1a344327e1f7fdc3da229a4398f06c751f1c1


