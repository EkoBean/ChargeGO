// ======scss==========
import '../styles/scss/global.scss'
import React, { useEffect } from 'react';

// =========== Routers =================
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// =========== elements ==================
import NavBar from '../components/nav'
import AppIndex from './mapIndex/AppIndex'



function App() {
  useEffect(() => {
    // document.getElementById('div1').innerText = 'this is a text from useEffect()';


  }, [])
  return (
    <>
        <Routes>
          <Route path='/AppIndex' element={<AppIndex />} />
        </Routes>


    </>
  );
}


export default App
