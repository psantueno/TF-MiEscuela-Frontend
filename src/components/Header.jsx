// src/components/Header.jsx
import * as React from 'react';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import logo from '../img/logo.png';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#020917' }}> {/* fondo igual al login */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box display="flex" alignItems="center">
          <img
            src={logo}
            alt="Logo"
            style={{ height: 40, marginRight: 8, borderRadius: '50%' }}
          />
          <Typography
            variant="h6"
            component="p"
            sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#ffffff' }} // texto blanco
          >
            Mi Escuela 4.0
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}