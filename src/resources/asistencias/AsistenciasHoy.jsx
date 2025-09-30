// src/resources/asistencias/AsistenciasHoy.jsx
import { useEffect, useState } from "react";
import { useDataProvider, TextField, Datagrid } from "react-admin";
import {
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Chip,
} from "@mui/material";

// 🔹 Campo personalizado para mostrar el estado con colores
const EstadoField = ({ record }) => {
  if (!record) return null;
  const estado = record.id_estado;
  const map = {
    1: { label: "Presente", color: "success" },
    2: { label: "Ausente", color: "error" },
    3: { label: "Tarde", color: "warning" },
  };
  return (
    <Chip
      label={map[estado]?.label || "Desconocido"}
      color={map[estado]?.color || "default"}
      size="small"
    />
  );
};

export const AsistenciasHoy = () => {
  const dataProvider = useDataProvider();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [curso, setCurso] = useState("");
  const [cursos, setCursos] = useState([]);

  // cargar cursos al montar
  useEffect(() => {
    dataProvider.getList("cursos", {}).then(({ data }) => {
      setCursos(
        data.map((c) => ({
          id: c.id_curso,
          name: `${c.anio_escolar}° ${c.division}`,
        }))
      );
    });
  }, [dataProvider]);

  // cargar asistencias cuando cambia curso
  useEffect(() => {
    if (curso) {
      setLoading(true);
      dataProvider
        .getAsistenciaCursoHoy(curso)
        .then(({ data }) => {
          setRecords(data);
          setLoading(false);
        })
        .catch(() => {
          setRecords([]);
          setLoading(false);
        });
    }
  }, [curso, dataProvider]);

  // métricas rápidas
  const total = records.length;
  const presentes = records.filter((r) => r.id_estado === 1).length;
  const ausentes = records.filter((r) => r.id_estado === 2).length;
  const tarde = records.filter((r) => r.id_estado === 3).length;

  // helper para tarjetas
  const metricValue = (value) => (curso ? (value > 0 ? value : "-") : "-");

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Asistencias de Hoy por Curso
      </Typography>

      {/* Selector de curso */}
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="curso-select-label">Curso</InputLabel>
        <Select
          labelId="curso-select-label"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
        >
          {cursos.length > 0 ? (
            cursos.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No hay cursos disponibles</MenuItem>
          )}
        </Select>
      </FormControl>

      {/* Loader */}
      {loading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
          <Typography variant="body2" mt={2}>
            Cargando asistencias...
          </Typography>
        </Box>
      )}

      {/* Resumen con tarjetas */}
      {!loading && curso && (
        <Box mb={3} display="flex" gap={2} flexWrap="wrap">
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1">Total alumnos</Typography>
            <Typography variant="h5">{metricValue(total)}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1">Presentes</Typography>
            <Typography variant="h5" color="success.main">
              {metricValue(presentes)}
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1">Ausentes</Typography>
            <Typography variant="h5" color="error.main">
              {metricValue(ausentes)}
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1">Tarde</Typography>
            <Typography variant="h5" color="warning.main">
              {metricValue(tarde)}
            </Typography>
          </Card>
        </Box>
      )}

      {/* Tabla de asistencias */}
      {!loading && curso && (
        <Datagrid
          data={records}
          resource="asistencias"
          bulkActionButtons={false}
          rowClick={false}
          empty={
            <Box p={2} textAlign="center">
              <Typography variant="body1">
                No hay asistencias cargadas para este curso hoy
              </Typography>
            </Box>
          }
        >
          <TextField source="id_asistencia" label="ID" />
          <TextField source="alumno.nombre_completo" label="Alumno" />
          <TextField source="curso.anio_escolar" label="Año" />
          <TextField source="curso.division" label="División" />
          <EstadoField label="Estado" />
          <TextField source="fecha" label="Fecha" />
        </Datagrid>
      )}
    </Box>
  );
};
