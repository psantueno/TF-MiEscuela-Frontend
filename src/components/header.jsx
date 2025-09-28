import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#0A2E75",
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Bienvenido a MiEscuela 4.0
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {/* Aquí podrías agregar el nombre del usuario o un botón de logout */}
        <Typography variant="body1">Usuario</Typography>
      </Toolbar>
    </AppBar>
  );
};
