import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '../scss/style.scss';
import NavBar from './reuse_component/nav.jsx'


function App() {

  useEffect(() => {
    document.getElementById('div1').innerText = 'Click Me(react)';
    document.querySelector('ul li').style.color = '#FF2051';


  }, [])
  return (
    <>
      <NavBar />
      <div id='div1' className='btn btn-primary'></div>
      <div
        class="card text-white bg-primary"
      >
        <img class="card-img-top" src="holder.js/100px180/" alt="Title" />
        <div class="card-body">
          <h4 class="card-title">Title</h4>
          <p class="card-text">Text</p>
        </div>
      </div>


    </>
  );
}


// ReactDOM.render(<App />,  document.getElementById('root'));  
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);