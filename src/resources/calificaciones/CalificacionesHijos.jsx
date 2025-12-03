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
import HelperCard from "../../components/HelperCard"
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

        newHeaders.sort((a, b) => {
            const [dayA, monthA, yearA] = a.fecha.split("/").map(Number);
            const [dayB, monthB, yearB] = b.fecha.split("/").map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

        return newHeaders;
    }

    const getMateriasUnique = (calificaciones, anio) => {
        return [...new Set(calificaciones.filter(c => c.curso.cicloLectivo == anio).map(c => c.materia.nombre))];
    }

    return (
        <Box sx={{paddingBottom: 2}}>
            <LoaderOverlay open={loading} />
            {!loading && 
            <>
            <HelperCard
                title="Guía rápida"
                items={[
                    "Cada tarjeta corresponde a un alumno tutelado; expándela para ver sus calificaciones.",
                    "Dentro de cada año podés revisar el mejor/peor resultado y el promedio general.",
                    "Las tablas muestran todas las instancias de evaluación; son solo de lectura para tutores.",
                    "Si no aparecen calificaciones, aún no se cargaron notas para ese alumno o ciclo.",
                ]}
            />
            <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
                Calificaciones de los tutelados
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }} >
                {hijos.map(hijo => (
                    <>
                        <Typography variant="h4" sx={{ fontSize: 30 }}>
                            {`${hijo.alumno.usuario.apellido} ${hijo.alumno.usuario.nombre} - ${hijo.alumno.curso[0].anio_escolar}° ${hijo.alumno.curso[0].division}`}
                        </Typography>
                        {hijo.calificaciones.length === 0 && (
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                No se encontraron calificaciones para este alumno.
                            </Typography>
                        )}
                        {hijo.anios.map(anio => (
                                <Box key={anio}>
                                    <Divider key={anio} sx={{ mb: 2, mt:2 }}>
                                        <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                                    </Divider>
                                    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2, backgroundColor: "#F5F5F5", padding: 2, borderRadius: 2 }}>
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
                                    {getMateriasUnique(hijo.calificaciones, anio).map(materia => (
                                        <Accordion key={materia} sx={{backgroundColor: "#F5F5F5", mb: 2}}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMore />}
                                                aria-controls={`panel-${materia}-content`}
                                                id={`panel-${materia}-header`}
                                                sx={{backgroundColor: "#E8EEF7"}}
                                            >
                                                <Typography variant="h6">{materia}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                                <CustomTable 
                                                    alumnos={[{ alumno: `${hijo.alumno.usuario.apellido} ${hijo.alumno.usuario.nombre}` }]}
                                                    headers={
                                                        getTableHeaders(hijo.calificaciones.filter(c => c.curso.cicloLectivo == anio && c.materia.nombre === materia))
                                                    }
                                                    data={
                                                        hijo.calificaciones.filter(c => c.curso.cicloLectivo == anio && c.materia.nombre === materia)
                                                    }
                                                    editable={false}
                                                />
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                            </Box>
                        ))}
                    </>
                ))}
            </Box>
            </>}
        </Box>
    )
}
