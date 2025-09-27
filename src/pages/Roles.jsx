// src/pages/Roles.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import HeaderPriv from "../components/HeaderPriv.jsx";
import Profile from "./Profile";
import { Box, Typography, Card, CardContent } from "@mui/material";

// Mock de usuarios
const MOCK_USERS = [
  { id: 1, email: "directivo@uni.edu", pass: "123456", role: "Directivo", name: "Ana Directiva" },
  { id: 2, email: "docente@uni.edu", pass: "123456", role: "Docente", name: "Ana Roda" },
  { id: 3, email: "padre@uni.edu", pass: "123456", role: "Padre", name: "Carlos Pérez" },
  { id: 4, email: "alumno@uni.edu", pass: "123456", role: "Alumno", name: "Juan López" },
];

// Componente Dashboard usando MUI Card
function Dashboard({ user }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Card sx={{ minWidth: 300, maxWidth: 500, bgcolor: "#f9f9f9", p: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Bienvenido, {user.name} 👋
          </Typography>
          <Typography variant="body1">
            Rol: <strong>{user.role}</strong>
          </Typography>
          <Typography variant="body1">
            Email: <strong>{user.email}</strong>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function Roles() {
  const [user, setUser] = useState(null);

  // Persistir login en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = ({ email, password }) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.pass === password
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
    } else {
      alert("Credenciales inválidas 🚫");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleUpdateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <Router>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <HeaderPriv user={user} onLogout={handleLogout} />

          <Box component="main" sx={{ flex: 1, p: 3 }}>
            <Routes>
              {/* Página principal */}
              <Route path="/" element={<Dashboard user={user} />} />

              {/* Perfil */}
              <Route
                path="/profile"
                element={
                  <Profile
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                    onLogout={handleLogout}
                  />
                }
              />

              {/* Redirigir rutas desconocidas */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      )}
    </Router>
  );
}
