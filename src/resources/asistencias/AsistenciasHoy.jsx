// src/resources/asistencias/AsistenciasHoy.jsx
import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import {
  Datagrid,
  TextField,
} from "react-admin";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

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
      data.map(c => ({
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
      dataProvider.getAsistenciaCursoHoy(curso).then(({ data }) => {
        setRecords(data);
        setLoading(false);
      });
    }
  }, [curso, dataProvider]);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Asistencias de Hoy por Curso
      </Typography>

      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id="curso-select-label">Curso</InputLabel>
        <Select
          labelId="curso-select-label"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
        >
          {cursos.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <CircularProgress />}
      {!loading && curso && (
        <Datagrid data={records} bulkActionButtons={false}>
          <TextField source="id_asistencia" label="ID" />
          <TextField source="alumno.nombre_completo" label="Alumno" />
          <TextField source="curso.anio_escolar" label="Año" />
          <TextField source="curso.division" label="División" />
          <TextField source="id_estado" label="Estado" />
          <TextField source="fecha" label="Fecha" />
        </Datagrid>
      )}
    </Box>
  );
};
