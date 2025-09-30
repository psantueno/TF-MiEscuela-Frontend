import * as React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  InputBase,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Nav from "./Nav";
import logo from "../img/logo.png";

export default function HeaderPriv({ user, onLogout }) {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#020917",
        backdropFilter: "blur(10px)",
        px: 2,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Menú a la izquierda */}
        <Nav />

        {/* Logo centrado */}
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: 40, width: 40, borderRadius: "50%" }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#ffffff",
              fontSize: "1.2rem",
              whiteSpace: "nowrap",
            }}
          >
            Mi Escuela 4.0
          </Typography>
        </Box>

        {/* Búsqueda + avatar + logout a la derecha */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "9999px",
              px: 2,
              height: 40,
              width: 180,
            }}
          >
            <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
            <InputBase
              placeholder="Buscar..."
              sx={{ ml: 1, flex: 1, color: "#ffffff", fontSize: "0.875rem" }}
            />
          </Box>

          {/* Avatar dinámico */}
          <Avatar
            alt="User"
            src={user?.photo || "/avatar-default.png"}
            sx={{ cursor: "pointer" }}
          />

          <Button
            onClick={onLogout}
            variant="contained"
            sx={{
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#b71c1c" },
              textTransform: "none",
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
