import { useEffect, useState } from "react";
import {
    useDataProvider
} from "react-admin";
import {
    Box,
    Typography,
    Grid,
    Autocomplete,
    TextField,
    Divider,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { Edit, PictureAsPdf } from "@mui/icons-material";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { 
    ExpandMore,
    Info 
} from "@mui/icons-material";
import { LoaderOverlay } from "../../components/LoaderOverlay";
import { CustomTable } from "../../components/Table";
import { SummaryCard } from "../../components/SummaryCard";
import { generarReportePDF } from "./generarReportePDF";

export const CalificacionesPorAlumno = () => {
    const dataProvider = useDataProvider();
    const [alumnos, setAlumnos] = useState([]);
    const [selectedAlumno, setSelectedAlumno] = useState("");
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState("");
    const [materias, setMaterias] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState("");
    const [calificaciones, setCalificaciones] = useState([]);
    const [anios, setAnios] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);

    const TABLE_HEADERS = [
        { label: "Materia", editable: false },
        { label: "Calificación", editable: true },
        { label: "Tipo", editable: true },
        { label: "Fecha", editable: false },
        { label: "Ciclo Lectivo", editable: false },
        { label: "Docente", editable: false },
        { label: "Observaciones", editable: true },
    ];

    const TABLE_KEYS = [
        { key: "materia", editable: false },
        { key: "nota", editable: true, type: "number", required: true },
        { key: "tipo", editable: true, required: true, type: "text" },
        { key: "fecha", editable: false, default: Date.now() },
        { key: "ciclo_lectivo", editable: false },
        { key: "docente", editable: false },
        { key: "observaciones", editable: true, type: "text", default: "Ninguna" },
    ];

    useEffect(() => {
        dataProvider.getList('cursos', { pagination: { page: 1, perPage: 100 } })
            .then(({ data }) => setCursos(data.map(c => {
                return { id: c.id_curso, name: `${c.anio_escolar}° ${c.division}` }
            })))
            .catch(error => console.error(error));

        dataProvider.getList('alumnos', { pagination: { page: 1, perPage: 100 }, filter: {} })
            .then(({ data }) => setAlumnos(data))
            .catch(error => console.error(error));

        dataProvider.getList('materias', { pagination: { page: 1, perPage: 100 } })
            .then(({ data }) => setMaterias(data))
            .catch(error => console.error(error));
    }, [dataProvider]);

    useEffect(() => {
        if (selectedCurso) {
            dataProvider.getAlumnosPorCurso(selectedCurso.id)
                .then(({ data }) => {
                    setAlumnos(data);
                    if( selectedAlumno && !data.find(a => a.id_alumno === selectedAlumno.id_alumno) ){
                        setSelectedAlumno("");
                        setSelectedMateria("");
                    }
                })
                .catch(error => console.error(error));

            dataProvider.getMateriasCurso(selectedCurso.id)
                .then(({ data }) => setMaterias(data))
                .catch(error => console.error(error));
        }else{
            dataProvider.getList('alumnos', { pagination: { page: 1, perPage: 100 }, filter: {} })
                .then(({ data }) => setAlumnos(data))
                .catch(error => console.error(error));
        }
    }, [dataProvider, selectedCurso]);

    useEffect(() => {
        setCalificaciones([]);
        if (selectedAlumno) {
            setLoading(true);

            dataProvider.getCalificacionesPorAlumno(selectedAlumno.id_alumno, selectedMateria ? { id_materia: selectedMateria.id_materia } : {})
                .then(({ data }) => setCalificaciones(data))
                .catch(setCalificaciones([]))
                .finally(() => setLoading(false));
        }

        setTitle(
            selectedAlumno && selectedCurso && selectedMateria ? `${selectedAlumno.usuario.nombre_completo} - ${selectedCurso.name} - ${selectedMateria.nombre}` :
            selectedAlumno && selectedCurso ? `${selectedAlumno.usuario.nombre_completo} - ${selectedCurso.name}` : ''
        );
    },[dataProvider, selectedAlumno, selectedMateria]);

    useEffect(() => {
        const uniqueAnios = [...new Set(calificaciones.map(c => c.ciclo_lectivo))];
        setAnios(uniqueAnios);
    }, [calificaciones]);

    const exportarPDF = async () => {
        await generarReportePDF({ type: "alumno", alumno: selectedAlumno, curso: selectedCurso, materia: selectedMateria, calificaciones: calificaciones, anios: anios });
    }

    const handleAlumnoChange = (newValue) => {
        setSelectedAlumno(newValue ? newValue : "");
        setSelectedCurso(newValue ? {
            id: newValue.curso.id_curso,
            name: `${newValue.curso.anio_escolar}° ${newValue.curso.division}`
        } : "");
    }

    const handleCursoChange = (newValue) => {
        setSelectedCurso(newValue ? newValue : "");
    }

    const getMejorCalificacion = (anio) => {
        return Math.max(...calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota)), 0);
    }

    const getMateriaMejorCalificacion = (anio) => {
        return `Materia: ${
            calificaciones.map(c => c.ciclo_lectivo == anio && parseFloat(c.nota) === getMejorCalificacion(anio) ? c.materia.nombre : null).filter(Boolean).join(', ')
        }`
    }

    const getPeorCalificacion = (anio) => {
        return Math.min(...calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => parseFloat(c.nota)));
    }

    const getMateriaPeorCalificacion = (anio) => {
        return `Materia: ${
            calificaciones.map(c => c.ciclo_lectivo == anio && parseFloat(c.nota) === getPeorCalificacion(anio) ? c.materia.nombre : null).filter(Boolean).join(', ')
        }`
    }

    const getPromedioGeneral = (anio) => {
        return (calificaciones.filter(c => c.ciclo_lectivo == anio).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / calificaciones.filter(c => c.ciclo_lectivo == anio).length).toFixed(2)
    }

    const getCountMateriasAprobadas = (anio) => {
        return calificaciones.filter(c => c.ciclo_lectivo == anio && parseFloat(c.nota) >= 6).length;
    }

    const getCountMateriasDesaprobadas = (anio) => {
        return calificaciones.filter(c => c.ciclo_lectivo == anio && parseFloat(c.nota) < 6).length;
    }

    const getPromedioMateria = (anio, materiaId) => {
        return (calificaciones.filter(c => c.ciclo_lectivo == anio && c.id_materia == materiaId).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / calificaciones.filter(c => c.ciclo_lectivo == anio && c.id_materia == materiaId).length).toFixed(2);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const formatKeys = (idMateria, anio) => {
        return TABLE_KEYS.map(key => {
            const newKey = { ...key };

            if(key.key == "materia") newKey.default = materias.find(m => m.id_materia === idMateria)?.nombre || ""
            if(key.key == "fecha") newKey.default = new Date(Date.now()).toLocaleDateString()
            if(key.key == "ciclo_lectivo") newKey.default = anio
            if(key.key == "docente") newKey.default = "Esteban Drukopf"
            return newKey;
        });
    }

    const handleSave = async (updatedRows, addedRows, deletedRows) => {
        setLoading(true);

        const mappedUpdatedRows = updatedRows.map(r => {
            return {
                id_calificacion: r.id_calificacion,
                fecha: new Date(),
                nota: r.nota,
                tipo: r.tipo,
                observaciones: r.observaciones
            };
        });

        const mappedAddedRows = addedRows.map((r) => {
            return {
                id_alumno: selectedAlumno.id_alumno,
                id_curso: selectedCurso.id,
                id_materia: materias.find(m => m.nombre === r.materia)?.id_materia || null,
                nota: r.nota,
                tipo: r.tipo,
                ciclo_lectivo: r.ciclo_lectivo,
                observaciones: r.observaciones,
                fecha: new Date()
            }
        });

        const mappedDeletedRows = deletedRows.map(r => r.id_calificacion);

        try{
            await Promise.all([
                dataProvider.updateManyCalificaciones(mappedUpdatedRows),
                dataProvider.createManyCalificaciones(mappedAddedRows),
                dataProvider.deleteManyCalificaciones(mappedDeletedRows)
            ]);

            setSuccess(true);
            setMessage("Operación realizada con éxito");
            setOpen(true);

            dataProvider.getCalificacionesPorAlumno(selectedAlumno.id_alumno, selectedMateria ? { id_materia: selectedMateria.id_materia } : {})
            .then(({ data }) => setCalificaciones(data))
            .catch(setCalificaciones([]));
        }catch(error){
            console.error("Error en la operación de calificaciones:", error);
            handleError("Error en la operación de calificaciones");
        } finally {
            setLoading(false);
        }
    }

    const handleError = (errorMessage) => {
        setSuccess(false);
        setMessage(errorMessage);
        setOpen(true);
    }

    return (
        <Box sx={{ paddingBottom: 4 }}>
            <LoaderOverlay open={loading} />
            {/* Filtros */}
            <Grid container spacing={2} alignItems="center">
                {/* Filtro de Alumnos */}
                <Grid item>
                    <Autocomplete
                        options={alumnos}
                        getOptionLabel={(option) => option.usuario.nombre_completo || ""}
                        style={{ width: 300 }}
                        value={alumnos.find(a => a.id_alumno === selectedAlumno.id_alumno) || null}
                        onChange={(event, newValue) => {
                            handleAlumnoChange(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar alumno" variant="outlined" />}
                    />
                </Grid>

                {/* Filtro de Cursos */}
                <Grid item>
                    <Autocomplete
                        options={cursos}
                        getOptionLabel={(option) => option.name || ""}
                        style={{ width: 300 }}
                        value={cursos.find(c => c.id === selectedCurso.id) || null}
                        onChange={(event, newValue) => {
                            handleCursoChange(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar curso" variant="outlined" />}
                    />
                </Grid>

                {/* Filtro de Materias */}
                <Grid item sx={{ display: selectedAlumno ? 'block' : 'none' }}>
                    <Autocomplete
                        options={materias}
                        getOptionLabel={(option) => option.nombre || ""}
                        style={{ width: 300 }}
                        value={materias.find(m => m.id_materia === selectedMateria.id_materia) || null}
                        onChange={(event, newValue) => {
                            setSelectedMateria(newValue ? newValue : "");
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar materia" variant="outlined" />}
                    />
                </Grid>

                <Grid item>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<PictureAsPdf />}
                        onClick={exportarPDF}
                        disabled={!calificaciones.length}
                        sx={{ height: 40 }}
                    >
                        Generar PDF
                    </Button>
                </Grid>
            </Grid>

            <Typography variant="h4" mt={2}>
                {title}
            </Typography>

            <Box>
                {!loading && anios.map(anio => (
                    <Box key={anio} sx={{mt: 4}}>
                        <Divider sx={{ mb: 2, mt:2 }}>
                            <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                        </Divider>
                        {!selectedMateria && (
                            <Box>
                                <Box sx={{ display: "flex", gap: 2, mt: 2}}>
                                    <SummaryCard 
                                        title="Mejor calificación"
                                        mainContent={getMejorCalificacion(anio)}
                                        secondaryContent={getMateriaMejorCalificacion(anio)}
                                        type="success"
                                    />
                                    <SummaryCard 
                                        title="Peor calificación"
                                        mainContent={getPeorCalificacion(anio)}
                                        secondaryContent={getMateriaPeorCalificacion(anio)}
                                        type="error"
                                    />
                                    <SummaryCard 
                                        title="Promedio general"
                                        mainContent={getPromedioGeneral(anio)}
                                        type="info"
                                    />
                                </Box>

                                <ChartBox title="Distribución de calificaciones aprobadas y desaprobadas">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Aprobadas (>=6)', value: getCountMateriasAprobadas(anio) },
                                                    { name: 'Desaprobadas (<6)', value: getCountMateriasDesaprobadas(anio) }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                                dataKey="value"
                                            >
                                                <Cell fill="#1E8E3E" />
                                                <Cell fill="#D93025" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartBox>

                                <Box sx={{mt: 2, display: "flex", flexDirection: "column", gap: 2}}>
                                    {materias.map(m => (
                                        <Accordion key={m.id_materia}>
                                            <AccordionSummary sx={{backgroundColor: "#E8EEF7"}} expandIcon={<ExpandMore />}>
                                                <Typography variant="h6">{m.nombre}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                                <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                                    <SummaryCard 
                                                        title="Promedio"
                                                        mainContent={getPromedioMateria(anio, m.id_materia)}
                                                        type="info"
                                                    />
                                                </Box>
                                                <HelpMessage />
                                                <CustomTable 
                                                    headers={TABLE_HEADERS}
                                                    dataArray={calificaciones.filter(c => c.ciclo_lectivo == anio && c.id_materia == m.id_materia).map(c => {
                                                        return {
                                                            id_calificacion: c.id_calificacion,
                                                            nota: c.nota,
                                                            fecha: new Date(c.fecha).toLocaleDateString(),
                                                            ciclo_lectivo: c.ciclo_lectivo,
                                                            materia: c.materia.nombre,
                                                            docente: c.docente.usuario.nombre_completo,
                                                            observaciones: c.observaciones || "Ninguna",
                                                            tipo: c.tipo || "Exámen"
                                                        }
                                                    })}
                                                    keys={formatKeys(m.id_materia, anio)}
                                                    onSave={handleSave}
                                                    onError={handleError}
                                                />
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        {selectedMateria && !loading &&(
                            <Box sx={{backgroundColor: "#F2F6FB", p: 2, borderRadius: 1}}>
                                <Box sx={{mb: 2}}>
                                    <SummaryCard 
                                        title="Promedio"
                                        mainContent={getPromedioMateria(anio, selectedMateria.id)}
                                        type="info"
                                    />
                                </Box>
                                <HelpMessage />
                                <CustomTable 
                                    headers={TABLE_HEADERS}
                                    dataArray={calificaciones.filter(c => c.ciclo_lectivo == anio).map(c => {
                                        return {
                                            id_calificacion: c.id_calificacion,
                                            nota: c.nota,
                                            fecha: new Date(c.fecha).toLocaleDateString(),
                                            ciclo_lectivo: c.ciclo_lectivo,
                                            materia: selectedMateria.nombre,
                                            docente: c.docente.usuario.nombre_completo,
                                            observaciones: c.observaciones || "Ninguna",
                                            tipo: c.tipo || "Exámen"
                                        }
                                    })}
                                    keys={formatKeys(selectedMateria.id_materia, anio)}
                                    onSave={handleSave}
                                    onError={handleError}
                                />
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={3000} // se oculta después de 3 segundos
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // abajo centrado
            >
                <Alert
                    onClose={handleClose}
                    severity={success ? "success" : "error"}
                    sx={{ width: "100%" }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

const ChartBox = ({ title, children }) => (
    <Box
        sx={{
            background: "#fff",
            borderRadius: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
            mt: 2
        }}
    >
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
            {title}
        </Typography>
        {children}
    </Box>
);

const HelpMessage = () => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#BBDEFB", // color de fondo suave
            padding: "8px 12px",
            borderRadius: "8px",
            mb: 2,
            gap: 1,
        }}
    >
        <Info color="primary" />
        <Typography variant="body2" color="textPrimary">
            {"Haga doble click en las celdas bajo el icono"} <Edit sx={{fontSize: "14px"}}></Edit> {"para editar su contenido. Para guardar, presione Enter o haga click fuera de la celda."}
        </Typography>
    </Box>
)