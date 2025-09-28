import { Box, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: "center",
        py: 2,
        backgroundColor: "#f5f7fa",
        borderTop: "1px solid #ddd",
        mt: "auto",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} MiEscuela 4.0 – Todos los derechos reservados
      </Typography>
    </Box>
  );
};
