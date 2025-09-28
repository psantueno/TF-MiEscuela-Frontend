import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fade
} from '@mui/material';
import {
  NotificationsOutlined,
  Home,
  School,
  Person,
  Notifications,
  Mail,
  Assessment
} from '@mui/icons-material';
import { Asistencias } from './Asistencias';

// Componentes para cada módulo
const PanelGeneral = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Panel General
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Bienvenido al sistema de gestión escolar MiEscuela 4.0
    </Typography>

    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 3,
      mb: 4
    }}>
      <Box sx={{
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#0A2E75', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
          Estudiantes Activos
        </Typography>
        <Typography variant="h3" sx={{ color: '#333', fontWeight: 'bold' }}>
          1,247
        </Typography>
      </Box>

      <Box sx={{
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#0A2E75', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
          Docentes
        </Typography>
        <Typography variant="h3" sx={{ color: '#333', fontWeight: 'bold' }}>
          89
        </Typography>
      </Box>

      <Box sx={{
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: '#0A2E75', mb: 1, fontSize: '1.1rem', fontWeight: 500 }}>
          Cursos Activos
        </Typography>
        <Typography variant="h3" sx={{ color: '#333', fontWeight: 'bold' }}>
          42
        </Typography>
      </Box>
    </Box>

    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <Assessment sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Área de contenido adicional
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí puedes agregar más widgets, gráficos o información
      </Typography>
    </Box>
  </Box>
);

const ModuloAlumnos = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Gestión de Alumnos
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Administra la información de los estudiantes
    </Typography>
    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <School sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Módulo de Alumnos
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí irían las funcionalidades de gestión de estudiantes
      </Typography>
    </Box>
  </Box>
);

const ModuloDocentes = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Gestión de Docentes
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Administra la información del personal docente
    </Typography>
    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <Person sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Módulo de Docentes
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí irían las funcionalidades de gestión del personal
      </Typography>
    </Box>
  </Box>
);

const ModuloNotificaciones = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Notificaciones
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Centro de notificaciones del sistema
    </Typography>
    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <Notifications sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Módulo de Notificaciones
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí irían las notificaciones y alertas
      </Typography>
    </Box>
  </Box>
);

const ModuloMensajes = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Mensajería
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Sistema de comunicación interna
    </Typography>
    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <Mail sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Módulo de Mensajes
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí irían las funcionalidades de mensajería
      </Typography>
    </Box>
  </Box>
);

const ModuloInformes = () => (
  <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', mb: 3, fontWeight: 600 }}>
      Informes y Reportes
    </Typography>
    <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
      Generación y visualización de reportes
    </Typography>
    <Box sx={{
      p: 4,
      border: '2px dashed #ddd',
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <Assessment sx={{ fontSize: 48, color: '#0A2E75', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Módulo de Informes
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Aquí irían los reportes y estadísticas
      </Typography>
    </Box>
  </Box>
);

export const Dashboard = () => {
  const [moduloActivo, setModuloActivo] = useState('general');

  const menuItems = [
    { id: 'general', text: 'Panel General', icon: <Home /> },
    { id: 'alumnos', text: 'Alumnos', icon: <School /> },
    { id: 'docentes', text: 'Docentes', icon: <Person /> },
    { id: 'asistencias', text: 'Asistencias', icon: <Assessment /> },
    { id: 'notificaciones', text: 'Notificaciones', icon: <Notifications /> },
    { id: 'mensajes', text: 'Mensajes', icon: <Mail /> },
    { id: 'informes', text: 'Informes', icon: <Assessment /> },
  ];

  const modulos = {
    general: <PanelGeneral />,
    alumnos: <ModuloAlumnos />,
    docentes: <ModuloDocentes />,
    notificaciones: <ModuloNotificaciones />,
    mensajes: <ModuloMensajes />,
    informes: <ModuloInformes />,
    asistencias: <Asistencias />
  };

  const getCurrentModuleName = () => {
    return menuItems.find(item => item.id === moduloActivo)?.text || 'Panel General';
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#ffffff',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
          zIndex: 1300
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* Logo/Título izquierda */}
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A2E75' }}>
            MiEscuela 4.0
          </Typography>

          {/* Módulo actual centro */}
          <Typography variant="body1" sx={{ color: '#666' }}>
            {getCurrentModuleName()}
          </Typography>

          {/* Controles derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                border: '1px solid #ffeaa7'
              }}
            >
              Free Trial - 30 Days Trial
            </Typography>

            <IconButton size="small" sx={{ color: '#666' }}>
              <NotificationsOutlined />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1, backgroundColor: '#0A2E75' }}>
                J
              </Avatar>
              <Typography variant="body2" sx={{ color: '#333' }}>
                John Doremon
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Layout principal */}
      <Box sx={{ display: 'flex', height: '100vh', pt: 8 }}>
        {/* Sidebar */}
        <Box sx={{
          width: 240,
          backgroundColor: '#061B46',
          color: 'white',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          flexShrink: 0
        }}>
          {/* Header del sidebar */}
          <Box sx={{
            p: 3,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              backgroundColor: '#0A2E75',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <School sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              MiEscuela 4.0
            </Typography>
          </Box>

          {/* Menu items */}
          <List sx={{ pt: 2, px: 1 }}>
            {menuItems.map((item) => (
              <ListItem disablePadding key={item.id}>
                <ListItemButton
                  selected={moduloActivo === item.id}
                  onClick={() => setModuloActivo(item.id)}
                  sx={{
                    backgroundColor: moduloActivo === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderRight: moduloActivo === item.id ? '3px solid #1976d2' : '3px solid transparent',
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden'
        }}>
          <Fade in={true} timeout={300} key={moduloActivo}>
            <Box sx={{ height: '100%' }}>
              {modulos[moduloActivo]}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};