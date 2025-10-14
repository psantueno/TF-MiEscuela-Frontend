import { useState, useEffect } from "react"
import { useDataProvider } from "react-admin"
import { 
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails, 
    Divider,
    Chip
} from "@mui/material"
import { ExpandMore } from "@mui/icons-material"
import { LoaderOverlay } from "../../components/LoaderOverlay"
import { CustomTable } from "../../components/Table"
import { SummaryCard } from "../../components/SummaryCard"

export const CalificacionesHijos = () => {
    const dataProvider = useDataProvider();
    const [hijos, setHijos] = useState([]);
    const [anios, setAnios] = useState([]);
    const [loading, setLoading] = useState(true);

    const TABLE_HEADERS = [
        {label: "Alumno"},
        {label: "Curso"},
        {label: "Materia"},
        {label: "Calificación"},
        {label: "Fecha"},
        {label: "Docente"},
        {label: "Observaciones"}
    ];

    const TABLE_KEYS = [
        {key: "alumno"},
        {key: "curso"},
        {key: "materia"},
        {key: "calificacion"},
        {key: "fecha"},
        {key: "docente"},
        {key: "observaciones"}
    ]

    useEffect(() => {
        dataProvider.getHijosPorTutor()
            .then(({ data }) => {
                const hijosConCalificaciones = [];
                data.forEach(hijo => {
                    const hijoConCalificaciones = { alumno: hijo, calificaciones: [] };
                    dataProvider.getCalificacionesPorAlumno(hijo.id_alumno).then(({ data }) => {
                        hijoConCalificaciones.calificaciones = data;
                        const uniqueAnios = [...new Set(data.map(c => c.ciclo_lectivo))];
                        setAnios(uniqueAnios);
                    }).catch(() => []);
                    hijosConCalificaciones.push(hijoConCalificaciones);
                });
                setHijos(hijosConCalificaciones);
            })
            .catch(error => {
                console.error("Error fetching calificaciones:", error);
            })
            .finally(() => setLoading(false));
    }, [dataProvider]);

    return (
        <Box sx={{paddingBottom: 2}}>
            <LoaderOverlay open={loading} />
            {!loading && 
            <>
            <Typography variant="h4" mt={2}>
                Calificaciones de mis hijos
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }} >
                {hijos.map(hijo => (
                    <Accordion sx={{backgroundColor: "#E8EEF7"}} key={hijo.alumno.id_alumno}>
                        <AccordionSummary sx={{backgroundColor: "#F5F7FA"}} expandIcon={<ExpandMore />}>
                            <Box>
                                <Typography variant="h6">
                                    {hijo.alumno.usuario.nombre_completo}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Curso: {hijo.alumno.curso.anio_escolar}° {hijo.alumno.curso.division}
                                </Typography>
                                <Typography variant="subtitle2">
                                    {hijo.alumno.AlumnoTutor.parentesco}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {anios.map(anio => (
                                <Box key={anio}>
                                    <Divider key={anio} sx={{ mb: 2, mt:2 }}>
                                        <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                                    </Divider>
                                    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                        <SummaryCard 
                                            title="Mejor calificación"
                                            mainContent={Math.max(...hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota)), 0)}
                                            secondaryContent={`Materia: ${
                                                hijo.calificaciones.map(c => c.ciclo_lectivo == anio && parseFloat(c.nota) === Math.max(...hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota))) ? c.materia.nombre : null).filter(Boolean).join(', ')
                                            }`}
                                            type="success"
                                        />
                                        <SummaryCard 
                                            title="Peor calificación"
                                            mainContent={Math.min(...hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota)))}
                                            secondaryContent={`Materia: ${
                                                hijo.calificaciones.map(c => c.ciclo_lectivo == anio && parseFloat(c.nota) === Math.min(...hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota))) ? c.materia.nombre : null).filter(Boolean).join(', ')
                                            }`}
                                            type="error"
                                        />
                                        <SummaryCard 
                                            title="Promedio"
                                            mainContent={(hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).length).toFixed(2)}
                                            type="info"
                                        />
                                    </Box>
                                    <CustomTable 
                                        headers={TABLE_HEADERS}
                                        keys={TABLE_KEYS}
                                        dataArray={hijo.calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => {
                                            return {
                                                alumno: hijo.alumno.usuario.nombre_completo,
                                                curso: `${hijo.alumno.curso.anio_escolar}° ${hijo.alumno.curso.division}`,
                                                materia: c.materia.nombre,
                                                calificacion: c.nota,
                                                fecha: c.fecha,
                                                docente: c.docente.usuario.nombre_completo,
                                                observaciones: c.observaciones || "Ninguna"
                                            }
                                        })}
                                        editable={false}
                                    />
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
            </>}
        </Box>
    )
}