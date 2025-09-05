import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./pages/App";
import "./styles/scss/global.scss";

createRoot(document.getElementById("root")).render(
  <Router>
    <App />
  </Router>
);
