import { useEffect, useMemo, useState } from 'react';
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import dayjs from 'dayjs';
import { useDataProvider, useNotify } from 'react-admin';
import { LoaderOverlay } from '../../components/LoaderOverlay';
import HelperCard from '../../components/HelperCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (value) => dayjs(value).format('YYYY-MM-DD');
const formatDateHuman = (value) => (value ? dayjs(value).format('DD/MM/YYYY') : 'N/D');

const EmptyTablePlaceholder = ({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center">
      <Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
        <SearchOffIcon color="disabled" />
        <Typography variant="body2" color="text.secondary">
          Sin datos registrados
        </Typography>
      </Stack>
    </TableCell>
  </TableRow>
);

export const RendimientoCursos = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const notifyOpts = { autoHideDuration: 7000 };
  const [ciclos, setCiclos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [filters, setFilters] = useState({
    ciclo: null,
    curso: null,
    materia: null,
    desde: formatDate(dayjs().subtract(60, 'day')),
    hasta: formatDate(dayjs()),
  });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');

  const approvalMetricConfig = useMemo(
    () => [
      {
        key: 'escrita',
        title: 'Evaluaciones escritas',
        description: 'Resultados de evaluaciones escritas.',
      },
      {
        key: 'oral',
        title: 'Evaluaciones orales',
        description: 'Instancias orales y presentaciones.',
      },
      {
        key: 'tp',
        title: 'Trabajos practicos',
        description: 'Entregas y actividades practicas.',
      },
    ],
    [],
  );

  const materiasPorPeriodo = (() => {
    if (!info) return {};
    const base =
      (Array.isArray(info.ranking_materias_top10) && info.ranking_materias_top10.length
        ? info.ranking_materias_top10
        : info.materias) || [];
    const sortByKey = (key) =>
      [...base]
        .filter((row) => row.promedios?.[key] != null)
        .sort(
          (a, b) => (b.promedios?.[key] ?? -Infinity) - (a.promedios?.[key] ?? -Infinity)
        )
        .slice(0, 10);
    return {
      primer_cuatrimestre: sortByKey('primer_cuatrimestre'),
      segundo_cuatrimestre: sortByKey('segundo_cuatrimestre'),
      nota_final: sortByKey('nota_final'),
    };
  })();

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
      setFilters((prev) => ({ ...prev, curso: null, materia: null }));
      return;
    }
    let mounted = true;
    dataProvider
      .getCursosPorCiclo(filters.ciclo.id_ciclo || filters.ciclo.id)
      .then(({ data }) => mounted && setCursos(data))
      .catch(() => mounted && setCursos([]));
    setFilters((prev) => ({ ...prev, curso: null, materia: null }));
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
      notify('Selecciona un ciclo lectivo para analizar.', { ...notifyOpts, type: 'warning' });
      return;
    }
    if (!filters.curso) {
      notify('Selecciona un curso para continuar.', { ...notifyOpts, type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await dataProvider.getRendimientoCurso({
        id_curso: filters.curso.id_curso ?? filters.curso.id,
        id_materia: filters.materia?.id_materia ?? filters.materia?.id ?? undefined,
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
        setEmptyMessage('No hay datos historicos para el rango seleccionado.');
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
        notify('No se pudo obtener el rendimiento del curso. Intenta nuevamente o ajusta el filtro.', {
          ...notifyOpts,
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!info) {
      notify('Genera el análisis primero para poder exportar el PDF.', { ...notifyOpts, type: 'warning' });
      return;
    }
    try {
      const doc = new jsPDF();
      const marginLeft = 14;
      const sectionGap = 8;
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.text('Reporte de rendimiento por curso', pageWidth / 2, 16, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - marginLeft, 10, {
        align: 'right',
      });

      let yCursor = 24;
      const cursoLabel = `${info.context?.anio_escolar ?? ''} ${info.context?.division ?? ''}`.trim();
      doc.setFontSize(11);
      doc.text(
        `Curso: ${cursoLabel || 'N/D'} - Ciclo lectivo ${info.context?.ciclo ?? 'N/D'}`,
        marginLeft,
        yCursor,
      );
      yCursor += 6;
      doc.text(
        `Rango consultado: ${formatDateHuman(filters.desde)} a ${formatDateHuman(filters.hasta)}`,
        marginLeft,
        yCursor,
      );
      if (filters.materia) {
        yCursor += 6;
        doc.text(
          `Materia: ${filters.materia?.nombre || filters.materia?.materia || 'Seleccionada'}`,
          marginLeft,
          yCursor,
        );
      }
      yCursor += sectionGap;

      doc.setFontSize(12);
      doc.text('Resumen general', marginLeft, yCursor);
      doc.setFontSize(10);
      autoTable(doc, {
        startY: yCursor + 2,
        head: [['Indicador', 'Valor']],
        body: [
          ['Promedio general', info.kpis?.promedio_general ?? 'N/D'],
          ['Promedio asistencia', info.kpis?.asistencia != null ? `${info.kpis.asistencia}%` : 'N/D'],
          ['Cantidad de desaprobaciones', info.kpis?.desaprobados ?? 0],
          ['Promedio 1er Cuatrimestre', info.kpis?.promedio_primer_cuatrimestre ?? 'N/D'],
          ['Promedio 2do Cuatrimestre', info.kpis?.promedio_segundo_cuatrimestre ?? 'N/D'],
          ['Promedio final', info.kpis?.promedio_final ?? 'N/D'],
        ],
        styles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 100 } },
      });
      yCursor = doc.lastAutoTable.finalY + sectionGap;

      doc.setFontSize(12);
      doc.text('Aprobaciones por tipo de evaluacion', marginLeft, yCursor);
      autoTable(doc, {
        startY: yCursor + 2,
        head: [['Tipo', 'Aprobadas', 'Total', 'Porcentaje']],
        body: approvalMetricConfig.map(({ key, title }) => {
          const stat =
            info.aprobaciones_por_tipo?.[key] || { total: 0, aprobadas: 0, porcentaje: null };
          return [
            title,
            stat.aprobadas ?? 0,
            stat.total ?? 0,
            stat.total > 0 && stat.porcentaje != null ? `${stat.porcentaje}%` : 'Sin datos',
          ];
        }),
        styles: { fontSize: 9 },
      });
      yCursor = doc.lastAutoTable.finalY + sectionGap;

      const rankingAlumnoSection = (key, title) => {
        autoTable(doc, {
          startY: yCursor,
          head: [[`${title} - Ranking de alumnos`, 'Promedio']],
          body: (info.ranking_alumnos_por_periodo?.[key] || []).map((alumno, idx) => [
            `${idx + 1}. ${alumno.apellido} ${alumno.nombre}`,
            alumno.promedio ?? 'N/D',
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [10, 46, 117] },
          columnStyles: { 0: { cellWidth: 120 } },
        });
        yCursor = doc.lastAutoTable.finalY + sectionGap;
      };

      rankingAlumnoSection('primer_cuatrimestre', '1er Cuatrimestre');
      rankingAlumnoSection('segundo_cuatrimestre', '2do Cuatrimestre');
      rankingAlumnoSection('nota_final', 'Calificacion final');

      const rankingMateriaSection = (key, title) => {
        autoTable(doc, {
          startY: yCursor,
          head: [[`${title} - Ranking de materias`, 'Promedio']],
          body: (materiasPorPeriodo[key] || []).map((row, idx) => [
            `${idx + 1}. ${row.materia}`,
            row.promedios?.[key] ?? 'N/D',
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [10, 46, 117] },
          columnStyles: { 0: { cellWidth: 120 } },
        });
        yCursor = doc.lastAutoTable.finalY + sectionGap;
      };

      rankingMateriaSection('primer_cuatrimestre', '1er Cuatrimestre');
      rankingMateriaSection('segundo_cuatrimestre', '2do Cuatrimestre');
      rankingMateriaSection('nota_final', 'Calificacion final');

      doc.save('reporte-rendimiento-curso.pdf');
    } catch (error) {
      console.error(error);
      notify('No se pudo generar el PDF del rendimiento. Reintenta en unos segundos.', {
        ...notifyOpts,
        type: 'error',
      });
    }
  };

  return (
    <Box>
      {loading && <LoaderOverlay />}
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'background 0.3s ease',
        }}
      >
        <QueryStatsIcon sx={{ color: '#1976d2', fontSize: 32 }} />
        <Typography variant="h5" fontWeight="600" color="primary">
          Rendimiento por curso
        </Typography>
      </Box>
      <HelperCard
        title="Guía rápida"
        items={[
          'Selecciona ciclo y curso; materia es opcional para focalizar el análisis.',
          'Ajusta el rango de fechas y presiona Buscar para ver promedios y rankings.',
          'Genera el PDF cuando tengas datos cargados para compartir el resumen.',
          'Si no aparecen resultados, revisa filtros o extiende el período consultado.',
        ]}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Autocomplete
          sx={{ minWidth: { xs: '100%', sm: 140 } }}
          options={ciclos}
          value={filters.ciclo}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, ciclo: value, curso: null }))}
          getOptionLabel={(option) => (option ? `${option.anio}` : '')}
          renderInput={(params) => <TextField {...params} label="Ciclo lectivo" />}
        />
        <Autocomplete
          sx={{ minWidth: { xs: '100%', sm: 170 } }}
          options={cursos}
          value={filters.curso}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, curso: value }))}
          getOptionLabel={(option) =>
            option?.name || `${option?.anio_escolar ?? ''} - ${option?.division ?? ''}`.trim()
          }
          renderInput={(params) => <TextField {...params} label="Curso" />}
          disabled={!filters.ciclo}
        />
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={materias}
          value={filters.materia}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, materia: value }))}
          getOptionLabel={(option) => option?.nombre || option?.materia || ''}
          renderInput={(params) => <TextField {...params} label="Materia (opcional)" />}
          disabled={!filters.curso || !materias.length}
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
      </Stack>
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: '#f7f9ff',
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 640,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PictureAsPdfIcon sx={{ color: '#0A2E75' }} />
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#0A2E75' }}>
              Reporte descargable
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Genera un reporte en PDF con los datos que se muestran en pantalla para compartirlo o archivarlo.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPdf}
                disabled={!info || loading}
                sx={{ minWidth: 200 }}
              >
                Descargar reporte PDF
              </Button>
            </Box>
            {!info && (
              <Typography variant="caption" color="text.secondary">
                Ejecuta el análisis para habilitar la descarga del PDF.
              </Typography>
            )}
            {info && (
              <Typography variant="caption" color="text.secondary">
                Al generar el archivo se descargará automáticamente un PDF con este resumen.
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {info ? (
        <Box>
          <Card
            sx={{
              mb: 3,
              p: 1,
              borderRadius: 2,
              bgcolor: '#f7f9ff',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ pb: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">
                  Curso analizado: {info.context?.anio_escolar}° {info.context?.division} - Ciclo Lectivo {info.context?.ciclo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vista general del curso para entender variaciones de promedio, asistencia y aprobaciones en el rango seleccionado.
                  {filters.materia
                    ? ' Se esta filtrando por la materia indicada para focalizar los resultados.'
                    : ''}
                </Typography>
                {filters.materia && (
                  <Chip
                    size="small"
                    color="primary"
                    label={`Filtrado por: ${filters.materia?.nombre || filters.materia?.materia || 'Materia'}`}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ pb: 3 }}>
              <Typography variant="h6">Resumen general</Typography>
              <Typography variant="body2" color="text.secondary">
                Indicadores claves de desempeno del curso en el periodo consultado.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {[
                  {
                    key: 'promedio_general',
                    title: 'Promedio general',
                    value: info.kpis?.promedio_general ?? 'N/D',
                    description: 'Promedio de calificaciones acumulado.',
                  },
                  {
                    key: 'asistencia',
                    title: 'Promedio asistencia',
                    value: info.kpis?.asistencia != null ? `${info.kpis.asistencia}%` : 'N/D',
                    description: 'Porcentaje de asistencia de la cohorte.',
                  },
                  {
                    key: 'desaprobados',
                    title: 'Cantidad de desaprobaciones',
                    value: info.kpis?.desaprobados ?? 0,
                    description: 'Total de casos con nota menor a 6 registrados.',
                  },
                ].map(({ key, title, value, description }) => (
                  <Grid item xs={12} md={4} key={key}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {description}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ pb: 3 }}>
              <Typography variant="h6">Promedios por periodo</Typography>
              <Typography variant="body2" color="text.secondary">
                Evolucion de los promedios en los cierres cuatrimestrales y promedio final.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {[
                  { key: 'promedio_primer_cuatrimestre', label: 'Promedio 1er Cuatrimestre' },
                  { key: 'promedio_segundo_cuatrimestre', label: 'Promedio 2do Cuatrimestre' },
                  { key: 'promedio_final', label: 'Promedio final' },
                ].map(({ key, label }) => (
                  <Grid item xs={12} md={4} key={key}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Promedios agregados por periodo de evaluacion.
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                        {info.kpis?.[key] ?? 'N/D'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Indicadores de aprobacion por tipo de evaluacion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Porcentaje de aprobacion por tipo de instancia para detectar fortalezas y alertas.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {approvalMetricConfig.map(({ key, title, description }) => {
                  const stat =
                    info.aprobaciones_por_tipo?.[key] || { total: 0, aprobadas: 0, porcentaje: null };
                  const hasData = stat.total > 0;
                  return (
                    <Grid item xs={12} md={4} key={key}>
                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 2,
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          bgcolor: hasData ? 'grey.50' : 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {hasData ? `${stat.porcentaje}%` : 'Sin datos'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hasData ? `${stat.aprobadas} de ${stat.total}` : 'Sin registros en el periodo'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
              (*) Aprobado: calificacion igual o mayor a 6 (seis).
            </Typography>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ranking de alumnos con mejor promedio por periodo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Referencia rapida de los alumnos destacados por tramo academico. Puede servir para
                comunicar reconocimientos o identificar referentes de apoyo en el aula.
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'primer_cuatrimestre', title: '1er Cuatrimestre' },
                  { key: 'segundo_cuatrimestre', title: '2do Cuatrimestre' },
                  { key: 'nota_final', title: 'Calificacion final' },
                ].map(({ key, title }) => {
                  const list = info.ranking_alumnos_por_periodo?.[key] || [];
                  return (
                    <Grid item xs={12} md={4} key={key}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {title}
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Puesto</TableCell>
                            <TableCell>Alumno</TableCell>
                            <TableCell align="right">Promedio</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {list.length ? (
                            list.map((alumno, idx) => (
                              <TableRow key={`${key}-${alumno.id_alumno}`}>
                                <TableCell align="center">{idx + 1}</TableCell>
                                <TableCell>
                                  {alumno.apellido} {alumno.nombre}
                                </TableCell>
                                <TableCell align="right">{alumno.promedio ?? 'N/D'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <EmptyTablePlaceholder colSpan={3} />
                          )}
                        </TableBody>
                      </Table>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ranking de promedios por materia y periodo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ordena las materias con mejores resultados para ver areas consolidadas y aquellas que requieren apoyo segun el cierre seleccionado.
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'primer_cuatrimestre', title: '1er Cuatrimestre' },
                  { key: 'segundo_cuatrimestre', title: '2do Cuatrimestre' },
                  { key: 'nota_final', title: 'Calificacion final' },
                ].map(({ key, title }) => {
                  const list = materiasPorPeriodo[key] || [];
                  return (
                    <Grid item xs={12} md={4} key={key}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {title}
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Puesto</TableCell>
                            <TableCell>Materia</TableCell>
                            <TableCell align="right">Promedio</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {list.length ? (
                            list.map((row, idx) => (
                              <TableRow
                                key={`${key}-${row.id_materia_curso || row.id_materia || idx}`}
                              >
                                <TableCell align="center">{idx + 1}</TableCell>
                                <TableCell>{row.materia}</TableCell>
                                <TableCell align="right">
                                  {row.promedios?.[key] ?? 'N/D'}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <EmptyTablePlaceholder colSpan={3} />
                          )}
                        </TableBody>
                      </Table>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="body1">
              {emptyMessage || 'Seleccione un curso y el rango de fechas para iniciar el analisis.'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

