import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import dayjs from 'dayjs';
import { useDataProvider, useNotify } from 'react-admin';
import useUser from '../../contexts/UserContext/useUser';
import { LoaderOverlay } from '../../components/LoaderOverlay';
import HelperCard from '../../components/HelperCard';

const normalizeText = (value = '') =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const closingMetricConfig = [
  {
    key: 'cierre_1',
    title: 'Cierre 1° Cuatr.',
    matchers: ['cierre 1', 'primer cierre', '1 cuatr', '1er cuatr'].map((value) => normalizeText(value)),
    description: 'Evaluaciones de cierre del primer cuatrimestre.',
  },
  {
    key: 'cierre_2',
    title: 'Cierre 2° Cuatr.',
    matchers: ['cierre 2', 'segundo cierre', '2 cuatr', '2do cuatr'].map((value) => normalizeText(value)),
    description: 'Evaluaciones de cierre del segundo cuatrimestre.',
  },
  {
    key: 'nota_final',
    title: 'Nota final',
    matchers: ['nota final', 'final'].map((value) => normalizeText(value)),
    description: 'Calificación final del ciclo lectivo.',
  },
];

const buildEmptyClosingAverages = () =>
  closingMetricConfig.reduce((acc, config) => {
    acc[config.key] = null;
    return acc;
  }, {});

export const RendimientoAlumnos = ({ modoTutor = false }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { user } = useUser();

  const isTutor = modoTutor || (user?.rol || '').toLowerCase() === 'tutor';

  const [ciclos, setCiclos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [filters, setFilters] = useState({
    ciclo: null,
    curso: null,
    alumno: null,
    desde: dayjs().subtract(60, 'day').format('YYYY-MM-DD'),
    hasta: dayjs().format('YYYY-MM-DD'),
  });
  const [info, setInfo] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isTutor) {
      dataProvider
        .getRendimientoHijos()
        .then(({ data }) => {
          if (!mounted) return;
          setAlumnos(data);
          if (data.length) {
            setFilters((prev) => ({ ...prev, alumno: data[0] }));
          }
        })
        .catch(() => mounted && setAlumnos([]));
      return () => {
        mounted = false;
      };
    }

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
  }, [dataProvider, isTutor]);

  useEffect(() => {
    if (isTutor) return;
    if (!filters.ciclo) {
      setCursos([]);
      setFilters((prev) => ({ ...prev, curso: null, alumno: null }));
      setAlumnos([]);
      return;
    }
    let mounted = true;
    dataProvider
      .getCursosPorCiclo(filters.ciclo.id_ciclo || filters.ciclo.id)
      .then(({ data }) => mounted && setCursos(data))
      .catch(() => mounted && setCursos([]));
    setFilters((prev) => ({ ...prev, curso: null, alumno: null }));
    setAlumnos([]);
    return () => {
      mounted = false;
    };
  }, [dataProvider, filters.ciclo, isTutor]);

  useEffect(() => {
    if (isTutor) return;
    if (!filters.curso) {
      setAlumnos([]);
      setFilters((prev) => ({ ...prev, alumno: null }));
      return;
    }
    let mounted = true;
    dataProvider
      .getAlumnosPorCurso(filters.curso.id_curso ?? filters.curso.id)
      .then(({ data }) => mounted && setAlumnos(data))
      .catch(() => mounted && setAlumnos([]));
    setFilters((prev) => ({ ...prev, alumno: null }));
    return () => {
      mounted = false;
    };
  }, [dataProvider, filters.curso, isTutor]);

  const alumnoOptions = useMemo(() => alumnos || [], [alumnos]);

  const resumenKpis = useMemo(() => {
    const emptyClosingAverages = buildEmptyClosingAverages();
    if (!info)
      return {
        promediosCierre: emptyClosingAverages,
        asistencia: null,
        desaprobadas: null,
        totalCalificaciones: 0,
        desaprobadasCount: 0,
      };
    const timelineCalifs = info.timeline?.calificaciones || [];
    const desaprobadasCalculadas = timelineCalifs.filter((item) => Number(item.nota) < 6).length;
    const totalCalificaciones = timelineCalifs.length;
    const promediosCierre = closingMetricConfig.reduce((acc, config) => {
      const relacionadas = timelineCalifs.filter((item) => {
        const tipoRaw =
          item.tipo || item.tipo_calificacion || item.tipoCalificacion?.descripcion || '';
        const tipo = normalizeText(tipoRaw);
        return config.matchers.some((matcher) => tipo.includes(matcher));
      });
      const notasRelacionadas = relacionadas
        .map((item) => Number(item.nota))
        .filter((nota) => Number.isFinite(nota));
      acc[config.key] = notasRelacionadas.length
        ? Number(
          (notasRelacionadas.reduce((sum, current) => sum + current, 0) / notasRelacionadas.length).toFixed(2),
        )
        : null;
      return acc;
    }, buildEmptyClosingAverages());

    const timelineAsist = info.timeline?.asistencias || [];
    const asistenciaCalculada = (() => {
      if (!timelineAsist.length) return null;
      let presentes = 0;
      timelineAsist.forEach((asis) => {
        const estado = normalizeText(asis.estado);
        if (estado.includes('pres')) presentes += 1;
      });
      return Number(((presentes * 100) / timelineAsist.length).toFixed(2));
    })();

    return {
      promediosCierre,
      asistencia: info.kpis?.asistencia_30d ?? asistenciaCalculada,
      desaprobadas:
        totalCalificaciones > 0
          ? Number(((desaprobadasCalculadas * 100) / totalCalificaciones).toFixed(2))
          : null,
      totalCalificaciones,
      desaprobadasCount: desaprobadasCalculadas,
    };
  }, [info]);

  const closingGrades = info?.closing_grades || {};
  const courseStats = info?.course_stats || {};

  const resolveMateriaFromInforme = (informe) => {
    if (!informe) return null;
    const materia =
      informe?.materia?.nombre ||
      informe?.materia?.descripcion ||
      informe?.materia_curso?.materia?.nombre ||
      informe?.materia_curso?.materia?.descripcion ||
      informe?.materiaCurso?.materia?.nombre ||
      informe?.materiaCurso?.materia?.descripcion ||
      informe?.materia_detalle?.nombre ||
      informe?.materia_detalle?.descripcion ||
      informe?.materia_nombre ||
      informe?.nombre_materia ||
      informe?.materia ||
      informe?.materiaName ||
      null;
    if (materia) return materia;
    return (
      informe?.materia_curso?.label ||
      informe?.materia_curso?.nombre ||
      informe?.materiaCurso?.label ||
      informe?.materiaCurso?.nombre ||
      informe?.materia_detalle?.label ||
      informe?.materia_detalle?.nombre ||
      null
    );
  };

  const resolveAsesorFromInforme = (informe) => {
    if (!informe) return null;
    const resolvePersonaNombre = (persona) => {
      if (!persona) return null;
      if (typeof persona === 'string') return persona;
      if (persona.nombre_completo) return persona.nombre_completo;
      if (persona.apellido || persona.nombre) {
        return [persona.apellido, persona.nombre].filter(Boolean).join(' ').trim() || null;
      }
      if (persona.usuario) {
        const { apellido, nombre, nombre_completo } = persona.usuario;
        if (nombre_completo) return nombre_completo;
        if (apellido || nombre) {
          return [apellido, nombre].filter(Boolean).join(' ').trim() || null;
        }
      }
      return persona.nombre || null;
    };

    return (
      resolvePersonaNombre(informe?.asesor) ||
      resolvePersonaNombre(informe?.asesorPedagogico) ||
      resolvePersonaNombre(informe?.asesor_pedagogico) ||
      resolvePersonaNombre(informe?.asesor_detalle) ||
      informe?.asesor?.nombre ||
      informe?.asesor_nombre ||
      informe?.nombre_asesor ||
      informe?.asesorPedagogicoNombre ||
      informe?.asesor ||
      null
    );
  };

  const pedagogicReports = info?.informes_pedagogicos || [];
  const hasPedagogicReports = pedagogicReports.length > 0;

  const materiasIntervenidas = useMemo(() => {
    if (!pedagogicReports.length) return [];
    const materias = pedagogicReports
      .map((informe) => resolveMateriaFromInforme(informe))
      .filter((nombre) => Boolean(nombre));
    return Array.from(new Set(materias));
  }, [pedagogicReports]);

  const evaluacionesPorTipo = useMemo(() => {
    const baseStats = {
      examenes: { total: 0, aprobadas: 0 },
      trabajos: { total: 0, aprobadas: 0 },
      conducta: { total: 0, aprobadas: 0 },
      participacion: { total: 0, aprobadas: 0 },
    };

    const registros = info?.timeline?.calificaciones || [];
    if (!registros.length) {
      return {
        examenes: { ...baseStats.examenes, porcentaje: null },
        trabajos: { ...baseStats.trabajos, porcentaje: null },
        conducta: { ...baseStats.conducta, porcentaje: null },
        participacion: { ...baseStats.participacion, porcentaje: null },
      };
    }

    registros.forEach((calificacion) => {
      const notaValue = Number(calificacion.nota);
      const aprobada = Number.isFinite(notaValue) && notaValue >= 6;
      const tipoRaw =
        calificacion.tipo ||
        calificacion.tipo_calificacion ||
        calificacion.tipoCalificacion?.descripcion ||
        '';
      const tipo = normalizeText(tipoRaw);

      const acumular = (key) => {
        baseStats[key].total += 1;
        if (aprobada) baseStats[key].aprobadas += 1;
      };

      if (tipo.includes('examen') || tipo.includes('escrito')) {
        acumular('examenes');
      }
      if (tipo.includes('trabajo') || tipo.includes('tp')) {
        acumular('trabajos');
      }
      if (tipo.includes('conducta')) {
        acumular('conducta');
      }
      if (tipo.includes('particip')) {
        acumular('participacion');
      }
    });

    const withPercentage = (stat) => ({
      ...stat,
      porcentaje: stat.total > 0 ? Number(((stat.aprobadas * 100) / stat.total).toFixed(2)) : null,
    });

    return {
      examenes: withPercentage(baseStats.examenes),
      trabajos: withPercentage(baseStats.trabajos),
      conducta: withPercentage(baseStats.conducta),
      participacion: withPercentage(baseStats.participacion),
    };
  }, [info]);

  const approvalMetricConfig = useMemo(
    () => [
      { key: 'examenes', title: 'Examenes escritos', description: 'Resultados de evaluaciones escritas' },
      { key: 'trabajos', title: 'Trabajos practicos', description: 'Entregas y actividades practicas' },
      { key: 'conducta', title: 'Conducta', description: 'Valoraciones de comportamiento en el aula' },
      { key: 'participacion', title: 'Participacion', description: 'Participacion en clase y actividades' },
    ],
    [],
  );

  const closingApprovalStats = useMemo(() => {
    const registros = info?.timeline?.calificaciones || [];
    return closingMetricConfig.map((config) => {
      const notasRelacionadas = registros.reduce((acc, calificacion) => {
        const tipoRaw =
          calificacion.tipo ||
          calificacion.tipo_calificacion ||
          calificacion.tipoCalificacion?.descripcion ||
          '';
        const tipo = normalizeText(tipoRaw);
        if (config.matchers.some((matcher) => tipo.includes(matcher))) {
          const notaValue = Number(calificacion.nota);
          if (Number.isFinite(notaValue)) {
            acc.push(notaValue);
          }
        }
        return acc;
      }, []);

      const total = notasRelacionadas.length;
      const aprobadas = notasRelacionadas.filter((nota) => nota >= 6).length;
      const rawClosingValue = Number(closingGrades?.[config.key]);
      const fallbackNota =
        Number.isFinite(rawClosingValue) && rawClosingValue > 0 ? rawClosingValue : null;

      return {
        ...config,
        total,
        aprobadas,
        porcentaje: total > 0 ? Number(((aprobadas * 100) / total).toFixed(2)) : null,
        ultimaNota: total > 0 ? notasRelacionadas[notasRelacionadas.length - 1] : fallbackNota,
      };
    });
  }, [info, closingGrades]);

  const handleSearch = async () => {
    if (!filters.alumno) {
      notify('SeleccionÃ¡ un alumno', { type: 'warning' });
      return;
    }
    if (!isTutor) {
      if (!filters.ciclo) {
        notify('SeleccionÃ¡ un ciclo lectivo', { type: 'warning' });
        return;
      }
      if (!filters.curso) {
        notify('SeleccionÃ¡ un curso', { type: 'warning' });
        return;
      }
    }
    setLoading(true);
    try {
      const { data } = await dataProvider.getRendimientoAlumno({
        id_alumno: filters.alumno.id_alumno ?? filters.alumno.id,
        fecha_desde: filters.desde,
        fecha_hasta: filters.hasta,
      });
      const hasHistory =
        data &&
        ((data.timeline?.calificaciones?.length || 0) +
          (data.timeline?.asistencias?.length || 0) +
          (data.materias?.length || 0) >
          0);
      if (!hasHistory) {
        setInfo(null);
        setEmptyMessage('No hay registros históricos para este alumno en las fechas seleccionadas.');
      } else {
        setInfo(data);
        setEmptyMessage('');
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.body?.error ||
        (error?.status === 404 ? 'No se encontró información para el alumno seleccionado.' : null);
      if (msg) {
        setEmptyMessage(msg);
        setInfo(null);
      } else {
        notify('Error obteniendo el rendimiento del alumno', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInformeIA = async () => {
    if (!info?.context?.id_alumno) {
      notify('Analizá primero el rendimiento del alumno.', { type: 'warning' });
      return;
    }
    if (isTutor) {
      notify('La generación automática con IA está disponible solo para el equipo institucional.', {
        type: 'warning',
      });
      return;
    }
    const cicloId = filters.ciclo?.id_ciclo ?? filters.ciclo?.id;
    const cursoId = filters.curso?.id_curso ?? filters.curso?.id;
    if (!cicloId) {
      notify('Seleccionǭ un ciclo lectivo.', { type: 'warning' });
      return;
    }
    if (!cursoId) {
      notify('Seleccionǭ un curso.', { type: 'warning' });
      return;
    }

    setIaLoading(true);
    try {
      const result = await dataProvider.generarInformeRendimientoIA(
        {
          id_ciclo: cicloId,
          id_curso: cursoId,
          id_alumno: info.context.id_alumno,
        },
        { format: 'pdf' },
      );
      const blob = result?.data || result;
      const filename =
        result?.filename ||
        `informe-ia-${(info.context?.nombre || 'alumno').replace(/\s+/g, '_')}-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
      if (blob instanceof Blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notify('Informe pedagógico descargado.', { type: 'info' });
      } else {
        notify('No se pudo descargar el archivo generado.', { type: 'warning' });
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.body?.error ||
        (error?.status === 403
          ? 'No tenés permisos para generar informes IA en este contexto.'
          : 'No se pudo generar el informe IA');
      notify(msg, { type: 'error' });
    } finally {
      setIaLoading(false);
    }
  };

  const canGenerateIA =
    !isTutor && Boolean(info?.context?.id_alumno && filters.ciclo && filters.curso);

  return (
    <Box>
      <LoaderOverlay
        open={loading || iaLoading}
        message={
          iaLoading
            ? 'Generando el informe con IA. Por favor aguardá y no recargues la página. La descarga iniciará automaticamente al finalizar.'
            : undefined
        }
      />
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
        <InsightsIcon sx={{ color: '#1976d2', fontSize: 32 }} />
        <Typography variant="h5" fontWeight="600" color="primary">
          {isTutor ? 'Rendimiento académico de mis hijos' : 'Rendimiento académico del alumno'}
        </Typography>
      </Box>
      <HelperCard
        title="Guía rápida"
        items={[
          'Selecciona ciclo y curso (si aplica) y luego el alumno; ajusta el rango de fechas si necesitas acotar.',
          'Presiona Buscar para ver calificaciones, asistencia y métricas resumidas del alumno.',
          'Usa Generar reporte IA cuando esté disponible para descargar un informe automático.',
          'Si no aparecen datos, ajusta los filtros o verifica que existan registros en el período seleccionado.',
        ]}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 1 }}>
        {!isTutor && (
          <>
            <Autocomplete
              sx={{ minWidth: 200 }}
              options={ciclos}
              value={filters.ciclo}
              onChange={(_, value) => setFilters((prev) => ({ ...prev, ciclo: value }))}
              getOptionLabel={(option) => (option ? `${option.anio}` : '')}
              renderInput={(params) => <TextField {...params} label="Ciclo lectivo" />}
            />
            <Autocomplete
              sx={{ minWidth: 220 }}
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
          </>
        )}
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={alumnoOptions}
          value={filters.alumno}
          onChange={(_, value) => setFilters((prev) => ({ ...prev, alumno: value }))}
          getOptionLabel={(option) =>
            option?.usuario
              ? `${option.usuario.apellido || ''} ${option.usuario.nombre || ''}`.trim()
              : option?.nombre || ''
          }
          renderInput={(params) => <TextField {...params} label={isTutor ? 'Hijo/a' : 'Alumno'} />}
          disabled={!isTutor && !filters.curso}
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
      </Stack>
      {info && !isTutor && (
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
              <AutoAwesomeIcon sx={{ color: '#0A2E75' }} />
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#0A2E75' }}>
                Informe pedagógico con IA
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Podés generar un informe con carácter pedagógico creado con inteligencia artificial
              analizando el desempeño del alumno, comprendiendo desde el inicio del ciclo hasta la fecha actual.
            </Typography >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Button
                  variant="contained"
                  onClick={handleInformeIA}
                  startIcon={
                    iaLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />
                  }
                  disabled={!canGenerateIA || iaLoading}
                >
                  {iaLoading ? 'Generando...' : 'Generar informe IA'}
                </Button>
              </Box>
              {!canGenerateIA && !isTutor && (
                <Typography variant="caption" color="text.secondary">
                  Seleccionǭ un ciclo, curso y alumno y ejecutá el análisis para habilitar el informe IA.
                </Typography>
              )}
              {canGenerateIA && (
                <Typography variant="caption" color="text.secondary">
                  Al finalizar la generación se descargará automáticamente un PDF con el informe.
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {info ? (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ pb: 3 }}>
              <Typography variant="h6">Resumen general</Typography>
              <Typography variant="body2" color="text.secondary">
                Indicadores claves de desempeño académico en el periodo seleccionado.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {[
                  {
                    key: 'promedio_cierre_1',
                    title: 'Promedio 1° Cuatrimestre',
                    value: resumenKpis.promediosCierre?.cierre_1 ?? 'N/D',
                    description: 'Promedio de notas del primer cuatrimestre.',
                  },
                  {
                    key: 'promedio_cierre_2',
                    title: 'Promedio 2° Cuatrimestre',
                    value: resumenKpis.promediosCierre?.cierre_2 ?? 'N/D',
                    description: 'Promedio de notas del segundo cuatrimestre.',
                  },
                  {
                    key: 'promedio_final',
                    title: 'Promedio calificación final',
                    value: resumenKpis.promediosCierre?.nota_final ?? 'N/D',
                    description: 'Promedio de notas finales registradas.',
                  },
                  {
                    key: 'asistencia',
                    title: 'Promedio Asistencia',
                    value:
                      resumenKpis.asistencia !== null && resumenKpis.asistencia !== undefined
                        ? `${resumenKpis.asistencia}%`
                        : 'N/D',
                    description: 'Porcentaje de asistencia en el rango.',
                  },
                ].map(({ key, title, value, description }) => (
                  <Grid item xs={12} md={6} key={key}>
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
              <Typography variant="h6">Indicadores de aprobación por tipo de evaluación</Typography>
              <Typography variant="body2" color="text.secondary">
                Porcentaje de aprobación por tipo de evaluación en el periodo seleccionado.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid
                container
                spacing={2}
                sx={{
                  '--template-columns': 'repeat(4, minmax(0, 1fr))',
                }}
              >
                {approvalMetricConfig.map(({ key, title, description }) => {
                  const stat = evaluacionesPorTipo[key] || { total: 0, aprobadas: 0, porcentaje: null };
                  const hasData = stat.total > 0;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={key}>
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
                            {hasData ? `${stat.aprobadas} de ${stat.total} registros` : 'Sin registros en el periodo'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
            <Typography variant="body2" color="text.terciary" sx={{ p: 2 }}>
              (*) Aprobado: calificación igual o mayor a 6 (seis).
            </Typography>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ pb: 3 }}>
              <Typography variant="h6">Indicadores de aprobación por cierres</Typography>
              <Typography variant="body2" color="text.secondary">
                Porcentaje de aprobacion de los cierres cuatrimestrales y nota final.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {closingApprovalStats.map(({ key, title, description, porcentaje, total, aprobadas, ultimaNota }) => (
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
                        bgcolor: total ? 'grey.50' : 'background.paper',
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
                          {porcentaje !== null ? `${porcentaje}%` : '--%'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {total ? `${aprobadas} de ${total} cierres aprobados` : 'Sin registros'}
                        </Typography>
                        {ultimaNota !== null && (
                          <Typography variant="caption" color="text.secondary">
                            Nota registrada: {ultimaNota}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {courseStats?.promedio_curso != null && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comparacion con el curso
                </Typography>
                <Typography variant="body1">
                  Calificación promedio del curso: {courseStats.promedio_curso ?? 'N/D'}
                </Typography>
                {courseStats.diferencia_vs_curso != null && (
                  <Typography
                    variant="body2"
                    color={
                      courseStats.diferencia_vs_curso > 0 ? 'success.main' : courseStats.diferencia_vs_curso < 0
                        ? 'error.main'
                        : 'text.secondary'
                    }
                    sx={{ mt: 1 }}
                  >
                    {courseStats.diferencia_vs_curso > 0
                      ? `El alumno esta ${Math.abs(courseStats.diferencia_vs_curso)} puntos por encima del promedio.`
                      : courseStats.diferencia_vs_curso < 0
                        ? `El alumno esta ${Math.abs(courseStats.diferencia_vs_curso)} puntos por debajo del promedio.`
                        : 'El alumno se encuentra en la media del curso.'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Informes pedagogicos</Typography>
              {hasPedagogicReports ? (
                materiasIntervenidas.length ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Materias intervenidas: {materiasIntervenidas.join(', ')}
                  </Typography>
                ) : null
              ) : (
                <Typography variant="body2" color="text.secondary">
                  El alumno no recibio asesoramiento pedagogico hasta el momento.
                </Typography>
              )}
              {hasPedagogicReports ? (
                <List dense>
                  {pedagogicReports.slice(0, 5).map((informe, idx) => {
                    const materia =
                      resolveMateriaFromInforme(informe) || informe.titulo || 'Materia no especificada';
                    const asesor = resolveAsesorFromInforme(informe);
                    const fecha = informe.fecha ? dayjs(informe.fecha).format('DD/MM/YYYY') : null;
                    const titulo =
                      informe.titulo && materia !== informe.titulo ? informe.titulo : null;
                    return (
                      <ListItem key={informe.id_informe ?? `${materia}-${idx}`}>
                        <ListItemText
                          primary={materia}
                          secondary={
                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                              {titulo && (
                                <Typography variant="body2" color="text.primary">
                                  {titulo}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {asesor ? `Asesor: ${asesor}` : 'Asesor: N/D'}
                                {fecha ? ` - ${fecha}` : ''}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : null}
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography>
              {emptyMessage ||
                `Seleccioná ${isTutor ? 'un hijo o hija' : 'un ciclo, curso y alumno'} para realizar el análisis.`}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

