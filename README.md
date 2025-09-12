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



