import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Autocomplete,
  Divider,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import dayjs from 'dayjs';
import { useDataProvider, useNotify } from 'react-admin';
import { SummaryCard } from '../../components/SummaryCard';
import { LoaderOverlay } from '../../components/LoaderOverlay';
import { generarReportePDF } from './generarReportePDF';

const formatDate = (value) => dayjs(value).format('YYYY-MM-DD');

export const RendimientoCursos = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [ciclos, setCiclos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filters, setFilters] = useState({
    ciclo: null,
    curso: null,
    desde: formatDate(dayjs().subtract(60, 'day')),
    hasta: formatDate(dayjs()),
  });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    dataProvider
      .getList('ciclos-lectivos', {
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'anio', order: 'DESC' },
        filter: {},
      })
      .then(({ data }) => {
        if (!mounted) return;
        setCiclos(data);
        const abierto = data.find((c) => (c.estado || '').toLowerCase() === 'abierto');
        const fallback = data[0] || null;
        const seleccionado = abierto || fallback || null;
        if (seleccionado) {
          setFilters((prev) => ({ ...prev, ciclo: seleccionado }));
        }
      })
      .catch(() => mounted && setCiclos([]));
    return () => {
      mounted = false;
    };
  }, [dataProvider]);

  useEffect(() => {
    if (!filters.ciclo) {
      setCursos([]);
      setFilters((prev) => ({ ...prev, curso: null }));
      return;
    }
    let mounted = true;
    dataProvider
      .getCursosPorCiclo(filters.ciclo.id_ciclo || filters.ciclo.id)
      .then(({ data }) => mounted && setCursos(data))
      .catch(() => mounted && setCursos([]));
    setFilters((prev) => ({ ...prev, curso: null }));
    return () => {
      mounted = false;
    };
  }, [dataProvider, filters.ciclo]);

  const handleSearch = async () => {
    if (!filters.ciclo) {
      notify('Seleccioná un ciclo lectivo', { type: 'warning' });
      return;
    }
    if (!filters.curso) {
      notify('Seleccioná un curso', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await dataProvider.getRendimientoCurso({
        id_curso: filters.curso.id_curso ?? filters.curso.id,
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      const hasData = Boolean(
        data &&
        ((Array.isArray(data.materias) && data.materias.length) ||
          (Array.isArray(data.ranking_alumnos) && data.ranking_alumnos.length))
      );
      if (!hasData) {
        setInfo(null);
        setEmptyMessage('No hay datos históricos para el rango seleccionado.');
      } else {
        setInfo(data);
        setEmptyMessage('');
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.body?.error ||
        (error?.status === 404 ? 'No se encontraron datos para este curso.' : null);
      if (msg) {
        setEmptyMessage(msg);
        setInfo(null);
      } else {
        notify('Error obteniendo el rendimiento del curso', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInforme = async () => {
    if (!info) return;
    try {
      const { data } = await dataProvider.generarInformeRendimiento({
        scope: 'curso',
        ids: { id_curso: info.context?.id_curso },
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      await generarReportePDF({
        scope: 'curso',
        reporte: {
          ...data,
          fecha_desde: filters.desde,
          fecha_hasta: filters.hasta,
        },
      });
      notify('Informe IA exportado en PDF', { type: 'info' });
    } catch (error) {
      console.error(error);
      notify('No se pudo generar el informe IA', { type: 'error' });
    }
  };

  return (
    <Box>
      {loading && <LoaderOverlay />}
      <Typography variant="h4" sx={{ mb: 2, color: '#0A2E75', fontWeight: 600 }}>
        Rendimiento por curso
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Autocomplete
          sx={{ minWidth: 220 }}
          options={ciclos}
          value={filters.ciclo}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, ciclo: value, curso: null }))}
          getOptionLabel={(option) => (option ? `${option.anio}` : '')}
          renderInput={(params) => <TextField {...params} label="Ciclo lectivo" />}
        />
        <Autocomplete
          sx={{ minWidth: 280 }}
          options={cursos}
          value={filters.curso}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, curso: value }))}
          getOptionLabel={(option) =>
            option?.name ||
            `${option?.anio_escolar ?? ''}° ${option?.division ?? ''}`.trim()
          }
          renderInput={(params) => <TextField {...params} label="Curso" />}
          disabled={!filters.ciclo}
        />
        <TextField
          type="date"
          label="Desde"
          value={filters.desde}
          onChange={(e) => setFilters((prev) => ({ ...prev, desde: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Hasta"
          value={filters.hasta}
          onChange={(e) => setFilters((prev) => ({ ...prev, hasta: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 150 }}>
          Analizar
        </Button>
        {info && (
          <Button variant="outlined" onClick={handleInforme}>
            Generar informe IA
          </Button>
        )}
      </Stack>

      {info ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {info.context?.anio_escolar}° {info.context?.division} · Ciclo {info.context?.ciclo}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Promedio general"
                mainContent={info.kpis?.promedio_general ?? 'N/D'}
                type="info"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Asistencia 30 días"
                mainContent={`${info.kpis?.asistencia_30d ?? 0}%`}
                type="success"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Cantidad de desaprobaciones"
                mainContent={info.kpis?.desaprobados ?? 0}
                type="error"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Materias
                  </Typography>
                  {info.materias?.length ? (
                    info.materias.map((materia) => (
                      <Box
                        key={materia.id_materia_curso}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 0.5,
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        <Typography>{materia.materia}</Typography>
                        <Chip label={materia.promedio ?? 'N/D'} color="primary" size="small" />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin datos de materias en el período seleccionado.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ranking de alumnos
                  </Typography>
                  {info.ranking_alumnos?.length ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Alumno</TableCell>
                          <TableCell align="right">Promedio</TableCell>
                          <TableCell align="right">Asistencia</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {info.ranking_alumnos.map((alumno) => (
                          <TableRow key={alumno.id_alumno}>
                            <TableCell>
                              {alumno.apellido} {alumno.nombre}
                            </TableCell>
                            <TableCell align="right">{alumno.promedio ?? 'N/D'}</TableCell>
                            <TableCell align="right">
                              {alumno.asistencia !== null ? `${alumno.asistencia}%` : 'N/D'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Todavía no hay calificaciones registradas en el período.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas detectadas
              </Typography>
              {info.alertas?.length ? (
                info.alertas.map((alerta) => (
                  <Box
                    key={`${alerta.id_alumno}-${alerta.severity}`}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      border: '1px solid #eee',
                      borderRadius: 1,
                      backgroundColor: alerta.severity === 'high' ? '#fdecea' : '#fff7e6',
                    }}
                  >
                    <Typography variant="subtitle2">
                      {alerta.alumno} · {alerta.severity.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">{alerta.motivo}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se detectaron alertas en el período.
                </Typography>
              )}
              {info.ia_summary && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Resumen IA</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {info.ia_summary}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="body1">
              {emptyMessage || 'Seleccioná un curso y rango de fechas para iniciar el análisis.'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
