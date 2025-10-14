import { useEffect, useState } from "react";
import {
    useDataProvider
} from "react-admin";
import {
    Box, 
    Typography,
    Grid,
    Divider,
    Chip,
    Autocomplete,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";
import { 
    Clear,
    ExpandMore,
    PictureAsPdf,
    Info,
    Edit
} from "@mui/icons-material";
import { SummaryCard } from "../../components/SummaryCard";
import { CustomTable } from "../../components/Table";
import { LoaderOverlay } from "../../components/LoaderOverlay";
import { generarReportePDF } from "./generarReportePDF";

export const CalificacionesPorCurso = () => {
    const dataProvider = useDataProvider();

    const [curso, setCurso] = useState("");
    const [cursos, setCursos] = useState([]);
    const [selectableCursos, setSelectableCursos] = useState([]);
    const [materia, setMateria] = useState("");
    const [materias, setMaterias] = useState([]);
    const [selectableMaterias, setSelectableMaterias] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [title, setTitle] = useState("");
    const [anios, setAnios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);

    const TABLE_HEADERS = [
        { label: "Alumno", editable: false },
        { label: "Materia", editable: false },
        { label: "Calificación", editable: true },
        { label: "Tipo", editable: true },
        { label: "Fecha", editable: false },
        { label: "Ciclo Lectivo", editable: false },
        { label: "Curso", editable: false },
        { label: "Docente", editable: false },
        { label: "Observaciones", editable: true },
    ];
    const TABLE_KEYS = [
        { key: "alumno", editable: true, default: "", type: "select", options: [] },
        { key: "materia", editable: false, default: "" }, 
        { key: "calificacion", editable: true, type: "number", required: true }, 
        { key: "tipo", editable: true, required: true, type: "text" }, 
        { key: "fecha", editable: false, default: new Date(Date.now()).toLocaleDateString() }, 
        { key: "ciclo_lectivo", editable: false, default: "" },
        { key: "curso", editable: false, default: "" },
        { key: "docente", editable: false, default: "Esteban Drukopf" }, 
        { key: "observaciones", editable: true, type: "text", default: "Ninguna" },
    ];

    useEffect(() => {
        dataProvider
            .getList("cursos", {
                pagination: { page: 1, perPage: 100 },
                sort: { field: "anio_escolar", order: "ASC" },
                filter: {},
            })
            .then(({ data }) =>{
                    setCursos(
                        data.map((c) => ({
                            id_curso: c.id_curso,
                            name: `${c.anio_escolar}° ${c.division}`,
                        })));
                    setSelectableCursos(data.map((c) => ({
                        id_curso: c.id_curso,
                        name: `${c.anio_escolar}° ${c.division}`,
                    })));
            })
            .catch(() => setCursos([]));

            dataProvider
                .getList("materias", {
                    pagination: { page: 1, perPage: 100 },
                    sort: {},
                    filter: {},
                })
                .then(({ data }) =>{
                    setMaterias(data)
                    setSelectableMaterias(data);
                })
                .catch(() => setMaterias([]));
    }, [dataProvider]);

    useEffect(() => {
        setLoading(true);
        setAlumnos([]);

        if(!curso && !materia){
            setCalificaciones([]);
            setTitle("");
            setSelectableCursos(cursos);
            setSelectableMaterias(materias);
            setLoading(false);
            return;
        }

        if(curso && !materia){
            setSelectableCursos(cursos);
            setCurso(() => cursos.find(c => c.id_curso === curso.id_curso) || "");

            dataProvider
                .getMateriasCurso(curso.id_curso)
                .then(({ data }) => {
                    setSelectableMaterias(data);
                    setMateria("");
                })
                .catch(() => setSelectableMaterias(materias));

            dataProvider.getAlumnosPorCurso(curso.id_curso)
                .then(({ data }) => {
                    setAlumnos(data);
                })
                .catch(error => console.error(error));
        }

        if(materia && !curso){
            setSelectableMaterias(materias);
            setMateria(() => materias.find(m => m.id_materia === materia.id_materia) || "");

            dataProvider
                .getCursosMateria(materia.id_materia)
                .then(({ data }) => {
                    setSelectableCursos(data.map(c => ({
                        id_curso: c.id_curso,
                        name: `${c.anio_escolar}° ${c.division}`,
                    })));
                    setCurso("");
                    setAlumnos(data.map(c => ({
                        id_curso: c.id_curso,
                        alumnos: c.alumnos.map(a => ({
                            id_alumno: a.id_alumno,
                            usuario: a.usuario,
                        }))
                    })));
                })
                .catch(() => setSelectableCursos(cursos));
        }

        if(curso && materia){
            setSelectableCursos([curso]);
            setSelectableMaterias([materia]);
            dataProvider.getAlumnosPorCurso(curso.id_curso)
                .then(({ data }) => {
                    setAlumnos(data);
                })
                .catch(error => console.error(error));
        }

        dataProvider
            .getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: { id_curso: curso.id_curso ?? "", id_materia: materia.id_materia ?? ""},
            })
            .then(({ data }) => setCalificaciones(data))
            .catch(() => setCalificaciones([]))
            .finally(() => setLoading(false));

        setTitle(
            curso && materia ? `${curso.name} - ${materia.nombre}` :
            curso ? `${curso.name}` : 
            materia ? `${materia.nombre}` : ""
        );

    }, [dataProvider, curso, materia]);

    useEffect(() => {
        const uniqueAnios = [...new Set(calificaciones.map(c => c.ciclo_lectivo))];
        setAnios(uniqueAnios);
    }, [calificaciones]);

    const handleClearFilters = () => {
        setCurso("");
        setMateria("");
        setCalificaciones([]);
        setTitle("");
    }

    const getPorcentajeAprobadas = (anio, materia = null, curso = null) => {
        return (calificaciones.filter(c => c.ciclo_lectivo === anio && c.nota >= 6 && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length / calificaciones.filter(c => c.ciclo_lectivo === anio && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length * 100).toFixed(2);
    }

    const getTotalAprobadas = (anio, materia = null, curso = null) => {
        return `Total: ${calificaciones.filter(c => c.ciclo_lectivo === anio && c.nota >= 6 && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length}`;
    }

    const getPorcentajeReprobadas = (anio, materia = null, curso = null) => {
        return (calificaciones.filter(c => c.ciclo_lectivo === anio && c.nota < 6 && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length / calificaciones.filter(c => c.ciclo_lectivo === anio && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length * 100).toFixed(2);
    }

    const getTotalReprobadas = (anio, materia = null, curso = null) => {
        return `Total: ${calificaciones.filter(c => c.ciclo_lectivo === anio && c.nota < 6 && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length}`;
    }

    const getPromedioGeneral = (anio, materia = null, curso = null) => {
        return (calificaciones.filter(c => c.ciclo_lectivo === anio && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / calificaciones.filter(c => c.ciclo_lectivo === anio && (materia ? c.id_materia === materia.id_materia : true) && (curso ? c.id_curso === curso.id_curso : true)).length).toFixed(2)
    }

    const exportarPDF = async () => {
        await generarReportePDF({ type: "curso", curso: curso, materia: materia, calificaciones: calificaciones, anios: anios });
    }

    const formatKeys = (anio, idMateria = null, idCurso = null) => {
        
        return TABLE_KEYS.map(key => {
            const newKey = { ...key };
            if(key.key == "alumno" && curso && !materia) newKey.options = alumnos.map(a => ({ id: a.id, label: a.usuario.nombre_completo }));
            if(key.key == "alumno" && materia && !curso) newKey.options = alumnos.find(a => a.id_curso === idCurso)?.alumnos.map(al => ({ id: al.id_alumno, label: al.usuario.nombre_completo })) || [];
            if(key.key == "alumno" && curso && materia) newKey.options = alumnos.map(a => ({ id: a.id_alumno, label: a.usuario?.nombre_completo })) || [];
            if(key.key == "materia") newKey.default = materias.find(m => m.id_materia === idMateria)?.nombre || ""
            if(key.key == "ciclo_lectivo") newKey.default = anio;
            if(key.key == "docente") newKey.default = "Esteban Drukopf"
            if(key.key == "curso") newKey.default = idCurso ? `${cursos.find(c => c.id_curso === idCurso).name}` : "";

            return newKey;
        });
    }

    const handleSave = async (updatedRows, addedRows, deletedRows) => {
        setLoading(true);

        const mappedRows = updatedRows.map(r => {
            return {
                id_calificacion: r.id_calificacion,
                fecha: Date.now(),
                nota: r.calificacion,
                tipo: r.tipo,
                observaciones: r.observaciones
            };
        });

        const mappedAddedRows = addedRows.map(r => {
            return{
                id_alumno: r.alumno,
                id_materia: materias.find(m => m.nombre === r.materia)?.id_materia || null,
                id_curso: cursos.find(c => c.name === r.curso)?.id_curso || null,
                nota: r.calificacion,
                tipo: r.tipo,
                fecha: new Date(),
                ciclo_lectivo: r.ciclo_lectivo,
                observaciones: r.observaciones
            }
        });

        const mappedDeletedRows = deletedRows.map(r => r.id_calificacion);

        try{
            await Promise.all([
                dataProvider.updateManyCalificaciones(mappedRows),
                dataProvider.createManyCalificaciones(mappedAddedRows),
                dataProvider.deleteManyCalificaciones(mappedDeletedRows)
            ]);

            setSuccess(true);
            setMessage("Cambios guardados correctamente");
            setOpen(true);

            const { data } = await dataProvider.getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: { id_curso: curso.id_curso ?? "", id_materia: materia.id_materia ?? "" },
            });
            setCalificaciones(data);
        }catch(error){
            console.error("Error en la operación de calificaciones:", error);
            handleError("Error en la operación de calificaciones");
        }finally{
            setLoading(false);
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleError = (errorMessage) => {
        setSuccess(false);
        setMessage(errorMessage);
        setOpen(true);
    }

    return (
        <Box sx={{paddingBottom: 2}}>
            <LoaderOverlay open={loading} />
            <Grid container spacing={2} alignItems="center">
                {/* Selección de curso */}
                <Grid item>
                    <Autocomplete
                        options={selectableCursos}
                        getOptionLabel={(option) => option.name || ""}
                        style={{ width: 300 }}
                        value={selectableCursos.find(c => c.id_curso === curso.id_curso) || null}
                        onChange={(event, newValue) => {
                            setCurso(newValue ? newValue : "");
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar curso" variant="outlined" />}
                    />
                </Grid>

                {/* Selección de materia */}
                <Grid item>
                    <Autocomplete
                        options={selectableMaterias}
                        getOptionLabel={(option) => option.nombre || ""}
                        style={{ width: 300 }}
                        value={selectableMaterias.find(m => m.id_materia === materia.id_materia) || null}
                        onChange={(event, newValue) => {
                            setMateria(newValue ? newValue : "");
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar materia" variant="outlined" />}
                    />
                </Grid>

                {/* Botón para limpiar filtros */}
                <Grid item>
                    <Button variant="outlined" onClick={handleClearFilters} startIcon={<Clear />}>
                        Limpiar Filtros
                    </Button>
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
            
            {/* Mostrar calificaciones */}
            <Typography variant="h4" mt={2}>
                {title}
            </Typography>
            <Box>
                {!loading && anios.map(anio => (
                    <Box key={anio} mb={4}>
                        <Divider>
                            <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                        </Divider>
                        {curso && materia && alumnos.length > 0 && (
                            <Box sx={{backgroundColor: "#F2F6FB", p: 2, borderRadius: 1, mt: 2}}>
                                <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                    <SummaryCard
                                        title="% Notas >= 6"
                                        mainContent={getPorcentajeAprobadas(anio)}
                                        secondaryContent={getTotalAprobadas(anio)}
                                        type="success"
                                    />
                                    <SummaryCard
                                        title="% Notas < 6"
                                        mainContent={getPorcentajeReprobadas(anio)}
                                        secondaryContent={getTotalReprobadas(anio)}
                                        type="error"
                                    />
                                    <SummaryCard
                                        title="Promedio general"
                                        mainContent={getPromedioGeneral(anio)}
                                        type="info"
                                    />
                                </Box>
                                <HelpMessage />
                                <CustomTable 
                                    headers={TABLE_HEADERS} 
                                    dataArray={calificaciones.filter(c => c.ciclo_lectivo === anio).map(c => {
                                        return {
                                            id_calificacion: c.id_calificacion,
                                            alumno: c.alumno.usuario.nombre_completo,
                                            materia: c.materia.nombre,
                                            calificacion: c.nota,
                                            tipo: c.tipo,
                                            fecha: new Date(c.fecha).toLocaleDateString(),
                                            ciclo_lectivo: c.ciclo_lectivo,
                                            curso: `${c.curso.anio_escolar}° ${c.curso.division}`,
                                            docente: c.docente.usuario.nombre_completo,
                                            observaciones: c.observaciones || "Ninguna"
                                        }
                                    })} 
                                    keys={formatKeys(anio, materia.id_materia, curso.id_curso)}
                                    onSave={handleSave}
                                    onError={handleError}
                                />
                            </Box>
                        )}
                        {curso && !materia && alumnos.length > 0 && (
                            <>
                                {selectableMaterias.map(m => (
                                    <Accordion key={m.id} sx={{ mt: 2 }}>
                                        <AccordionSummary sx={{backgroundColor: "#E8EEF7"}} expandIcon={<ExpandMore />}>
                                            <Typography variant="h6">{m.nombre}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                                <SummaryCard 
                                                    title="% Notas >= 6" 
                                                    mainContent={(getPorcentajeAprobadas(anio, m))}
                                                    secondaryContent={getTotalAprobadas(anio, m)} 
                                                    type="success" 
                                                />
                                                <SummaryCard
                                                    title="% Notas < 6"
                                                    mainContent={(getPorcentajeReprobadas(anio, m))}
                                                    secondaryContent={getTotalReprobadas(anio, m)}
                                                    type="error"
                                                />
                                                <SummaryCard
                                                    title="Promedio general"
                                                    mainContent={(getPromedioGeneral(anio, m))}
                                                    type="info"
                                                />
                                            </Box>
                                            <HelpMessage />
                                            <CustomTable 
                                                headers={TABLE_HEADERS}
                                                dataArray={calificaciones
                                                    .filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia)
                                                    .map(c => ({
                                                        id_calificacion: c.id_calificacion,
                                                        alumno: c.alumno.usuario.nombre_completo,
                                                        materia: m.nombre,
                                                        calificacion: c.nota,
                                                        tipo: c.tipo,
                                                        fecha: new Date(c.fecha).toLocaleDateString(),
                                                        ciclo_lectivo: c.ciclo_lectivo,
                                                        curso: `${c.curso.anio_escolar}° ${c.curso.division}`,
                                                        docente: c.docente.usuario.nombre_completo,
                                                        observaciones: c.observaciones || "Ninguna"
                                                    }))}
                                                keys={formatKeys(anio, m.id_materia, curso.id_curso)}
                                                onSave={handleSave}
                                                onError={handleError}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </>
                        )}
                        {materia && !curso && alumnos.length > 0 && (
                            <>
                                {selectableCursos.map(c => (
                                    <Accordion key={c.id_curso} sx={{ mt: 2 }}>
                                        <AccordionSummary sx={{backgroundColor: "#E8EEF7"}} expandIcon={<ExpandMore />}>
                                            <Typography variant="h6">{c.name}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
                                                <SummaryCard
                                                    title="% Notas >= 6"
                                                    mainContent={(getPorcentajeAprobadas(anio, null, c))}
                                                    secondaryContent={getTotalAprobadas(anio, null, c)}
                                                    type="success"
                                                />
                                                <SummaryCard
                                                    title="% Notas < 6"
                                                    mainContent={(getPorcentajeReprobadas(anio, null, c))}
                                                    secondaryContent={getTotalReprobadas(anio, null, c)}
                                                    type="error"
                                                />
                                                <SummaryCard
                                                    title="Promedio general"
                                                    mainContent={(getPromedioGeneral(anio, null, c))}
                                                    type="info"
                                                />
                                            </Box>
                                            <HelpMessage />
                                            <CustomTable 
                                                headers={TABLE_HEADERS}
                                                dataArray={calificaciones
                                                    .filter(ca => ca.ciclo_lectivo === anio && ca.id_curso === c.id_curso)
                                                    .map(c => ({
                                                        id_calificacion: c.id_calificacion,
                                                        alumno: c.alumno.usuario.nombre_completo,
                                                        materia: materias.find(m => m.id_materia === c.id_materia)?.nombre || "",
                                                        calificacion: c.nota,
                                                        tipo: c.tipo,
                                                        fecha: new Date(c.fecha).toLocaleDateString(),
                                                        ciclo_lectivo: c.ciclo_lectivo,
                                                        curso: `${c.curso.anio_escolar}° ${c.curso.division}`,
                                                        docente: c.docente.usuario.nombre_completo,
                                                        observaciones: c.observaciones || "Ninguna"
                                                    }))}
                                                keys={formatKeys(anio, materia.id_materia, c.id_curso)}
                                                onSave={handleSave}
                                                handleError={handleError}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </>
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