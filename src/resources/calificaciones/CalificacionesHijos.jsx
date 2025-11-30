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
import { CustomTable } from "../../components/CustomTable"
import { SummaryCard } from "../../components/SummaryCard"

export const CalificacionesHijos = () => {
    const dataProvider = useDataProvider();
    const [hijos, setHijos] = useState([]);
    const [loading, setLoading] = useState(true);

    const TABLE_HEADERS = [
        {label: "Alumno"}
    ];

    useEffect(() => {
        const fetchData = async () => {
        try {
            const { data } = await dataProvider.getHijosPorTutor();

            const hijosConCalificaciones = await Promise.all(
                data.map(async (hijo) => {
                    try {
                        const { data: calificacionesData } = await dataProvider.getCalificacionesPorAlumno(hijo.id_alumno);

                        const anios = [...new Set(calificacionesData.map(c => c.curso.cicloLectivo))];

                        return {
                            alumno: hijo,
                            calificaciones: calificacionesData,
                            anios
                        };
                    } catch (error) {
                        console.error("Error fetching calificaciones for hijo:", error);
                        return { alumno: hijo, calificaciones: [], anios: [] };
                    }
                })
            );

            setHijos(hijosConCalificaciones);
        } catch (error) {
            console.error("Error fetching hijos:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
    }, [dataProvider]);

    const getMejorCalificacion = (calificaciones, anio) => {
        const notas = calificaciones
            .filter(c => c.curso.cicloLectivo == anio)
            .map(c => parseFloat(c.nota));
        return notas.length ? Math.max(...notas) : 0;
    };
    const getMateriaMejorCalificacion = (calificaciones, anio) => {
        return `Materia: ${
            calificaciones.map(c => c.curso.cicloLectivo == anio && parseFloat(c.nota) === Math.max(...calificaciones.filter(c => c.curso.cicloLectivo == anio).map(c => parseFloat(c.nota))) ? c.materia?.nombre : null).filter(Boolean).join(', ')
        }`
    }

    const getPeorCalificacion = (calificaciones, anio) => {
        const notas = calificaciones
            .filter(c => c.curso.cicloLectivo == anio)
            .map(c => parseFloat(c.nota));
        return notas.length ? Math.min(...notas) : 0;
    };

    const getMateriaPeorCalificacion = (calificaciones, anio) => {
        return `Materia: ${
            calificaciones.map(c => c.curso.cicloLectivo == anio && parseFloat(c.nota) === Math.min(...calificaciones.filter(c => c.curso.cicloLectivo == anio).map(c => parseFloat(c.nota))) ? c.materia?.nombre : null).filter(Boolean).join(', ')
        }`
    }

    const getPromedio = (calificaciones, anio) => {
        return (calificaciones.filter(c => c.curso.cicloLectivo == anio).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / calificaciones.filter(c => c.curso.cicloLectivo == anio).length).toFixed(2);
    }

    const getTableHeaders = (filteredCalificaciones) => {
        const newHeaders = [];

        filteredCalificaciones.forEach((c) => {
            if(!newHeaders.some(t => t.label === c.tipoCalificacion.descripcion && t.fecha === c.fecha)){
                newHeaders.push({ label: c.tipoCalificacion.descripcion, fecha: c.fecha, editable: !c.publicado });
            }
        })

        newHeaders.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        return newHeaders;
    }

    return (
        <Box sx={{paddingBottom: 2}}>
            <LoaderOverlay open={loading} />
            {!loading && 
            <>
            <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
                Calificaciones de los tutelados
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }} >
                {hijos.map(hijo => (
                    <Accordion sx={{backgroundColor: "#E8EEF7"}} key={hijo.alumno.id_alumno}>
                        <AccordionSummary sx={{backgroundColor: "#F5F7FA"}} expandIcon={<ExpandMore />}>
                            <Box>
                                <Typography variant="h6">
                                    {`${hijo.alumno.usuario.apellido} ${hijo.alumno.usuario.nombre}`}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Curso: {hijo?.alumno?.curso?.[0] ? `${hijo.alumno.curso[0].anio_escolar}° ${hijo.alumno.curso[0].division}` : 'Sin curso'}
                                </Typography>
                                <Typography variant="subtitle2">
                                    {hijo.alumno.tutor.parentesco}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {hijo.calificaciones.length === 0 && (
                                <Typography variant="body1">
                                    No se encontraron calificaciones para este alumno.
                                </Typography>
                            )}
                            {hijo.anios.map(anio => (
                                <Box key={anio}>
                                    <Divider key={anio} sx={{ mb: 2, mt:2 }}>
                                        <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                                    </Divider>
                                    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                        <SummaryCard 
                                            title="Mejor calificación"
                                            mainContent={getMejorCalificacion(hijo.calificaciones, anio)}
                                            secondaryContent={getMateriaMejorCalificacion(hijo.calificaciones, anio)}
                                            type="success"
                                        />
                                        <SummaryCard 
                                            title="Peor calificación"
                                            mainContent={getPeorCalificacion(hijo.calificaciones, anio)}
                                            secondaryContent={getMateriaPeorCalificacion(hijo.calificaciones, anio)}
                                            type="error"
                                        />
                                        <SummaryCard 
                                            title="Promedio"
                                            mainContent={getPromedio(hijo.calificaciones, anio)}
                                            type="info"
                                        />
                                    </Box>
                                    <CustomTable 
                                        alumnos={[{ alumno: `${hijo.alumno.usuario.apellido} ${hijo.alumno.usuario.nombre}` }]}
                                        headers={
                                            getTableHeaders(hijo.calificaciones.filter(c => c.curso.cicloLectivo == anio))
                                        }
                                        data={
                                            hijo.calificaciones.filter(c => c.curso.cicloLectivo == anio)
                                        }
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
