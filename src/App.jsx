import './App.css'
import UserProvider from "./contexts/UserContext/UserProvider";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() { 
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Ruta inicial */}
          <Route path="/" element={<Dashboard/>} />
          <Route path="/login" element={<Login />} />

          {/* Ejemplo de otras rutas futuras */}
          {/* <Route path="/asistencia" element={<Asistencia />} /> */}
          {/* <Route path="/calificaciones" element={<Calificaciones />} /> */}
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App
