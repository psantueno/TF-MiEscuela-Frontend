import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Home,
  School,
  Person,
  Notifications,
  Mail,
  Assessment,
  Today,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useResourceDefinitions } from 'react-admin';
import { useState, useEffect } from 'react';
import LogoMiEscuela from "../assets/img/logo_oficial.png";


export const Sidebar = ({ moduloActivo, onModuleChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resourceDefs = useResourceDefinitions();
  // Abrir/cerrar submenú asistencias
  const [openAsistencias, setOpenAsistencias] = useState(false);
  // Abrir asistencias automáticamente si estoy en esa ruta
  useEffect(() => {
    if (location.pathname.startsWith('/asistencias')) {
      setOpenAsistencias(true);
    }
  }, [location.pathname]);

  // Administración: abrir automáticamente si estoy en usuarios/roles/cursos/materias o /administracion
  const [openAdministracion, setOpenAdministracion] = useState(false);
  useEffect(() => {
    if (
      location.pathname.startsWith('/administracion') ||
      location.pathname.startsWith('/usuarios') ||
      location.pathname.startsWith('/roles') ||
      location.pathname.startsWith('/cursos') ||
      location.pathname.startsWith('/materias')
    ) {
      setOpenAdministracion(true);
    }
  }, [location.pathname]);
  // Recursos declarados en <Resource>, excepto asistencias
  const resourceItems = Object.values(resourceDefs)
    .filter(
      def =>
        def.hasList &&
        def.name !== 'asistencias' &&
        // Estos se mostrarán bajo Administración
        def.name !== 'usuarios' &&
        def.name !== 'roles' &&
        def.name !== 'cursos' &&
        def.name !== 'materias'
    )
    .map(def => {
      const Icon = def.icon || Home;
      return {
        id: def.name,
        text: def.options?.label || def.name,
        icon: <Icon />,
        to: `/${def.name}`,
      };
    });
  const handleItemClick = (item) => {
    onModuleChange?.(item.id);
    navigate(item.to);
  };
  // helper para aplicar estilos activos
  const isActive = (to) => location.pathname === to;
  // estilo base de los botones
  const getButtonStyle = (active) => ({
    backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderRight: active ? '3px solid #1976d2' : '3px solid transparent',
  });
  const getTextStyle = (active) => ({
    '& .MuiListItemText-primary': {
      fontSize: '0.9rem',
      fontWeight: active ? 600 : 400,
    },
  });
  return (
    <Box sx={{
      width: 240,
      backgroundColor: '#061B46',
      color: 'white',
      height: 'calc(100vh - 64px)',
      overflow: 'auto',
      flexShrink: 0
    }}>
      {/* Header */}
      <Box sx={{
        p: 3,
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{
          width: 60,
          height: 60,
          backgroundColor: '#1252D3',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto'
        }}>
          <img
            src={LogoMiEscuela}
            alt="Logo oficial"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          MiEscuela 4.0
        </Typography>
      </Box>
      {/* Menu */}
      <List sx={{ pt: 2, px: 1 }}>
        {/* Panel General */}
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive('/')}
            onClick={() => handleItemClick({ id: 'general', to: '/' })}
            sx={getButtonStyle(isActive('/'))}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Panel General" sx={getTextStyle(isActive('/'))} />
          </ListItemButton>
        </ListItem>
        {/* Recursos estándar */}
        {resourceItems.map((item) => (
          <ListItem disablePadding key={item.id}>
            <ListItemButton
              selected={isActive(item.to)}
              onClick={() => handleItemClick(item)}
              sx={getButtonStyle(isActive(item.to))}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={getTextStyle(isActive(item.to))} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Bloque Administración */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpenAdministracion(!openAdministracion)}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <AdminPanelSettings />
            </ListItemIcon>
            <ListItemText primary="Administración" />
            {openAdministracion ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openAdministracion} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Usuarios */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/usuarios')) }}
              selected={isActive('/usuarios') || location.pathname.startsWith('/administracion/usuarios')}
              onClick={() => handleItemClick({ id: 'administracion', to: '/administracion/usuarios' })}
            >
              <ListItemText primary="Usuarios" sx={getTextStyle(isActive('/usuarios'))} />
            </ListItemButton>
            {/* Roles */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/administracion/roles')) }}
              selected={isActive('/administracion/roles')}
              onClick={() => handleItemClick({ id: 'administracion', to: '/administracion/roles' })}
            >
              <ListItemText primary="Roles" sx={getTextStyle(isActive('/administracion/roles'))} />
            </ListItemButton>
          </List>
        </Collapse>
        {/* Bloque Asistencias */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpenAsistencias(!openAsistencias)}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Today />
            </ListItemIcon>
            <ListItemText primary="Asistencias" />
            {openAsistencias ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openAsistencias} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Registrar asistencia */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/asistencias/registrar')) }}
              selected={isActive('/asistencias/registrar')}
              onClick={() => handleItemClick({ id: 'asistencias-registrar', to: '/asistencias/registrar' })}
            >
              <ListItemText
                primary="Registrar asistencia"
                sx={getTextStyle(isActive('/asistencias/registrar'))}
              />
            </ListItemButton>
            {/* Asistencias recientes */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/asistencias/recientes')) }}
              selected={isActive('/asistencias/recientes')}
              onClick={() => handleItemClick({ id: 'asistencias-recientes', to: '/asistencias/recientes' })}
            >
              <ListItemText primary="Asistencias recientes" sx={getTextStyle(isActive('/asistencias/recientes'))} />
            </ListItemButton>
            {/* Histórico de asistencias */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/asistencias/historico')) }}
              selected={isActive('/asistencias/historico')}
              onClick={() => handleItemClick({ id: 'asistencias-historico', to: '/asistencias/historico' })}
            >
              <ListItemText primary="Reportes" sx={getTextStyle(isActive('/asistencias/historico'))} />
            </ListItemButton>

            {/* Eliminar asistencia */}
            <ListItemButton
              sx={{ pl: 6, ...getButtonStyle(isActive('/asistencias/eliminar')) }}
              selected={isActive('/asistencias/eliminar')}
              onClick={() => handleItemClick({ id: 'asistencias-eliminar', to: '/asistencias/eliminar' })}
            >
              <ListItemText primary="Eliminar asistencia" sx={getTextStyle(isActive('/asistencias/eliminar'))} />
            </ListItemButton>
          </List>
        </Collapse>
        {/* Otros custom */}
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive('/notificaciones')}
            onClick={() => handleItemClick({ id: 'notificaciones', to: '/notificaciones' })}
            sx={getButtonStyle(isActive('/notificaciones'))}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="Notificaciones" sx={getTextStyle(isActive('/notificaciones'))} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive('/mensajes')}
            onClick={() => handleItemClick({ id: 'mensajes', to: '/mensajes' })}
            sx={getButtonStyle(isActive('/mensajes'))}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Mail />
            </ListItemIcon>
            <ListItemText primary="Mensajes" sx={getTextStyle(isActive('/mensajes'))} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive('/informes')}
            onClick={() => handleItemClick({ id: 'informes', to: '/informes' })}
            sx={getButtonStyle(isActive('/informes'))}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Informes" sx={getTextStyle(isActive('/informes'))} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};
