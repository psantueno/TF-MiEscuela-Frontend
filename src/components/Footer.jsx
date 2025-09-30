// src/components/Footer.jsx
import React from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import {
  Facebook,
  Instagram,
  Email,
  Phone,
  WhatsApp,
  LocationOn,
} from "@mui/icons-material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "#020917",
        color: "#ffffff",
        textAlign: "center",
        py: 3,
        mt: 4,
      }}
    >
      {/* Texto principal */}
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; 2024 Mi Escuela. Todos los derechos reservados.
      </Typography>

      {/* Redes sociales */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <IconButton
          component="a"
          href="https://www.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#ffffff" }}
        >
          <Facebook />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#ffffff" }}
        >
          <Instagram />
        </IconButton>
        <IconButton
          component="a"
          href="mailto:correo@ejemplo.com"
          sx={{ color: "#ffffff" }}
        >
          <Email />
        </IconButton>
        <IconButton component="a" href="tel:+5491112345678" sx={{ color: "#ffffff" }}>
          <Phone />
        </IconButton>
        <IconButton
          component="a"
          href="https://wa.me/5491112345678"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#ffffff" }}
        >
          <WhatsApp />
        </IconButton>
        <IconButton
          component="a"
          href="https://maps.google.com?q=Dirección+Falsa+123,+Buenos+Aires"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#ffffff" }}
        >
          <LocationOn />
        </IconButton>
      </Stack>

      {/* Dirección */}
      <Typography variant="caption" display="block">
        Dirección Falsa 123, Buenos Aires, Argentina
      </Typography>
      <Typography variant="caption" display="block">
        Tel: +54 9 11 1234-5678 | Email: correo@ejemplo.com
      </Typography>
    </Box>
  );
}
