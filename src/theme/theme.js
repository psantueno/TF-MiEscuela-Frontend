import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0A2E75", // azul principal
      light: "#1252D3", 
      dark: "#061B46",
    },
    background: {
      default: "#ffffff", // fondo blanco
      paper: "#ffffff",   // componentes como Card, Drawer
    },
    text: {
      primary: "#061B46",
      secondary: "#2A2E38",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600 },
  },
});
