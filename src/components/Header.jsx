// src/components/Header.jsx
import * as React from 'react';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../img/logo.png';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#020917' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
        {/* Logo y texto clickeables */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: 40, marginRight: 8, borderRadius: '50%', cursor: 'pointer' }}
          />
          <Typography
            variant="h6"
            component="p"
            sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#ffffff', cursor: 'pointer' }}
          >
            Mi Escuela 4.0
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
