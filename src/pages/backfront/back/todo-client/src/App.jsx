// import { useState } from 'react'
import { Routes, Route,Link } from 'react-router-dom';
import Backhtml from './views/backhtml';
import Charging from './views/backhtml';

import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <>
     <Routes>
       <Route path="/" element={<Backhtml />} />
      <Route path="/backhtml" element={<Backhtml />} />
      <Route path="/charging" element={<Charging />} />
     </Routes>
    </>
  );
}

export default App;
