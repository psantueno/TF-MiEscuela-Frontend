import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import backgroundImage from "../assets/img/fondo_login.png"; // 👈 poné tu imagen acá

export const Login = () => {
  return (
    <Box
      className="login-fullscreen"
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: 'no-repeat',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        overflow: 'auto',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight={600}
            align="center"
            color="primary"
          >
            Iniciar sesión
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
            align="center"
          >
            Ingresa con tu usuario y contraseña
          </Typography>

          {/* Inputs */}
          <TextField
            fullWidth
            label="Usuario"
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            variant="outlined"
            margin="normal"
          />

          {/* Botón */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Ingresar
          </Button>

          {/* Enlaces extra */}
          <Typography
            variant="body2"
            textAlign="center"
            mt={2}
            color="text.secondary"
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};