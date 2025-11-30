import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import {
  School,
  Person,
  Groups,
  TrendingUp,
  Event,
  Lightbulb,
} from '@mui/icons-material';
import { useDataProvider, usePermissions } from 'react-admin';

// Componente de tarjeta estadistica
const StatCard = ({ title, value, icon, color, trend }) => (
  <Card
    sx={{
      height: '100%',
      minWidth: 195,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#4caf50' }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const HolidayCard = ({ holidays, loading, error }) => {
  const monthLabel = new Date().toLocaleDateString('es-AR', { month: 'long' });
  let content;

  if (loading) {
    content = (
      <Typography variant="body2" color="textSecondary">
        Cargando feriados...
      </Typography>
    );
  } else if (error) {
    content = (
      <Typography variant="body2" color="error">
        No se pudo cargar la informacion.
      </Typography>
    );
  } else if (!holidays.length) {
    content = (
      <Typography variant="body2" color="textSecondary">
        No hay feriados en este mes.
      </Typography>
    );
  } else {
    content = (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: '#607D8B', fontStyle: 'italic' }}>
          Listado de los feriados por orden cronológico
        </Typography>
        <Box
          sx={{
            position: 'relative',
            pl: 3,
            borderLeft: '2px solid #CFD8DC',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {holidays.slice(0, 8).map((holiday) => {
            const date = new Date(holiday.date);
            return (
              <Box key={holiday.date} sx={{ position: 'relative', pl: 2 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: -13,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#607D8B',
                    border: '2px solid #ECEFF1',
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0A2E75' }}>
                  {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {holiday.localName || holiday.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  const total = holidays.length;

  return (
    <Card
      sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #607D8B15 0%, #607D8B05 100%)',
        border: '1px solid #607D8B30',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#455A64' }}>
              Feriados Nacionales
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Total Feriados
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#455A64' }}>
              {loading ? '...' : `${total}${total === 1 ? '' : 's'}`}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: '#607D8B20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Event sx={{ fontSize: 28, color: '#455A64' }} />
          </Box>
        </Box>
        {content}
      </CardContent>
    </Card>
  );
};

const normalizeRole = (permissions) => {
  const byId = {
    1: 'admin',
    2: 'director',
    3: 'docente',
    4: 'auxiliar',
    5: 'asesor_pedagogico',
    6: 'alumno',
    7: 'tutor',
    9: 'jefe_auxiliar',
  };

  if (permissions === null || permissions === undefined) return null;

  const num = Number(permissions);
  if (!Number.isNaN(num) && byId[num]) return byId[num];

  if (typeof permissions === 'string') {
    const normalized = permissions.toLowerCase();
    const mapByName = {
      admin: 'admin',
      administrador: 'admin',
      director: 'director',
      docente: 'docente',
      auxiliar: 'auxiliar',
      'asesor pedagogico': 'asesor_pedagogico',
      asesor_pedagogico: 'asesor_pedagogico',
      alumno: 'alumno',
      tutor: 'tutor',
      'jefe de auxiliares': 'jefe_auxiliar',
      jefe_auxiliar: 'jefe_auxiliar',
    };
    return mapByName[normalized] || null;
  }

  return null;
};

const getWeekdayLabels = () => {
  const labels = [];
  const cursor = new Date();
  const keyMap = { 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie' };

  while (labels.length < 5) {
    const day = cursor.getDay(); // 0 domingo, 6 sabado
    if (day !== 0 && day !== 6) {
      labels.unshift({
        key: keyMap[day],
        label: cursor.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return labels;
};

const buildAttendanceDays = (asistenciaSemana) => {
  const parseSafeDate = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string') {
      const isoDateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoDateOnly) {
        const [, y, m, d] = isoDateOnly;
        return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
      }
      const dmy = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
      if (dmy) {
        const [, d, m, y] = dmy;
        return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
      }
    }
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const baseDays = getWeekdayLabels().map((day) => ({
    ...day,
    value: asistenciaSemana?.[day.key] ?? '--',
  }));

  if (!asistenciaSemana) return baseDays;

  const asArray = Array.isArray(asistenciaSemana)
    ? asistenciaSemana
    : Object.entries(asistenciaSemana).map(([key, value]) =>
        typeof value === 'object' ? { key, ...value } : { key, valor: value }
      );

  const normalized = asArray
    .map((item, idx) => {
      const fechaRaw = item.fecha || item.date || item.dia_fecha || item.dia || item.key;
      const value =
        item.porcentaje ??
        item.asistencia ??
        item.valor ??
        item.value ??
        item.porcentaje_asistencia ??
        item.pct ??
        item.p;
      const date = fechaRaw ? parseSafeDate(fechaRaw) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      return {
        key: fechaRaw || idx,
        label: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        value: value ?? '--',
        timestamp: date.getTime(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-5)
    .map(({ timestamp, ...rest }) => rest);

  if (normalized.length) return normalized;
  return baseDays;
};

const formatAttendanceValue = (value) => {
  if (value === null || value === undefined || value === '') return '--';
  if (typeof value === 'string' && value.trim().endsWith('%')) return value.trim();
  const num = Number(value);
  if (!Number.isNaN(num)) return `${num}%`;
  return String(value);
};

const ROLE_LABELS = {
  admin: 'Administrador',
  director: 'Director',
  docente: 'Docente',
  auxiliar: 'Auxiliar',
  asesor_pedagogico: 'Asesor Pedagogico',
  tutor: 'Tutor',
  jefe_auxiliar: 'Jefe de Auxiliares',
};

const InfoTile = ({ title, value, helper, color = '#0A2E75', fullHeight = true, sx = {} }) => (
  <Paper
    sx={{
      p: 2,
      height: fullHeight ? '100%' : 'auto',
      border: `1px solid ${color}30`,
      background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
      ...sx,
    }}
  >
    <Typography variant="body2" color="textSecondary">
      {title}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 600, color }}>
      {value}
    </Typography>
    {helper && (
      <Typography variant="caption" color="textSecondary">
        {helper}
      </Typography>
    )}
  </Paper>
);

const SmallList = ({ items, singleColumn = false }) => {
  const emptyCard = (
    <Paper sx={{ p: 1.5, border: '1px solid #E0E0E0'}}>
      <Typography variant="body2" color="textSecondary">
        Sin datos para mostrar.
      </Typography>
    </Paper>
  );

  const cards = items?.length
    ? items.map((item) => (
        <Paper
          key={item.id || item.title || item.alumno || Math.random()}
          sx={{ p: 1.5, border: '1px solid #E0E0E0' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {item.title || item.alumno || item.hijo}
          </Typography>
          {(item.curso_anio || item.curso_division) && (
            <Typography variant="caption" color="textSecondary">
              Curso: {item.curso_anio ? `${item.curso_anio}�` : ''}{item.curso_division ? ` ${item.curso_division}` : ''}
            </Typography>
          )}
          {item.materia && (
            <Typography variant="caption" color="textSecondary">
              {item.materia}
            </Typography>
          )}
          {item.fecha && (
            <Typography variant="caption" sx={{ color: '#455A64', display: 'block' }}>
              {item.fecha}
            </Typography>
          )}
          {item.grade && (
            <Typography variant="caption" color="textSecondary">
              Nota: {item.grade}
            </Typography>
          )}
        </Paper>
      ))
    : emptyCard;

  if (singleColumn) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        {cards}
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {items?.length ? (
        items.map((item) => (
          <Grid
            item
            xs={12}
            sm={6}
            key={item.id || item.title || item.alumno || Math.random()}
          >
            <Paper sx={{ p: 1.5, border: '1px solid #E0E0E0' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.title || item.alumno || item.hijo}
              </Typography>
              {(item.curso_anio || item.curso_division) && (
                <Typography variant="caption" color="textSecondary">
                  Curso: {item.curso_anio ? `${item.curso_anio}�` : ''}{item.curso_division ? ` ${item.curso_division}` : ''}
                </Typography>
              )}
              {item.materia && (
                <Typography variant="caption" color="textSecondary">
                  {item.materia}
                </Typography>
              )}
              {item.fecha && (
                <Typography variant="caption" sx={{ color: '#455A64', display: 'block' }}>
                  {item.fecha}
                </Typography>
              )}
              {item.grade && (
                <Typography variant="caption" color="textSecondary">
                  Nota: {item.grade}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          {emptyCard}
        </Grid>
      )}
    </Grid>
  );
};

const RoleInfoPanel = ({ role, data, loading, error }) => {
  if (!role || role === 'alumno') return null;

  const dataset = data || {};
  const renderDocente = () => {
    const cursos = Array.isArray(dataset.cursos) ? dataset.cursos : [];
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Materias/Cursos asignados
        </Typography>
        {cursos.length ? (
          <Grid container spacing={2}>
            {cursos.map((curso) => {
              const asistencia =
                typeof curso === 'object' && curso !== null ? curso.asistenciaSemana : undefined;
              const attendanceDays = buildAttendanceDays(asistencia);
              const etiqueta =
                typeof curso === 'string' ? curso : curso?.etiqueta || curso?.nombre || 'Curso';
              const key =
                (typeof curso === 'object' &&
                  curso !== null &&
                  (curso.id_materia_curso || curso.id_curso || curso.id)) ||
                etiqueta;
              return (
                <Grid item xs={12} md={6} key={key}>
                  <Paper sx={{ p: 2, border: '1px solid #E0E0E0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {etiqueta}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' },
                        gap: 1,
                      }}
                    >
                      {attendanceDays.map((day) => (
                        <Paper key={day.key} sx={{ p: 1.2, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            {day.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A2E75' }}>
                            {formatAttendanceValue(day.value)}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Sin cursos asignados.
          </Typography>
        )}
      </Box>
    );
  };

  const renderAdmin = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <InfoTile title="Usuarios sin roles" value={dataset.usuariosSinRol ?? '--'} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoTile title="Alumnos sin cursos" value={dataset.alumnosSinCurso ?? '--'} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoTile title="Docentes sin curso-materia" value={dataset.docentesSinAsignacion ?? '--'} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoTile title="Auxiliares sin cursos" value={dataset.auxiliaresSinCurso ?? '--'} />
      </Grid>
    </Grid>
  );

  const renderDirector = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <InfoTile title="Porcentaje Asistencia del día" value={`${dataset.asistenciaHoy ?? '--'}%`} color="#1976D2" />
      </Grid>
      <Grid item xs={12} md={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InfoTile title="Aprobados 1° Cuatrimestre" value={`${dataset.aprobados?.c1 ?? '--'}%`} color="#43A047" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InfoTile title="Aprobados 2° Cuatrimestre" value={`${dataset.aprobados?.c2 ?? '--'}%`} color="#FB8C00" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InfoTile title="Aprobados calificación final" value={`${dataset.aprobados?.final ?? '--'}%`} color="#7E57C2" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const renderAuxiliar = () => {
    const justificativos = Array.isArray(dataset.justificativosPendientes)
      ? dataset.justificativosPendientes
      : [];
    const cursos = Array.isArray(dataset.cursos) ? dataset.cursos : [];
    const incidencias = dataset.incidencias;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, margin: 'none'  }}>
            Justificativos pendientes
          </Typography>
          <SmallList items={justificativos} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Asistencia de mis cursos
          </Typography>
          {cursos.length ? (
            <Grid container spacing={2}>
              {cursos.map((curso) => {
                const asistencia =
                  typeof curso === 'object' && curso !== null ? curso.asistenciaSemana : undefined;
                const attendanceDays = buildAttendanceDays(asistencia);
                const fallbackDays = getWeekdayLabels();
                const attendanceByLabel = attendanceDays.reduce((acc, day) => {
                  acc[day.label] = day.value;
                  return acc;
                }, {});
                const displayDays = fallbackDays.map((day) => ({
                  key: day.label,
                  label: day.label,
                  value: attendanceByLabel[day.label] ?? '--',
                }));
                const etiqueta =
                  typeof curso === 'string' ? curso : curso?.etiqueta || curso?.nombre || 'Curso';
                const key =
                  (typeof curso === 'object' &&
                    curso !== null &&
                    (curso.id_materia_curso || curso.id_curso || curso.id)) ||
                  etiqueta;
                return (
                  <Grid item xs={12} key={key}>
                    <Paper sx={{ p: 2, border: '1px solid #E0E0E0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {etiqueta}
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' },
                        gap: 1,
                      }}
                    >
                      {displayDays.map((day) => (
                        <Paper key={day.key} sx={{ p: 1.2, border: '1px solid #E0E0E0', textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            {day.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A2E75' }}>
                              {formatAttendanceValue(day.value)}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Sin cursos asignados.
            </Typography>
          )}
          {incidencias && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <InfoTile title="Incidencias abiertas" value={incidencias.abiertas ?? '--'} color="#D32F2F" />
              <InfoTile title="Incidencias cerradas" value={incidencias.cerradas ?? '--'} color="#388E3C" />
            </Box>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderAsesor = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <InfoTile title="Alumnos con asesoramiento" value={dataset.alumnosEnAsesoramiento ?? '--'} color="#00796B" />
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Ultimas intervenciones
        </Typography>
        <SmallList
          items={(Array.isArray(dataset.intervenciones) ? dataset.intervenciones : []).map((item, idx) => ({
            ...item,
            id: item.id || idx,
            title: `${item.alumno} - ${item.materia}`,
            fecha: item.fecha,
          }))}
        />
      </Grid>
    </Grid>
  );

  const renderTutor = () => (
    <Grid container spacing={2} alignItems="stretch">
      <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Asistencia promedio
          </Typography>
          <InfoTile
            title="Últimos 30 días"
            value={`${dataset.asistencia30d ?? '--'}%`}
            color="#0288D1"
            fullHeight={false}
            sx={{ maxWidth: 240 }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: 'flex' , margin: '0'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' , margin: '0'}}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600}}>
            Calificaciones recientes
          </Typography>
          <SmallList
            singleColumn
            sx={{ margin: 0}}
            items={(
              Array.isArray(dataset.calificacionesRecientes)
                ? dataset.calificacionesRecientes.slice(0, 3)
                : []
            ).map((item, idx) => ({
              ...item,
              id: item.id || idx,
              title: `${item.hijo} - ${item.materia}`,
              grade: item.nota ?? item.grade,
            }))}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: 'flex', margin: '0' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', margin: '0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, margin: '0' }}>
            Justificativos cargados recientes
          </Typography>
          <SmallList
            singleColumn
            items={
              Array.isArray(dataset.justificativosRecientes)
                ? dataset.justificativosRecientes.slice(0, 3)
                : []
            }
          />
        </Box>
      </Grid>
    </Grid>
  );

  const renderers = {
    admin: renderAdmin,
    director: renderDirector,
    docente: renderDocente,
    auxiliar: renderAuxiliar,
    asesor_pedagogico: renderAsesor,
    tutor: renderTutor,
    jefe_auxiliar: renderAuxiliar,
  };

  let content;
  if (loading) {
    content = (
      <Typography variant="body2" color="textSecondary">
        Cargando informacion por rol...
      </Typography>
    );
  } else if (error) {
    content = (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  } else {
    content =
      renderers[role]?.() || (
        <Typography variant="body2" color="textSecondary">
          No hay informacion disponible para este rol.
        </Typography>
      );
  }

  return (
    <Card
      sx={{
        width: '100%',
        border: '1px solid #0A2E7520',
        background: 'linear-gradient(135deg, #0A2E7510 0%, #0A2E7505 100%)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A2E75' }}>
              Tablero de información general
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Vista personalizada para: {ROLE_LABELS[role] || role}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: '#0A2E7515',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lightbulb sx={{ color: '#0A2E75' }} />
          </Box>
        </Box>
        {content}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const dataProvider = useDataProvider();
  const { permissions } = usePermissions();
  const [stats, setStats] = useState({
    alumnos: 0,
    docentes: 0,
    auxiliares: 0,
    cursos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [holidaysError, setHolidaysError] = useState(null);
  const role = normalizeRole(permissions);
  const [rolePanel, setRolePanel] = useState(null);
  const [loadingRolePanel, setLoadingRolePanel] = useState(false);
  const [rolePanelError, setRolePanelError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dataProvider.getPanelGeneralResumen();
        setStats({
          alumnos: data?.alumnos ?? 0,
          docentes: data?.docentes ?? 0,
          auxiliares: data?.auxiliares ?? 0,
          cursos: data?.cursos ?? 0,
        });
      } catch (error) {
        console.error('Error cargando estadisticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dataProvider]);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      setHolidaysError(null);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const currentMonth = now.getMonth();
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
        if (!response.ok) {
          throw new Error('Respuesta no valida');
        }
        const data = await response.json();
        const monthHolidays = Array.isArray(data)
          ? data.filter((holiday) => {
              const holidayDate = new Date(holiday.date);
              return holidayDate.getMonth() === currentMonth;
            })
          : [];
        setHolidays(monthHolidays);
      } catch (error) {
        console.error('Error obteniendo feriados:', error);
        setHolidays([]);
        setHolidaysError('No se pudieron cargar los feriados');
      } finally {
        setLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, []);

  useEffect(() => {
    if (!role || role === "alumno") return;

    const fetchRolePanel = async () => {
      setLoadingRolePanel(true);
      setRolePanelError(null);
      try {
        const { data } = await dataProvider.getPanelPorRol();
        setRolePanel(data);
      } catch (error) {
        console.error("Error obteniendo panel por rol:", error);
        setRolePanelError("No se pudo cargar la informacion por rol");
      } finally {
        setLoadingRolePanel(false);
      }
    };

    fetchRolePanel();
  }, [dataProvider, role]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#0A2E75', fontWeight: 600 }}>
          Panel General
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Bienvenido a MiEscuela 4.0 - Vista general del sistema
        </Typography>
      </Box>

      {/* Tarjetas de estadisticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Alumnos"
            value={loading ? '...' : stats.alumnos}
            icon={<School sx={{ fontSize: 32, color: '#2196F3' }} />}
            color="#2196F3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Docentes"
            value={loading ? '...' : stats.docentes}
            icon={<Person sx={{ fontSize: 32, color: '#4CAF50' }} />}
            color="#4CAF50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Auxiliares"
            value={loading ? '...' : stats.auxiliares}
            icon={<Groups sx={{ fontSize: 32, color: '#FF9800' }} />}
            color="#FF9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cursos"
            value={loading ? '...' : stats.cursos}
            icon={<School sx={{ fontSize: 32, color: '#9C27B0' }} />}
            color="#9C27B0"
          />
        </Grid>

      </Grid>

      <Box sx={{ mb: 4 }}>
        <HolidayCard holidays={holidays} loading={loadingHolidays} error={holidaysError} />
      </Box>

      {role && role !== 'alumno' && (
        <Box sx={{ mb: 4 }}>
          <RoleInfoPanel
            role={rolePanel?.role || role}
            data={rolePanel?.data}
            loading={loadingRolePanel}
            error={rolePanelError}
          />
        </Box>
      )}
    </Box>
  );
};


