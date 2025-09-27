// src/components/Footer.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "#020917",
        color: "#ffffff",
        textAlign: "center",
        py: 2,
        mt: 2,
      }}
    >
      <Typography variant="body2">
        &copy; 2024 Mi Escuela. Todos los derechos reservados.
      </Typography>
    </Box>
  );
}
