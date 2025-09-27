// src/components/Nav.jsx
import * as React from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

export default function Nav() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          backgroundColor: "#020917",
          color: "#ffffff",
          "&:hover": { backgroundColor: "#020917" },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: "#020917",
            color: "#ffffff",
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            component={Link}
            to={item.path}
            onClick={handleClose}
            sx={{
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              color: "#ffffff",
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
