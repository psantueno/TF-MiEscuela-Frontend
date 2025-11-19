import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Autocomplete,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import dayjs from 'dayjs';
import { SummaryCard } from '../../components/SummaryCard';
import { LoaderOverlay } from '../../components/LoaderOverlay';
import { generarReportePDF } from './generarReportePDF';

export const RendimientoMaterias = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [ciclos, setCiclos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [filters, setFilters] = useState({
    ciclo: null,
    curso: null,
    materia: null,
    desde: dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
    hasta: dayjs().format('YYYY-MM-DD'),
  });
  const [info, setInfo] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
        if (abierto || fallback) {
          setFilters((prev) => ({ ...prev, ciclo: abierto || fallback }));
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
      setFilters((prev) => ({ ...prev, curso: null, materia: null }));
      setMaterias([]);
      return;
    }
    let mounted = true;
    dataProvider
      .getCursosPorCiclo(filters.ciclo.id_ciclo || filters.ciclo.id)
      .then(({ data }) => mounted && setCursos(data))
      .catch(() => mounted && setCursos([]));
    setFilters((prev) => ({ ...prev, curso: null, materia: null }));
    setMaterias([]);
    return () => {
      mounted = false;
    };
  }, [dataProvider, filters.ciclo]);

  useEffect(() => {
    if (!filters.curso) {
      setMaterias([]);
      setFilters((prev) => ({ ...prev, materia: null }));
      return;
    }
    let mounted = true;
    dataProvider
      .getMateriasCurso(filters.curso.id_curso || filters.curso.id)
      .then(({ data }) => mounted && setMaterias(data))
      .catch(() => mounted && setMaterias([]));
    setFilters((prev) => ({ ...prev, materia: null }));
    return () => {
      mounted = false;
    };
  }, [dataProvider, filters.curso]);

  const handleSearch = async () => {
    if (!filters.ciclo) {
      notify('Seleccioná un ciclo lectivo', { type: 'warning' });
      return;
    }
    if (!filters.curso) {
      notify('Seleccioná un curso', { type: 'warning' });
      return;
    }
    if (!filters.materia) {
      notify('Seleccioná una materia', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await dataProvider.getRendimientoMateria({
        id_materia: filters.materia.id_materia ?? filters.materia.id,
        id_ciclo: filters.ciclo.id_ciclo ?? filters.ciclo.id,
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      if (!data || !(Array.isArray(data.cursos) && data.cursos.length)) {
        setInfo(null);
        setEmptyMessage('No hay datos históricos para esta materia en el período seleccionado.');
      } else {
        setInfo(data);
        setEmptyMessage('');
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.body?.error ||
        (error?.status === 404 ? 'La materia no posee información histórica registrada.' : null);
      if (msg) {
        setEmptyMessage(msg);
        setInfo(null);
      } else {
        notify('Error obteniendo datos de la materia', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInforme = async () => {
    if (!info?.context?.id_materia) return;
    try {
      const { data } = await dataProvider.generarInformeRendimiento({
        scope: 'materia',
        ids: { id_materia: info.context.id_materia },
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      await generarReportePDF({
        scope: 'materia',
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
        Rendimiento por materia
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Autocomplete
          sx={{ minWidth: 220 }}
          options={ciclos}
          value={filters.ciclo}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, ciclo: value }))}
          getOptionLabel={(option) => (option ? `${option.anio}` : '')}
          renderInput={(params) => <TextField {...params} label="Ciclo lectivo" />}
        />
        <Autocomplete
          sx={{ minWidth: 240 }}
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
        <Autocomplete
          sx={{ minWidth: 240 }}
          options={materias}
          value={filters.materia}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, materia: value }))}
          getOptionLabel={(option) => option?.nombre || ''}
          renderInput={(params) => <TextField {...params} label="Materia" />}
          disabled={!filters.curso}
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
        <Button variant="contained" onClick={handleSearch}>
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
            {info.context?.nombre}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <SummaryCard
              title="Promedio general"
              mainContent={info.kpis?.promedio_general ?? 'N/D'}
              type="info"
            />
            <SummaryCard
              title="Cursos analizados"
              mainContent={info.kpis?.cursos_con_datos ?? 0}
              type="success"
            />
          </Stack>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Promedios por curso
              </Typography>
              {info.cursos?.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell>Ciclo</TableCell>
                      <TableCell align="right">Promedio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {info.cursos.map((curso) => (
                      <TableRow key={`${curso.id_curso}-${curso.ciclo}`}>
                        <TableCell>{curso.curso}</TableCell>
                        <TableCell>{curso.ciclo}</TableCell>
                        <TableCell align="right">{curso.promedio ?? 'N/D'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay cursos con calificaciones registradas para la materia en las fechas seleccionadas.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas
              </Typography>
              {info.alertas?.length ? (
                info.alertas.map((alerta, idx) => (
                  <Box key={`${alerta.id_alumno}-${idx}`} sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2">{alerta.alumno}</Typography>
                    <Typography variant="body2">{alerta.motivo}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se detectaron alertas para esta materia.
                </Typography>
              )}
              {info.ia_summary && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {info.ia_summary}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography>
              {emptyMessage || 'Seleccioná una materia para comenzar.'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
