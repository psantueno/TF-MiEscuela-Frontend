import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import logoImg from "../img/logo.png";

export default function Home() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row', // fila horizontal
        alignItems: 'flex-start', // alinear al inicio verticalmente
        gap: 4,
        p: 4,
        maxWidth: '1200px',
        mx: 'auto'
      }}
    >
      {/* Texto a la izquierda */}
      <Box sx={{ flex: 1, minWidth: 350 }}>
        <Typography variant="h3" fontWeight="bold" mb={2}>
          La Plataforma que Une a tu Comunidad Educativa
        </Typography>

        <Typography mb={2}>
          Nuestra plataforma es la <strong>solución integral</strong> diseñada para revolucionar la <strong>comunicación</strong> y la <strong>gestión académica</strong> entre <strong>padres, alumnos, docentes y directivos</strong>.
        </Typography>

        <Typography mb={2}>
          Deje atrás las notas dispersas y las llamadas a destiempo. <strong>Centralice todo en un solo lugar:</strong>
        </Typography>

        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <strong>Rendimiento y Seguimiento:</strong> Consulte notas y el <strong>avance detallado</strong> de cada alumno en tiempo real.
          </li>
          <li>
            <strong>Asistencia y Tareas:</strong> Gestione la asistencia y distribuya <strong>tareas</strong> y <strong>material de estudio</strong> de manera eficiente.
          </li>
          <li>
            <strong>Comunicación Directa:</strong> Facilite la interacción con <strong>chats internos</strong> y envíe <strong>notificaciones de eventos</strong> importantes.
          </li>
        </Box>

        <Typography mb={2}>
          Transformamos la educación, facilitando una <strong>colaboración perfecta</strong> para que todos los actores estén informados y enfocados en el éxito del estudiante.
        </Typography>

  <Button
        variant="contained"
        sx={{
          backgroundColor: "#020917",   // color normal
          color: "#ffffff",             // texto blanco
          '&:hover': {
            backgroundColor: "#1252D3", // hover
          },
        }}
        onClick={handleLoginClick}       // redirige al login
      >
        Iniciar Sesión
      </Button>
      </Box>

      {/* Imagen a la derecha */}
      <Box sx={{ flex: 1, minWidth: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src={logoImg}
          alt="Ilustración de educación"
          sx={{ maxWidth: 400, width: '100%', borderRadius: 2,  }}
        />
      </Box>
    </Box>
  );
}
