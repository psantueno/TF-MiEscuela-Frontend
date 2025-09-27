// src/pages/Profile.jsx
import React, { useState } from "react";
import HeaderPriv from "../components/HeaderPriv";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

export default function Profile({ user, onUpdateProfile, onLogout }) {
  if (!user) return <div>Cargando...</div>;

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photo, setPhoto] = useState(user.photo || "/avatar-default.png");

  const handleSave = () => {
    onUpdateProfile({ firstName, lastName, photo });
    alert("Perfil actualizado ✅");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Subcomponentes específicos según rol
  const renderRoleContent = () => {
    switch (user.role) {
      case "Alumno":
        return (
          <Card sx={{ bgcolor: "#e0f2ff", mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                📚 Información del Alumno
              </Typography>
              <Typography>Nivel: {user.nivel || "No especificado"}</Typography>
              <Typography>Curso: {user.curso || "No asignado"}</Typography>
            </CardContent>
          </Card>
        );
      case "Padre":
        return (
          <Card sx={{ bgcolor: "#d0f0c0", mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                👨‍👩‍👧‍👦 Información del Padre
              </Typography>
              <Typography>Hijo/a: {user.hijo || "Sin vincular"}</Typography>
              <Typography>Contacto: {user.contacto || "No registrado"}</Typography>
            </CardContent>
          </Card>
        );
      case "Docente":
        return (
          <Card sx={{ bgcolor: "#fff9c4", mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                👩‍🏫 Información del Docente
              </Typography>
              <Typography>Materia: {user.materia || "No asignada"}</Typography>
              <Typography>Horario: {user.horario || "No definido"}</Typography>
            </CardContent>
          </Card>
        );
      case "Directivo":
        return (
          <Card sx={{ bgcolor: "#e1bee7", mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                🏫 Información del Directivo
              </Typography>
              <Typography>Cargo: {user.cargo || "No asignado"}</Typography>
              <Typography>Área: {user.area || "No especificada"}</Typography>
            </CardContent>
          </Card>
        );
      default:
        return <Typography>No hay información disponible para este rol.</Typography>;
    }
  };

  return (
    <>
      {/* Header compartido */}
      <HeaderPriv user={user} onLogout={onLogout} />

      {/* Contenido del perfil */}
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
        <Card sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Perfil de {firstName} {lastName}
            </Typography>
            <Typography variant="subtitle1" mb={2}>
              Rol: {user.role}
            </Typography>

            {/* Avatar */}
            <Stack direction="column" alignItems="center" spacing={1} mb={3}>
              <Avatar
                src={photo}
                alt="Avatar"
                sx={{ width: 96, height: 96, border: "2px solid #020917" }}
              />
              <Button variant="contained" component="label" sx={{ bgcolor: "#020917", "&:hover": { bgcolor: "#111111" } }}>
                Cambiar foto
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </Button>
            </Stack>

            {/* Nombre y apellido */}
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                label="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
              />
            </Stack>

            {/* Sección dinámica por rol */}
            {renderRoleContent()}

            {/* Botones */}
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{ bgcolor: "#020917", "&:hover": { bgcolor: "#111111" }, flex: 1 }}
              >
                Guardar
              </Button>
              <Button
                onClick={onLogout}
                variant="contained"
                sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" }, flex: 1 }}
              >
                Cerrar sesión
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <footer />
    </>
  );
}
