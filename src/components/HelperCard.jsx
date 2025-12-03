import { Box, Paper, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Card de ayuda reutilizable con el mismo estilo usado en el módulo de asistencias.
// Recibe un título y una lista de textos a mostrar en formato de lista.
const HelperCard = ({ title, items = [] }) => (
  <Paper
    sx={{
      display: "flex",
      gap: 1.5,
      p: 2,
      mb: 4.5,
      mt: 3,
      backgroundColor: "#F8FBFF",
      border: "1px solid #dfe4ec",
      boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
      borderRadius: 2,
      alignItems: "flex-start",
    }}
  >
    <InfoOutlinedIcon sx={{ color: "#0B6BCB" }} />
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0B6BCB" }}>
        {title}
      </Typography>
      <Box
        component="ul"
        sx={{
          m: 0,
          mt: 0.5,
          pl: 2,
          color: "#37474F",
          "& li": { mb: 0.5 },
        }}
      >
        {items.map((text) => (
          <li key={text}>
            <Typography variant="body2">{text}</Typography>
          </li>
        ))}
      </Box>
    </Box>
  </Paper>
);

export default HelperCard;
