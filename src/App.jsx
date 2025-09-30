import * as React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Box, Container } from "@mui/material";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";

import Header from "./components/Header.jsx";
import HeaderPriv from "./components/HeaderPriv.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = ({ email, password }) => {
    const MOCK_USERS = [
      {
        email: "directivo@uni.edu",
        password: "123456",
        role: "Directivo",
        firstName: "Ana",
        lastName: "Directiva",
        photo: "/avatar-default.png",
      },
      {
        email: "alumno@uni.edu",
        password: "123456",
        role: "Alumno",
        firstName: "Luis",
        lastName: "Alumno",
        photo: "/avatar-default.png",
      },
      {
        email: "padre@uni.edu",
        password: "123456",
        role: "Padre",
        firstName: "Carlos",
        lastName: "Padre",
        photo: "/avatar-default.png",
      },
      {
        email: "docente@uni.edu",
        password: "123456",
        role: "Docente",
        firstName: "Pepe",
        lastName: "Docente",
        photo: "/avatar-default.png",
      },
    ];

    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const handleUpdateProfile = (updated) => setUser((prev) => ({ ...prev, ...updated }));
  const handleLogout = () => setUser(null);

  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        {/* Header */}
        {user ? <HeaderPriv user={user} onLogout={handleLogout} /> : <Header />}

        {/* Contenido principal */}
        <Box component="main" flex="1" py={4}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={user ? <Navigate to="/profile" /> : <Login onLogin={handleLogin} />}
              />

              {/* Rutas por rol */}
              <Route
                path="/alumno"
                element={
                  user?.role === "Alumno" ? (
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/docente"
                element={
                  user?.role === "Docente" ? (
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/padre"
                element={
                  user?.role === "Padre" ? (
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/directivo"
                element={
                  user?.role === "Directivo" ? (
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              <Route
                path="/profile"
                element={
                  user ? (
                    <Profile user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Rutas desconocidas */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Router>
  );
}
