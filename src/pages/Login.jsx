// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin({ email, password });
    if (success) {
      navigate("/profile"); // <--- redirige siempre a profile
    } else {
      alert("Credenciales inválidas 🚫");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
      <Typography variant="h4" mb={3}>Iniciar sesión</Typography>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} width={300}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" sx={{ backgroundColor: "#020917" }}>
          Iniciar Sesión
        </Button>
      </Box>
    </Box>
  );
}
