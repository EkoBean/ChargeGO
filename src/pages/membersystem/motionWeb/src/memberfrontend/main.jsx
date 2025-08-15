import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// 確保根元素存在
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("找不到根元素 'root'，請確認 HTML 中存在此元素");
}

// 渲染應用
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);