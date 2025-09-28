import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from "@mui/material";
import { NotificationsOutlined, AccountCircle } from "@mui/icons-material";

export const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        color: "#333",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e0e0e0",
        width: "100%", // 👈 Ocupa todo el ancho
        zIndex: (theme) => theme.zIndex.drawer + 1, // 👈 Z-index normal
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Logo y título del lado izquierdo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 600,
              color: "#2c3e50",
            }}
          >
            MiEscuela 4.0
          </Typography>
        </Box>

        {/* Área central - aquí podrías poner breadcrumbs o título de sección */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Panel General
          </Typography>
        </Box>

        {/* Controles del lado derecho */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Badge de prueba gratuita (como en la imagen) */}
          <Typography 
            variant="body2" 
            sx={{ 
              backgroundColor: "#fff3cd", 
              color: "#856404",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid #ffeaa7",
              fontSize: "0.75rem"
            }}
          >
            Free Trial - 30 Days Trial
          </Typography>

          {/* Botón de notificaciones */}
          <IconButton size="small" sx={{ color: "#666" }}>
            <NotificationsOutlined />
          </IconButton>

          {/* Usuario */}
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>J</Avatar>
            <Typography variant="body2" sx={{ color: "#333" }}>
              John Doremon
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};