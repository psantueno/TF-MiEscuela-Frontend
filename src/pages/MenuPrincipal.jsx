import { Box, Toolbar, Container, Typography } from "@mui/material";
import { Sidebar } from "../components/SideBar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const MenuPrincipal = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Header />

        {/* Espaciador para que Sidebar no quede tapado */}
        <Toolbar />

        {/* Main */}
        <Container sx={{ flex: 1, py: 4, backgroundColor: "#ffffff" }}>
          <Typography variant="h4" gutterBottom color="primary">
            Panel General
          </Typography>
          <Typography variant="body1">
            Selecciona un módulo desde la izquierda para continuar.
          </Typography>
        </Container>

        {/* Footer (siempre abajo) */}
        <Footer />
      </Box>
    </Box>
  );
};