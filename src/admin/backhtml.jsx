// import { useState } from 'react'
import { Routes, Route,Link } from 'react-router-dom';
import TodoIndex from './views/todo-index';
import TodoCreate from './views/todo-create';
import TodoEdit from './views/todo-edit';
import TodoDelete from './views/todo-delete';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <>
     <Routes>
      {/*  path="這裡要跟連接的地方一樣" */}
       <Route path="/" element={<TodoIndex />} />
      <Route path="/todo/index" element={<TodoIndex />} />
      <Route path='/todo/create' element={<TodoCreate />} />
      <Route path='/todo/edit/:id' element={<TodoEdit />} />
      <Route path='/todo/delete/:id' element={<TodoDelete />} />
     </Routes>
    </>
  );
}

export default App
