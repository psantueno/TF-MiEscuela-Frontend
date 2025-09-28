import { useState } from 'react'
import './App.css'
import { MenuPrincipal } from './pages/MenuPrincipal';
import { Login } from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() { 
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* Ruta inicial */}
        <Route path="/" element={<MenuPrincipal />} />
        <Route path="/login" element={<Login />} />

        {/* Ejemplo de otras rutas futuras */}
        {/* <Route path="/asistencia" element={<Asistencia />} /> */}
        {/* <Route path="/calificaciones" element={<Calificaciones />} /> */}
      </Routes>
    </Router>
  )
}

export default App
