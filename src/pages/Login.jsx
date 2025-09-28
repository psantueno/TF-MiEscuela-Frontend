import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Backdrop,
  CircularProgress
} from "@mui/material";
import backgroundImage from "../assets/img/fondo_login.png"; // 👈 poné tu imagen acá
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    setLoading(true);

    const { email, contrasenia } = data;
    try{
      await login(email, contrasenia);
      navigate("/");
    }catch(error){
      console.error("Error al iniciar sesión:", error);
    }finally{
      setLoading(false);
    }
  };

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
            label="Correo electrónico"
            variant="outlined"
            margin="normal"
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Formato de correo inválido"
              }
            })}
          />
          <Typography
            variant="body2"
            align="left"
            color="error"
          >
            {errors.email?.message}
          </Typography>

          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            variant="outlined"
            margin="normal"
            {...register("contrasenia", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres"
              }
            })}
          />
          <Typography
            variant="body2"
            align="left"
            color="error"
          >
            {errors.contrasenia?.message}
          </Typography>

          {/* Botón */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            onClick={handleSubmit(handleLogin)}
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

      {/* Loader con overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};