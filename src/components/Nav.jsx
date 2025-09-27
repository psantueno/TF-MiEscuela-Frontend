// src/components/Nav.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Menu, MenuItem, ListItemText } from "@mui/material";

export default function Nav() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const menuItems = [
    { label: "Asistencia", path: "/asistencia" },
    { label: "Curso", path: "/curso" },
    { label: "Evento", path: "/evento" },
    { label: "Notas", path: "/notas" },
    { label: "Observaciones", path: "/observaciones" },
    { label: "Chats", path: "/chats" },
    { label: "Reporte", path: "/reporte" },
    { label: "Ajustes", path: "/ajustes" },
  ];

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          backgroundColor: "#061B46",
          color: "#fff",
          "&:hover": { backgroundColor: "#0b2a60" },
        }}
        variant="contained"
      >
        Menú {open ? "✕" : "☰"}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        PaperProps={{
          sx: {
            bgcolor: "#061B46",
            color: "#fff",
            mt: 1,
          },
        }}
      >
        {menuItems.map(({ label, path }) => (
          <MenuItem
            key={label}
            onClick={handleClose}
            component={Link}
            to={path}
            sx={{
              "&:hover": { backgroundColor: "#0b2a60" },
            }}
          >
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
