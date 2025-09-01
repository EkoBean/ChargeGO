import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './pages/App';
// import App_test from './pages/App_test';
createRoot(document.getElementById('root')).render(
  <Router>
    <App/>
  </Router>
);