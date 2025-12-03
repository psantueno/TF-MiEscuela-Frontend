// src/resources/asistencias/AsistenciasHistorico.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Stack,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Card,
    CardContent,
    CircularProgress,
    Tooltip as MuiTooltip,
} from "@mui/material";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    ReferenceLine,
} from "recharts";
import { dataProvider } from "../../providers/dataProvider";
import { generarReportePDF } from "./generarReportePDF";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HelperCard from "../../components/HelperCard";

// Paleta para gráficos inspirada en el formato "Bueno / Regular / Malo" de Excel (tonos suaves)
const palette = {
    // Verde tipo Excel "Bueno"
    good: {
        fill: "#468b40ff",      // Excel Good background
        bg: "#C6EFCE",        // Igual que Excel
        text: "#006100",      // Excel Good text
        border: "#7FBA7A"     // Borde suave verde
    },

    // Amarillo tipo Excel "Advertencia / Regular"
    warning: {
        fill: "#FFEB9C",      // Excel Neutral background
        bg: "#ffeb9c9f",
        text: "#9C5700",      // Excel Warning/Note text
        border: "#cc9f1aff"     // Borde coherente
    },

    // Azul suave → Adaptación del estilo “Neutral” manteniendo contraste
    neutral: {
        fill: "#E4EBF9",      // Tu azul soft como fondo
        bg: "#bfd1f5d3",
        text: "#061B46",      // Azul profundo para buen contraste
        border: "#283c68ff"     // Borde suave azul
    },

    // Rojo "malo" con más rojo y menos rosa/bordó
    bad: {
        fill: "#D64545",      // Rojo marcado para barras/sectores
        bg: "#FFC7CE",        // Base clara tipo Excel
        text: "#9A1B1B",      // Texto rojo profundo para contraste
        border: "#F2A0A5"     // Borde suave a juego
    },
};


const chartGridColor = "#e6ebf2";
const chartTickColor = "#4B5563";
const tooltipStyle = {
    borderRadius: 10,
    border: `1px solid ${chartGridColor}`,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const toISO = (d) => new Date(d).toISOString().slice(0, 10);
const hoyAR = () => toISO(new Date());
const formatFechaEje = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
};
const formatFechaLarga = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-AR", { year: "numeric", month: "2-digit", day: "2-digit" });
};
const formatPct2 = (value) => `${(Number(value) || 0).toFixed(2)}%`;
const RADIAN = Math.PI / 180;
const pieLabelBold = ({ cx, cy, midAngle, outerRadius, percent, name, payload }) => {
    // Posiciona el label fuera del radio para mejor lectura, en negrita y con el color del segmento
    const radius = outerRadius + 14;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textColor = payload?.fill || payload?.color || "#374151";
    return (
        <text
            x={x}
            y={y}
            fill={textColor}
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontWeight={700}
            fontSize={16}
        >
            {pieLabelPct({ name, percent })}
        </text>
    );
};
const pieLabelPct = ({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`;
const pieTooltipFormatter = (_value, name, props) => [
    `${((props?.payload?.percent || 0) * 100).toFixed(1)}%`,
    name,
];

// Mapeo de estado (string) a valor numérico para graficar
const estadoToValue = (estado) => {
    const e = (estado || "").toUpperCase();
    if (e.includes("PRES")) return 3; // Presente
    if (e.includes("TAR")) return 2; // Tarde
    if (e.includes("JUST")) return 1; // Ausente Justificada
    if (e.includes("AUS")) return 0; // Ausente No Justificada
    return null;
};

// Mapeo inverso para mostrar etiquetas legibles en eje Y / tooltip
const valueToEstadoLabel = (v) => {
    if (v === 3) return "Presente";
    if (v === 2) return "Tarde";
    if (v === 1) return "Aus. Just.";
    if (v === 0) return "Aus. No Just.";
    return "";
};

// === Cálculo de métricas generales ===
const calcMetrics = (items) => {
    const registrosValidos = items.filter(
        (i) => i.id_estado !== null && i.estado_nombre
    );
    const fechasConAsistencia = [...new Set(registrosValidos.map((i) => i.fecha))];
    const totalClases = fechasConAsistencia.length;
    const total = registrosValidos.length || 0;
    const count = { P: 0, A: 0, AJ: 0, T: 0 };

    registrosValidos.forEach((i) => {
        const e = (i.estado_nombre || "").toUpperCase();
        if (e.includes("PRES")) count.P++;
        else if (e.includes("TAR")) count.T++;
        else if (e.includes("JUST")) count.AJ++;
        else if (e.includes("AUS")) count.A++;
    });

    const pct = (n) => (total ? Math.round((n * 10000) / total) / 100 : 0);
    const asistenciaConTarde = count.P + count.T;

    return {
        totalRegistros: total,
        totalClases,
        pctAsistencia: pct(asistenciaConTarde), // Tarde cuenta como presente
        pctTardanzas: pct(count.T),
        pctAusJust: pct(count.AJ),
        pctAusNoJust: pct(count.A),
        countPresentes: count.P,
        countTardes: count.T,
        countAusJust: count.AJ,
        countAusNoJust: count.A,
    };
};

// === Agrupación para gráficos ===
const groupForCharts = (items) => {
    const buckets = {};
    items.forEach((i) => {
        const f = i.fecha;
        const e = (i.estado_nombre || "").toUpperCase();
        if (!buckets[f]) buckets[f] = { key: f, faltas: 0, tardanzas: 0, presentes: 0 };
        if (e.includes("AUS")) buckets[f].faltas++;
        else if (e.includes("TAR")) buckets[f].tardanzas++;
        else if (e.includes("PRES")) buckets[f].presentes++;
    });
    return Object.values(buckets);
};

// === Métricas por alumno ===
const calcMetricsPorAlumno = (items) => {
    const registrosValidos = items.filter(
        (i) => i.id_estado !== null && i.estado_nombre
    );
    const alumnos = {};

    registrosValidos.forEach((i) => {
        const id = i.alumno_id || i.id_alumno;
        if (!id) return;
        const estado = (i.estado_nombre || "").toUpperCase();

        if (!alumnos[id]) {
            alumnos[id] = {
                id_alumno: id,
                alumno: i.alumno_nombre || `Alumno ${id}`,
                P: 0,
                T: 0,
                AJ: 0,
                A: 0,
                total: 0,
            };
        }

        alumnos[id].total++;
        if (estado.includes("PRES")) alumnos[id].P++;
        else if (estado.includes("TAR")) alumnos[id].T++;
        else if (estado.includes("JUST")) alumnos[id].AJ++;
        else if (estado.includes("AUS")) alumnos[id].A++;
    });
    
    const resultado = Object.values(alumnos).map((a) => {
        const pct = (n) => (a.total ? Math.round((n * 10000) / a.total) / 100 : 0);
        return {
            alumno: a.alumno,
            pctAsistencia: pct(a.P + a.T), // Tarde se computa como presente
            pctTardanzas: pct(a.T),
            pctAusJust: pct(a.AJ),
            pctAusNoJust: pct(a.A),
            total: a.total,
            promAlu: a.promedioAlumno,
            promCur: a.promedioCurso, 
            countPresentes: a.P,
            countTardes: a.T,
            countAusJust: a.AJ,
            countAusNoJust: a.A,
        };
    });
    return resultado.sort((a, b) => b.pctAsistencia - a.pctAsistencia);
};

// === Heatmap de asistencia por día ===
const buildHeatmapData = (items) => {
    const map = {};
    items.forEach((i) => {
        const fecha = i.fecha;
        const estado = (i.estado_nombre || "").toUpperCase();
        if (!map[fecha]) {
            map[fecha] = { fecha, present: 0, absent: 0 };
        }
        if (estado.includes("PRES")) map[fecha].present++;
        else if (estado.includes("AUS")) map[fecha].absent++;
    });
    return Object.values(map).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
};

// === Estadísticas semanales ===
const buildWeeklyStats = (items) => {
    const weekMap = {};
    items.forEach((i) => {
        const date = new Date(i.fecha);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // lunes
        const weekKey = weekStart.toISOString().slice(0, 10);
        
        const estado = (i.estado_nombre || "").toUpperCase();
        if (!weekMap[weekKey]) {
            weekMap[weekKey] = { week: weekKey, present: 0, total: 0 };
        }
        weekMap[weekKey].total++;
        if (estado.includes("PRES")) weekMap[weekKey].present++;
    });
    
    return Object.values(weekMap)
        .map((w) => ({ ...w, pct: w.total ? Math.round((w.present * 10000) / w.total) / 100 : 0 }))
        .sort((a, b) => new Date(a.week) - new Date(b.week));
};

// === COMPONENTE PRINCIPAL ===
export const AsistenciasHistorico = () => {
    const [cursos, setCursos] = useState([]);
    const [cursoId, setCursoId] = useState("");
    const [alumnos, setAlumnos] = useState([]);
    const [alumnoId, setAlumnoId] = useState("");
    const [alumnoNombre, setAlumnoNombre] = useState("");
    const [desde, setDesde] = useState(toISO(new Date(Date.now() - 30 * 86400000)));
    const [hasta, setHasta] = useState(hoyAR());
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busquedaEjecutada, setBusquedaEjecutada] = useState(false);
    const [sinAlumnos, setSinAlumnos] = useState(false);
    const [promedios, setPromedios] = useState({});

    const metrics = useMemo(() => calcMetrics(rows), [rows]);
    const grouped = useMemo(() => groupForCharts(rows), [rows]);
    const ranking = useMemo(() => calcMetricsPorAlumno(rows), [rows]);
    const isAlumnoSeleccionado = Boolean(alumnoId);

    // === Cargar cursos ===
    useEffect(() => {
        dataProvider
            .getList("cursos", {
                pagination: { page: 1, perPage: 100 },
                sort: { field: "anio_escolar", order: "ASC" },
                filter: {},
            })
            .then(({ data }) =>
                setCursos(
                    data.map((c) => ({
                        id: c.id_curso,
                        name: `${c.anio_escolar}° ${c.division}`,
                    }))
                )
            )
            .catch(() => setCursos([]));
    }, []);

    // === Cargar alumnos del curso ===
    useEffect(() => {
        if (!cursoId) {
            setAlumnos([]);
            setSinAlumnos(false);
            return;
        }

        setLoading(true);
        const fechaRef = hasta || hoyAR();

        dataProvider
            .getAlumnosCurso(cursoId, fechaRef)
            .then(({ data }) => {
                setAlumnos(data);
                setSinAlumnos(data.length === 0); // âœ… marcar si no hay alumnos
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error cargando alumnos del curso:", err);
                setAlumnos([]);
                setSinAlumnos(true); // también mostrar mensaje en error
                setLoading(false);
            });
    }, [cursoId, hasta]);

    // === Buscar asistencias ===
    const buscar = async () => {
        if (!cursoId) return;
        if (alumnos.length === 0) {
            setSinAlumnos(true);
            setBusquedaEjecutada(false);
            return;
        }

        setLoading(true);
        try {
            const tipo = alumnoId ? "alumno" : "curso";
            const { data } = await dataProvider.asistenciasHistorico(
                tipo,
                alumnoId || cursoId,
                desde,
                hasta
            );

            if(tipo === "alumno"){
                const { data } = await dataProvider.getPromedioAsistenciaCurso(cursoId, desde, hasta);
                console.log("Promedios del curso:", data);
                setPromedios(data);
            }

            setRows(data);
            setBusquedaEjecutada(true);
            setSinAlumnos(false);
        } catch (err) {
            console.error(err);
            setBusquedaEjecutada(false);
        } finally {
            setLoading(false);
        }
    };

    const exportarPDF = async () => {                                                                             
        const alumnoNombreResolvido = (() => {
            if (alumnoNombre) return alumnoNombre;
            const r = rows.find((row) => String(row.alumno_id) === String(alumnoId));
            if (!r) return "";
            const compuesto = `${r.alumno_apellido || ""} ${r.alumno_nombre_prop || ""}`.trim();
            return r.alumno_nombre || r.alumno || compuesto;
        })();

        await generarReportePDF({                                                                                 
            tipo: alumnoId ? "alumno" : "curso",                                                                  
            cursos,                                                                                               
            cursoId,                                                                                              
            alumno: alumnoNombreResolvido,                                                                                 
            desde,                                                                                                
            hasta,                                                                                                
            metrics,                                                                                              
            rows,                                                                                                 
        });                                                                                                       
    };                                                                                                            


    // ======================
    // Render
    // ======================
    return (
        <Box p={3}>
          
            <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "background 0.3s ease",
        }}
      >
        <CalendarMonthIcon
          sx={{ color: "#1976d2", fontSize: 32 }}
        />
        <Typography
          variant="h5"
          fontWeight="600"
          color="primary"
        >
          Reporte de Asistencias Histórico
        </Typography>
      </Box>
                  

            <HelperCard
                title="Guía rápida"
                items={[
                    "Elegí un curso obligatoriamente; puedes filtrar por un alumno puntual de ese curso.",
                    "Define el rango de fechas Desde / Hasta antes de buscar (por defecto últimos 30 días).",
                    "Presiona Buscar para cargar gráficos y métricas; si eliges un alumno, verás su evolución individual.",
                    "Genera el PDF cuando tengas resultados para compartir el resumen.",
                    "Usa Volver al análisis del curso para salir del modo alumno.",
                ]}
            />

            {/* === Filtros === */}
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" mb={3}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Curso</InputLabel>
                    <Select
                        value={cursoId}
                        label="Curso"
                        onChange={(e) => {
                            setCursoId(e.target.value);
                            setAlumnoId("");
                            setAlumnoNombre("");
                            setBusquedaEjecutada(false);
                            setRows([]);
                        }}
                    >
                        <MenuItem value="">Seleccionar curso</MenuItem>
                        {cursos.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Alumno (opcional)</InputLabel>
                    <Select
                        value={alumnoId}
                        label="Alumno (opcional)"
                        onChange={(e) => {
                            const id = String(e.target.value || "");
                            setAlumnoId(id);
                            const a = alumnos.find((x) => String(x.id_alumno) === id);
                            const nombre = `${a?.alumno_apellido || ""} ${a?.alumno_nombre_prop || ""}`.trim();
                            setAlumnoNombre(nombre);
                            setBusquedaEjecutada(false);
                            setRows([]);
                        }}
                        disabled={!alumnos.length}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {[...alumnos]
                            .sort((a, b) => {
                                const apA = (a?.alumno_apellido || '').toLocaleLowerCase();
                                const apB = (b?.alumno_apellido || '').toLocaleLowerCase();
                                const cmp = apA.localeCompare(apB, 'es', { sensitivity: 'base' });
                                if (cmp !== 0) return cmp;
                                const nA = `${a?.alumno_nombre_prop || ''} ${a?.alumno_apellido || ''}`.toLocaleLowerCase();
                                const nB = `${b?.alumno_nombre_prop || ''} ${b?.alumno_apellido || ''}`.toLocaleLowerCase();
                                return nA.localeCompare(nB, 'es', { sensitivity: 'base' });
                            })
                            .map((a) => (
                                <MenuItem key={a.id_alumno} value={a.id_alumno}>
                                    {(a?.alumno_apellido || '') + ' ' + (a?.alumno_nombre_prop || '')}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <TextField
                    type="date"
                    label="Desde"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    type="date"
                    label="Hasta"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={18} /> : <SearchIcon />}
                    onClick={buscar}
                    disabled={!cursoId || loading}
                    sx={{ height: 40 }}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={exportarPDF}
                    disabled={!rows.length}
                    sx={{ height: 40 }}
                >
                    Generar PDF
                </Button>
            </Stack>

            {/* === Sin Resultados === */}
            {sinAlumnos && !loading && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        mt: 6,
                        color: "#5f6368",
                        textAlign: "center",
                    }}
                >
                    <SearchOffIcon sx={{ fontSize: 60, mb: 1, color: "#9E9E9E" }} />
                    <Typography variant="h6" fontWeight="500">
                        No hay alumnos registrados en este curso.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#9E9E9E" }}>
                        Verifica que el curso tenga alumnos asignados o selecciona otro curso.
                    </Typography>
                </Box>
            )}


            {/* === Resultados === */}
            {busquedaEjecutada && rows.length > 0 && (
                <>
                    {/* === Modo alumno: botón volver === */}
                    {isAlumnoSeleccionado && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => {
                                setAlumnoId("");
                                setAlumnoNombre("");
                                setBusquedaEjecutada(false);
                                setRows([]);
                            }}
                            sx={{ mb: 2 }}
                        >
                            Volver al análisis del curso
                        </Button>
                    )}

                    {/* === Cards === */}
                    <Stack direction="row" spacing={2} flexWrap="wrap" mb={3}>
                        <MetricCard
                            title="Asistencia (incluye tardanzas)"
                            value={formatPct2(metrics.pctAsistencia)}
                            palette={palette.good}
                        />
                        <MetricCard
                            title="Tardanzas"
                            value={formatPct2(metrics.pctTardanzas)}
                            palette={palette.warning}
                        />
                        <MetricCard
                            title="Ausencias justificadas"
                            value={formatPct2(metrics.pctAusJust)}
                            palette={palette.neutral}
                        />
                        <MetricCard
                            title="Ausencias No justificadas"
                            value={formatPct2(metrics.pctAusNoJust)}
                            palette={palette.bad}
                        />
                    </Stack>

                    <Stack direction="row" justifyContent="center" mb={3}>
                        <Card
                            sx={{
                                width: "100%",
                                background: "linear-gradient(135deg, #F8FAFD 0%, #EFF3F9 100%)",
                                textAlign: "center",
                                borderTop: `4px solid ${palette.neutral.border}`,
                                color: palette.neutral.text,
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" fontWeight={700}>
                                    {metrics.totalClases}
                                </Typography>
                                <Typography variant="body2">Clases registradas</Typography>
                            </CardContent>
                        </Card>
                    </Stack>

                    {/* === GRÁFICOS === */}
                    {!isAlumnoSeleccionado ? (
                        <>
                            {/* --- MODO CURSO --- */}
                            <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3.5} mb={4}>
                                <ChartBox title="Días con más faltas">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={grouped}>
                                            <CartesianGrid stroke={chartGridColor} strokeDasharray="2 6" vertical={false} />
                                            <XAxis
                                                dataKey="key"
                                                tickFormatter={formatFechaEje}
                                                tick={{ fill: chartTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: chartGridColor }}
                                                tickLine={{ stroke: chartGridColor }}
                                            />
                                            <YAxis
                                                tick={{ fill: chartTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: chartGridColor }}
                                                tickLine={{ stroke: chartGridColor }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Bar dataKey="faltas" fill={palette.bad.fill} radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartBox>

                                <ChartBox title="Días con más tardanzas">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={grouped}>
                                            <CartesianGrid stroke={chartGridColor} strokeDasharray="2 6" vertical={false} />
                                            <XAxis
                                                dataKey="key"
                                                tickFormatter={formatFechaEje}
                                                tick={{ fill: chartTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: chartGridColor }}
                                                tickLine={{ stroke: chartGridColor }}
                                            />
                                            <YAxis
                                                tick={{ fill: chartTickColor, fontSize: 12 }}
                                                axisLine={{ stroke: chartGridColor }}
                                                tickLine={{ stroke: chartGridColor }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Bar dataKey="tardanzas" fill={palette.warning.border} radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartBox>
                            </Box>

                            <ChartBox title="Distribución general de asistencias">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Presente", value: metrics.countPresentes ?? 0 },
                                                { name: "Tarde", value: metrics.countTardes ?? 0 },
                                                { name: "Aus. Just.", value: metrics.countAusJust ?? 0 },
                                                { name: "Aus. No Just.", value: metrics.countAusNoJust ?? 0 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label={pieLabelBold}
                                            dataKey="value"
                                        >
                                            <Cell fill={palette.good.fill} />
                                            <Cell fill={palette.warning.border} />
                                            <Cell fill={palette.neutral.text} />
                                            <Cell fill={palette.bad.fill} />
                                        </Pie>
                                        <Tooltip formatter={pieTooltipFormatter} contentStyle={tooltipStyle} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartBox>
                        </>
                    ) : (
                        <>
                            {/* --- MODO ALUMNO --- */}

                            <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3.5}>
                                <ChartBox title="Presentes vs Ausentes">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Presentes", value: (metrics.countPresentes ?? 0) + (metrics.countTardes ?? 0) },
                                                    { name: "Ausentes", value: (metrics.countAusJust ?? 0) + (metrics.countAusNoJust ?? 0) },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={pieLabelBold}
                                                dataKey="value"
                                            >
                                                <Cell fill={palette.good.fill} />
                                                <Cell fill={palette.bad.fill} />
                                            </Pie>
                                            <Tooltip formatter={pieTooltipFormatter} contentStyle={tooltipStyle} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartBox>

                                <ChartBox title="Presencialidad: En horario vs Tarde">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "En horario", value: metrics.countPresentes ?? 0 },
                                                    { name: "Tarde", value: metrics.countTardes ?? 0 },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={pieLabelBold}
                                            dataKey="value"
                                            >
                                                <Cell fill={palette.good.fill} />
                                                <Cell fill={palette.warning.border} />
                                            </Pie>
                                            <Tooltip formatter={pieTooltipFormatter} contentStyle={tooltipStyle} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartBox>
                            </Box>

                            <ChartBox title="Comparación con promedio del curso">
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                                    <Box
                                        sx={{
                                            p: 3,
                                            backgroundColor: palette.good.bg,
                                            borderRadius: 1,
                                            borderLeft: `4px solid ${palette.good.border}`,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: palette.good.text, mb: 0.5 }}>Tu asistencia</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: palette.good.text }}>
                                            {formatPct2(metrics.pctAsistencia)}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 3,
                                            backgroundColor: palette.neutral.bg,
                                            borderRadius: 1,
                                            borderLeft: `4px solid ${palette.neutral.border}`,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: palette.neutral.text, mb: 0.5 }}>Promedio del curso</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: palette.neutral.text }}>
                                            {formatPct2(promedios?.[0]?.promedio ?? metrics.pctAsistencia)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </ChartBox>
                        </>
                    )}

                    {/* === Ranking === */}
                    {!isAlumnoSeleccionado && ranking.length > 0 && (
                        <Box mt={3}>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                                Ranking de alumnos por % de asistencia
                            </Typography>
                            <Box
                                component="table"
                                sx={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    background: "#fff",
                                    "& th, & td": {
                                        border: "1px solid #e0e0e0",
                                        p: 1,
                                        fontSize: 13,
                                        textAlign: "center",
                                    },
                                    "& th": { backgroundColor: "#f5f7fa", fontWeight: 700 },
                                    "& td:nth-of-type(2), & th:nth-of-type(2)": { textAlign: "left" },
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Alumno</th>
                                        <th>% Asistencia</th>
                                        <th>% Tardanzas</th>
                                        <th>% Aus. Just.</th>
                                        <th>% Aus. No Just.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.map((r, i) => (
                                        <tr key={r.alumno}>
                                            <td>{i + 1}</td>
                                            <td>{r.alumno}</td>
                                            <td>{formatPct2(r.pctAsistencia)}</td>
                                            <td>{formatPct2(r.pctTardanzas)}</td>
                                            <td>{formatPct2(r.pctAusJust)}</td>
                                            <td>{formatPct2(r.pctAusNoJust)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Box>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

// === Subcomponentes ===
const MetricCard = ({ title, value, palette: tone }) => {
    const p = tone || palette.neutral;
    return (
        <Card
            sx={{
                minWidth: 150,
                flex: 1,
                borderTop: `4px solid ${p.border}`,
                backgroundColor: p.bg,
                color: p.text,
                textAlign: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
        >
            <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: p.text }}>
                    {value}
                </Typography>
                <Typography variant="body2" sx={{ color: p.text }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};


const ChartBox = ({ title, children }) => (
    <Box
        sx={{
            background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
            borderRadius: 2.5,
            p: 2.5,
            border: "1px solid #dfe4ec",
            boxShadow: "0 16px 34px rgba(15,23,42,0.08)",
        }}
    >
        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
            {title}
        </Typography>
        {children}
    </Box>
);

