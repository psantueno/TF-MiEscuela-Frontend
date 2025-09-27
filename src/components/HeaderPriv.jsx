// src/components/HeaderPriv.jsx
import * as React from "react";
import { Box, AppBar, Toolbar, InputBase, Avatar, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Nav from "./Nav";
import logo from "../img/logo.png";

export default function HeaderPriv() {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#020917", backdropFilter: "blur(10px)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>

        {/* Menú a la izquierda */}
        <Box 
        display="flex"
          alignItems="center"
          gap={1}
          sx={{ position: "absolute", transform: "translateX(-2300%)" }}>
          <Nav />
        </Box>

        {/* Logo centrado */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
        >
          <img src={logo} alt="Logo" style={{ height: 40, width: 40, borderRadius: "50%" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff", fontSize: "1.2rem",whiteSpace: "nowrap" }}>
            Mi Escuela 4.0
          </Typography>
        </Box>

        {/* Búsqueda + avatar a la derecha */}
        <Box display="flex" alignItems="center" gap={1} ml="auto"   sx={{ position: "absolute", left: "50%", transform: "translateX(245%)" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "9999px",
              px: 2,
              height: 45,
              width: 180,
            }}
          >
            <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
            <InputBase
              placeholder="Buscar..."
              sx={{ ml: 1, flex: 1, color: "#ffffff", fontSize: "0.875rem" }}
            />
          </Box>

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
