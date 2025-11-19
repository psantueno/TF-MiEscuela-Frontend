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
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import dayjs from 'dayjs';
import { LoaderOverlay } from '../../components/LoaderOverlay';

const severityColor = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

export const RendimientoAlertas = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [ciclos, setCiclos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filters, setFilters] = useState({
    ciclo: null,
    curso: null,
    severity: '',
    desde: dayjs().subtract(45, 'day').format('YYYY-MM-DD'),
    hasta: dayjs().format('YYYY-MM-DD'),
  });
  const [loading, setLoading] = useState(false);
  const [alertas, setAlertas] = useState([]);
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
    setLoading(true);
    try {
      const { data } = await dataProvider.getRendimientoAlertas({
        id_curso: filters.curso ? filters.curso.id_curso ?? filters.curso.id : undefined,
        id_ciclo: filters.ciclo.id_ciclo ?? filters.ciclo.id,
        severity: filters.severity || undefined,
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      const list = Array.isArray(data) ? data : [];
      setAlertas(list);
      setEmptyMessage(
        list.length ? '' : 'No se encontraron alertas para los filtros aplicados.'
      );
    } catch (error) {
      console.error(error);
      const msg =
        error?.body?.error ||
        (error?.status === 404 ? 'No hay alertas registradas para los parámetros ingresados.' : null);
      if (msg) {
        setAlertas([]);
        setEmptyMessage(msg);
      } else {
        notify('Error obteniendo alertas', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading && <LoaderOverlay />}
      <Typography variant="h4" sx={{ mb: 2, color: '#0A2E75', fontWeight: 600 }}>
        Alertas automáticas
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Autocomplete
          sx={{ minWidth: 200 }}
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
          renderInput={(params) => <TextField {...params} label="Curso (opcional)" />}
          disabled={!filters.ciclo}
        />
        <TextField
          select
          label="Severidad"
          SelectProps={{ native: true }}
          value={filters.severity}
          onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
        >
          <option value="">Todas</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
        </TextField>
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
          Buscar
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resultados
          </Typography>
          {alertas.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Alumno</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell align="right">Promedio</TableCell>
                  <TableCell align="right">Asistencia</TableCell>
                  <TableCell align="center">Riesgo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertas.map((alerta, idx) => (
                  <TableRow key={`${alerta.id_alumno}-${idx}`}>
                    <TableCell>{alerta.alumno}</TableCell>
                    <TableCell>{alerta.motivo}</TableCell>
                    <TableCell align="right">{alerta.promedio ?? 'N/D'}</TableCell>
                    <TableCell align="right">
                      {alerta.asistencia !== null && alerta.asistencia !== undefined
                        ? `${alerta.asistencia}%`
                        : 'N/D'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={alerta.severity?.toUpperCase()}
                        color={severityColor[alerta.severity] || 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {emptyMessage || 'No se encontraron alertas para los filtros aplicados.'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
