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
          <Route path='/' element={<Register />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Register />} />
        </Routes>

    </>
  );
}


export default App
