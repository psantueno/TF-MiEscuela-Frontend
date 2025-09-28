import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBell,
  FaEnvelope,
  FaChartBar,
  FaHome,
} from "react-icons/fa";
import logo from "../assets/img/logo_oficial.png";

const drawerWidth = 240;

export const Sidebar = ({ moduloActivo, cambiarModulo }) => {
  const menuItems = [
    { id: 'general', text: "Panel General", icon: <FaHome /> },
    { id: 'alumnos', text: "Alumnos", icon: <FaUserGraduate /> },
    { id: 'docentes', text: "Docentes", icon: <FaChalkboardTeacher /> },
    { id: 'notificaciones', text: "Notificaciones", icon: <FaBell /> },
    { id: 'mensajes', text: "Mensajes", icon: <FaEnvelope /> },
    { id: 'informes', text: "Informes", icon: <FaChartBar /> },
  ];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#061B46",
          color: "white",
          marginTop: "64px",
          height: "calc(100vh - 64px)",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* Logo y título */}
      <Box sx={{ flexDirection: "column", textAlign: "center", p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={logo} alt="Logo" style={{ width: 80, marginBottom: 10 }} />
        <Typography variant="h6">MiEscuela 4.0</Typography>
      </Box>
      
      {/* Lista de navegación */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.id}
            onClick={() => cambiarModulo(item.id)}
            sx={{
              backgroundColor: moduloActivo === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRight: moduloActivo === item.id ? '3px solid #1976d2' : '3px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
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
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};