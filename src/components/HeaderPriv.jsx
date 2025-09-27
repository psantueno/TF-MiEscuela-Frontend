// src/components/HeaderPriv.jsx
import * as React from "react";
import { Box, AppBar, Toolbar, IconButton, InputBase, Avatar, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Nav from "./Nav";
import logo from "../img/logo.png";

export default function HeaderPriv() {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#020917", backdropFilter: "blur(10px)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Logo y nombre */}
        <Box display="flex" alignItems="center" gap={2}>
          <img src={logo} alt="Logo" style={{ height: 40, width: 40, borderRadius: "50%" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
            Mi Escuela 4.0
          </Typography>
        </Box>

        {/* Barra de búsqueda */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "9999px",
            px: 2,
            height: 45,
            width: 260,
          }}
        >
          <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
          <InputBase
            placeholder="Buscar..."
            sx={{
              ml: 1,
              flex: 1,
              color: "#ffffff",
              fontSize: "0.875rem",
            }}
          />
        </Box>

        {/* Acciones + Menú lateral */}
        <Box display="flex" alignItems="center" gap={3}>
          {/* Notificaciones */}
          <IconButton sx={{ color: "#ffffff" }}>
            🔔
          </IconButton>

          {/* Menú de navegación */}
          <Nav />

          {/* Perfil */}
          <Avatar
            alt="User"
            src="https://i.pravatar.cc/40"
            sx={{ cursor: "pointer" }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
