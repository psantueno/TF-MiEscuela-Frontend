import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import {
  Home,
  School,
  Person,
  Notifications,
  Mail,
  Assessment,
  Today
} from '@mui/icons-material';
import LogoMiEscuela from "../assets/img/logo_oficial.png"


export const Sidebar = ({ moduloActivo, onModuleChange }) => {
  const navigate = useNavigate();


  const menuItems = [
    { id: 'general', text: 'Panel General', icon: <Home /> },
    { id: 'alumnos', text: 'Alumnos', icon: <School /> },
    { id: 'docentes', text: 'Docentes', icon: <Person /> },
    { id: 'asistencias', text: 'Asistencias', icon: <Today /> },
    { id: 'notificaciones', text: 'Notificaciones', icon: <Notifications /> },
    { id: 'mensajes', text: 'Mensajes', icon: <Mail /> },
    { id: 'informes', text: 'Informes', icon: <Assessment /> },
  ];

const handleItemClick = (item) => {
    onModuleChange(item.id);
    // Agregar navegación con react-router
    if (item.id === 'general') {
      navigate('/');
    } else {
      navigate(`/${item.id}`);
    }
  };


  return (
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
          backgroundColor: '#1252D3',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto'
        }}>
          {/* <School sx={{ color: 'white', fontSize: 30 }} /> */}
          <img
            src={LogoMiEscuela}
            alt="Logo oficial"
            style={{ width: '100%', height: '100%', objectFit: 'contain' , borderRadius: '50%'}}
          />
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
              onClick={() => handleItemClick(item)}
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
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: moduloActivo === item.id ? 600 : 400,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

