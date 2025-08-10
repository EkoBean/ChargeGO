import '../styles/scss/global.scss'
import React, { useEffect } from 'react';
import NavBar from '../components/nav'


function App(){
useEffect(()=>{
  document.getElementById('div1').innerText = '1230jdsklfj'; 


}, [])
return(
  <>
    <NavBar />
    <div id='div1'>
    </div>
    <ul>
      <li>1</li>
      <li>1</li>
      <li>1</li>
      <li>1</li>
    </ul>
  </>
);
}


export default App
