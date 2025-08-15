// ======scss==========
import '../styles/scss/global.scss'
import React, { useEffect } from 'react';

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// =========== elements ==================
import NavBar from '../components/nav'
import AppIndex from './mapIndex/AppIndex'
import Register from './membersystem/register'
import Login from './membersystem/login'


function App() {

  return (
    <>
        <Routes>
          <Route path='/AppIndex' element={<AppIndex />} />
          <Route path='/' />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Register />} />
          {/* 這個以後可以來寫個no Found頁 */}
        </Routes>

    </>
  );
}


export default App
