import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBell,
  FaEnvelope,
  FaChartBar,
} from "react-icons/fa";
import logo from "../assets/img/logo_oficial.png";

const drawerWidth = 240;

export const Sidebar = () => {
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
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar sx={{ flexDirection: "column", textAlign: "center", mt: 2 }}>
        <img src={logo} alt="Logo" style={{ width: 80, marginBottom: 10 }} />
        <Typography variant="h6">MiEscuela 4.0</Typography>
      </Toolbar>
      <List>
        {[
          { text: "Alumnos", icon: <FaUserGraduate /> },
          { text: "Docentes", icon: <FaChalkboardTeacher /> },
          { text: "Notificaciones", icon: <FaBell /> },
          { text: "Mensajes", icon: <FaEnvelope /> },
          { text: "Informes", icon: <FaChartBar /> },
        ].map((item, index) => (
          <ListItem button key={index}>
            <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
