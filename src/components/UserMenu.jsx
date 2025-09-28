import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  ExitToApp,
  Notifications,
  Person,
  School,
  AdminPanelSettings,
  SupervisedUserCircle,
  CalendarMonth
} from '@mui/icons-material';

export const UserMenu = ({ usuario = null }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Usuario mock para desarrollo
  const currentUser = usuario || {
    nombre: 'John Doremon',
    email: 'john.doremon@miescuela.com',
    rol: 'director', // 'alumno', 'docente', 'auxiliar', 'director', 'admin'
    foto: null, // URL de la foto o null para usar avatar por defecto
    notificaciones: 3
  };

  // Configuración de avatares según rol
  const getRoleConfig = (rol) => {
    const configs = {
      alumno: {
        color: '#2196F3',
        icon: <School />,
        label: 'Estudiante'
      },
      docente: {
        color: '#4CAF50',
        icon: <Person />,
        label: 'Docente'
      },
      auxiliar: {
        color: '#FF9800',
        icon: <SupervisedUserCircle />,
        label: 'Auxiliar'
      },
      director: {
        color: '#9C27B0',
        icon: <AdminPanelSettings />,
        label: 'Director'
      },
      admin: {
        color: '#F44336',
        icon: <Settings />,
        label: 'Administrador'
      }
    };
    return configs[rol] || configs.alumno;
  };

  const roleConfig = getRoleConfig(currentUser.rol);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    console.log('Ir a perfil');
    // Aquí irías a la página de perfil
    handleClose();
  };

  const handleSettings = () => {
    console.log('Ir a configuración');
    // Aquí irías a configuración
    handleClose();
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      console.log('Cerrar sesión');
      // Aquí harías logout
      // navigate('/login');
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Fecha actual (reemplaza el free trial) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CalendarMonth sx={{ fontSize: 16, color: '#666' }} />
        <Typography variant="body2" sx={{ 
          color: '#666',
          fontSize: '0.8rem',
          fontWeight: 500
        }}>
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long'
          })}
        </Typography>
      </Box>

      {/* Notificaciones */}
      <IconButton size="small" sx={{ color: '#666' }}>
        <Badge badgeContent={currentUser.notificaciones} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      
      {/* Área de usuario clickeable */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          },
          transition: 'background-color 0.2s'
        }}
        onClick={handleClick}
      >
        <Avatar 
          src={currentUser.foto} 
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 1,
            backgroundColor: roleConfig.color,
            fontSize: '0.9rem'
          }}
        >
          {currentUser.foto ? null : (
            currentUser.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)
          )}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
            {currentUser.nombre}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
            {roleConfig.label}
          </Typography>
        </Box>
      </Box>

      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Información del usuario */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={currentUser.foto}
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1.5,
                backgroundColor: roleConfig.color 
              }}
            >
              {currentUser.foto ? null : roleConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {currentUser.nombre}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                {currentUser.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: roleConfig.color, 
                    borderRadius: '50%', 
                    mr: 0.5 
                  }} 
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: roleConfig.color }}>
                  {roleConfig.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Opciones del menú */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mi Perfil" />
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <ExitToApp fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </MenuItem>
      </Menu>
    </Box>
  );
};
