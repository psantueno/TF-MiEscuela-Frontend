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
    CircularProgress,
} from "@mui/material";
import { 
    Search,
    ExpandMore,
    PictureAsPdf,
    SearchOff
} from "@mui/icons-material";
import { SummaryCard } from "../../components/SummaryCard";
import { CustomTable } from "../../components/CustomTable";
import { LoaderOverlay } from "../../components/LoaderOverlay";
import { generarReportePDF } from "./generarReportePDF";
import useUser from "../../contexts/UserContext/useUser";

export const Calificaciones = () => {
    const dataProvider = useDataProvider();

    const [cursos, setCursos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [selectableMaterias, setSelectableMaterias] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [tiposCalificaciones, setTiposCalificaciones] = useState([]);
    const [filterValues, setFilterValues] = useState(
        {
            curso: "",
            materia: "",
            alumno: "",
        }
    );
    const [calificaciones, setCalificaciones] = useState([]);
    const [calificacionesValues, setCalificacionesValues] = useState({
        id_curso: "",
        id_materia: "",
        id_alumno: "",
    });

    const [uniqueAnios, setUniqueAnios] = useState([]);
    const [uniqueTipos, setUniqueTipos] = useState([]);
    const [uniqueAlumnos, setUniqueAlumnos] = useState([]);

    const [title, setTitle] = useState("");
    const [displayWithAccordion, setDisplayWithAccordion] = useState(true);
    const [showEmptyAlumnosMessage, setShowEmptyAlumnosMessage] = useState(false);
    const [showEmptyMateriasMessage, setShowEmptyMateriasMessage] = useState(false);
    const [showEmptyCalificacionesMessage, setShowEmptyCalificacionesMessage] = useState(false);
    const [disabledSearchButton, setDisabledSearchButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);

    const CURRENT_YEAR = new Date().getFullYear().toString();

    const { user } = useUser();
    const EDIT_PERMISSION = user.rol === "docente" || user.rol === "admin";

    const TABLE_HEADERS = [
        { label: "Alumno", editable: false },
    ];

    useEffect(() => {
        dataProvider
            .getCursosPorRol()
            .then(({ data }) =>{
                    setCursos(
                        data.map((c) => ({
                            id_curso: c.id_curso,
                            name: `${c.anio_escolar}° ${c.division}`,
                        })));
            })
            .catch(() => setCursos([]))
            .finally(() => setLoading(false));

        if(EDIT_PERMISSION){
            dataProvider
            .getTiposCalificaciones()
            .then(({ data }) => {
                setTiposCalificaciones(data);
            }).catch(() => {
                setTiposCalificaciones([]);
            });
        }
    }, [dataProvider]);

    useEffect(() => {
        if(!filterValues.curso){
            setDisabledSearchButton(true);
            return;
        }

        dataProvider
            .getMateriasCurso(filterValues.curso.id_curso)
            .then(({ data }) => setMaterias(data))
            .catch(() => setMaterias([]))
            .finally(() => setLoading(false));

        dataProvider
            .getAlumnosPorCurso(filterValues.curso.id_curso)
            .then(({ data }) => setAlumnos(data))
            .catch(() => setAlumnos([]))
            .finally(() => setLoading(false));
    }, [dataProvider, filterValues.curso]);

    useEffect(() => {
        if(!filterValues.curso) return;

        setShowEmptyAlumnosMessage(false);
        setShowEmptyMateriasMessage(false);

        if(alumnos.length === 0 && calificaciones.length !== 0){
            setShowEmptyAlumnosMessage(true);
            setDisabledSearchButton(true);
            return;
        }

        if(materias.length === 0 && calificaciones.length !== 0){
            setShowEmptyMateriasMessage(true);
            setDisabledSearchButton(true);
            return;
        }

        setDisabledSearchButton(false);
    }, [alumnos, materias]);

    useEffect(() => {
        const uniqueAnios = [...new Set(calificaciones.map(c => c.ciclo_lectivo))];
        setUniqueAnios(uniqueAnios);

        const uniqueTipos = [...new Set(calificaciones.map(c => c.tipo))];
        setUniqueTipos(uniqueTipos);

        const uniqueAlumnos = [...new Set(calificaciones.map(c => c.alumno))].map(alumno => {
            return {
                alumno: alumno,
                editable: calificaciones.some(cal => cal.alumno === alumno && cal.ciclo_lectivo === CURRENT_YEAR && cal.publicado === false)
            }
        });
        setUniqueAlumnos(uniqueAlumnos);

        let title = filterValues.curso.name;
        if(filterValues.alumno) title += ` - ${filterValues.alumno.usuario.apellido} ${filterValues.alumno.usuario.nombre}`;
        if(filterValues.materia) title += ` - ${filterValues.materia.nombre}`;
        setTitle(title);

        if(EDIT_PERMISSION){
            dataProvider
            .getTiposCalificaciones()
            .then(({ data }) => {
                setTiposCalificaciones(data);
            }).catch(() => {
                setTiposCalificaciones([]);
            });
        }
    }, [calificaciones]);

    const handleSearch = async () => {
        setLoading(true);
        setSelectableMaterias(materias);
        setCalificacionesValues(
            {
                id_curso: filterValues.curso.id_curso ?? "",
                id_materia: filterValues.materia.id_materia ?? "",
                id_alumno: filterValues.alumno.id ?? "",
            }
        );

        dataProvider
            .getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: { id_curso: filterValues.curso.id_curso ?? "", id_materia: filterValues.materia.id_materia ?? "", id_alumno: filterValues.alumno.id ?? "" },
            })
            .then(({ data }) => {
                const mappedData = data.map((c) => {
                    return {
                        ciclo_lectivo: c.materiaCurso.curso.cicloLectivo.anio,
                        id_materia: c.materiaCurso.id_materia,
                        materia: c.materiaCurso.materia.nombre,
                        alumno: `${c.alumno.usuario.apellido} ${c.alumno.usuario.nombre}`,
                        nota: c.nota,
                        tipo: c.tipoCalificacion.descripcion,
                        id: c.id_calificacion,
                        publicado: c.publicado,
                        id_alumno: c.alumno.id_alumno,
                        id_curso: filterValues.curso.id_curso,
                    }
                });
                setCalificaciones(mappedData);

                if(mappedData.length === 0) setShowEmptyCalificacionesMessage(true);
                else setShowEmptyCalificacionesMessage(false);
            })
            .catch(() => {
                setCalificaciones([]);
                setShowEmptyCalificacionesMessage(true);
            })
            .finally(() => setLoading(false));

        if(filterValues.materia) setDisplayWithAccordion(false);
        else setDisplayWithAccordion(true);
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
        const type = filterValues.alumno ? "alumno" : "curso";
        await generarReportePDF({ type, curso: filterValues.curso, materia: filterValues.materia, calificaciones: calificaciones, alumno: filterValues.alumno });
    }

    const getDefaultValues = (idMateria) => {
        const defaultValues = {};
        defaultValues["id_curso"] = calificacionesValues.id_curso;
        defaultValues["id_materia"] = calificacionesValues.id_materia || idMateria;
        defaultValues["id_alumno"] = calificacionesValues.id_alumno;
        defaultValues["alumnos"] = alumnos.map(a => ({
            id_alumno: a.id_alumno,
            alumno: `${a.usuario.apellido} ${a.usuario.nombre}`,
        }));

        return defaultValues;
    }
    
    const getOptions = (filteredCalificaciones) => {
        const options = {};
        options["alumnos"] = getAlumnosOptions(filteredCalificaciones);
        options["tiposCalificaciones"] = tiposCalificaciones.map(t => ({ id: t.id_tipo_calificacion, label: t.descripcion }));
        options["current_alumnos"] = alumnos.map(a => ({
            id: a.id_alumno,
            label: `${a.usuario.apellido} ${a.usuario.nombre}`,
        }));
        return options;
    }

    const getHeaders = (filteredCalificaciones) => {
        const newHeaders = [...TABLE_HEADERS];

        const tiposCalificaciones = [...new Set(filteredCalificaciones.map(c => c.tipo))];

        tiposCalificaciones.forEach(tipo => {
            newHeaders.push({ label: tipo, editable: true });
        });

        return newHeaders;
    }

    const getKeys = (filteredCalificaciones) => {
        const tiposCalificaciones = [...new Set(filteredCalificaciones.map(c => c.tipo))];
        const mappedTipos = tiposCalificaciones.map(tipo => ({ label: tipo, publicado: filteredCalificaciones.some(c => c.tipo === tipo && c.ciclo_lectivo === CURRENT_YEAR && c.publicado === true) }));
        return mappedTipos;
    }

    const getAlumnos = (filteredCalificaciones) => {
        const alumnosSet = new Set();
        if(filteredCalificaciones.length === 0){
            if(filterValues.alumno){
                alumnosSet.add({ alumno: `${filterValues.alumno.usuario.apellido} ${filterValues.alumno.usuario.nombre}`, editable: true });
            }else{
                alumnos.forEach(a => {
                    alumnosSet.add({ alumno: `${a.usuario.apellido} ${a.usuario.nombre}`, editable: true });
                });
            }
        }else{
            const uniqueAlumnosInCalificaciones = [...new Set(filteredCalificaciones.map(c => c.alumno))];
            uniqueAlumnosInCalificaciones.forEach(alumno => {
                alumnosSet.add({ 
                    alumno, 
                    editable: filteredCalificaciones.some(c => c.alumno === alumno && c.ciclo_lectivo === CURRENT_YEAR && c.publicado === false && alumnos.some(al => `${al.usuario.apellido} ${al.usuario.nombre}` === alumno)),
                    creatable: alumnos.some(al => `${al.usuario.apellido} ${al.usuario.nombre}` === alumno)
                });
            });
        }
        return [...alumnosSet];
    }

    const getAlumnosOptions = (filteredCalificaciones) => {
        if(filteredCalificaciones.length === 0) return [];
        if(filterValues.alumno) return [];
        const filteredAlumnos = alumnos.filter(a => {
            const nombreCompleto = `${a.usuario.apellido} ${a.usuario.nombre}`;
            return !filteredCalificaciones.some(c => c.alumno === nombreCompleto);
        });
        const mappedAlumnos = filteredAlumnos.map(a => ({
            id: a.id_alumno,
            label: `${a.usuario.apellido} ${a.usuario.nombre}`,
        }));
        
        return mappedAlumnos;
    }

    const mapCalificaciones = (filteredCalificaciones) => {
        const mapped = {};

        if(filteredCalificaciones.length === 0) return mapped;

        uniqueAlumnos.forEach((alumno) => {
            mapped[alumno.alumno] = {};
            uniqueTipos.forEach((tipo) => {
                const calificacion = filteredCalificaciones.find(c => c.alumno === alumno.alumno && c.tipo === tipo);
                mapped[alumno.alumno][tipo] = {};
                mapped[alumno.alumno][tipo]['nota'] = calificacion ? calificacion.nota : "";
                mapped[alumno.alumno][tipo]['id'] = calificacion ? calificacion.id : "";
                mapped[alumno.alumno][tipo]['publicado'] = calificacion ? calificacion.publicado : false;
                mapped[alumno.alumno].id_alumno = calificacion ? calificacion.id_alumno : "";
                mapped[alumno.alumno].id_curso = calificacion ? calificacion.id_curso : "";
                mapped[alumno.alumno].id_materia = calificacion ? calificacion.id_materia : "";
            });
        });
        return mapped;
    }

    const handleSave = async (updatedRows, addedRows) => {
        setLoading(true);

        console.log("Updated Rows:", updatedRows);
        console.log("Added Rows:", addedRows);

        const updatedRowsKeys = Object.keys(updatedRows);

        const mappedUpdatedRows = [];
        updatedRowsKeys.forEach(alumnoKey => {
            const row = {};
            const calificaciones = Object.keys(updatedRows[alumnoKey]);
            
            calificaciones.forEach(tipoKey => {
                if(tipoKey !== "id_alumno" && tipoKey !== "id_curso" && tipoKey !== "id_materia"){
                    const tipoCalificacion = tiposCalificaciones.find(t => t.descripcion === tipoKey);
                    row["id_alumno"] = updatedRows[alumnoKey].id_alumno;
                    row["id_curso"] = updatedRows[alumnoKey].id_curso;
                    row["id_materia"] = updatedRows[alumnoKey].id_materia;
                    row["id_tipo_calificacion"] = tipoCalificacion ? tipoCalificacion.id_tipo_calificacion : null;
                    row["nota"] = updatedRows[alumnoKey][tipoKey].nota;
                    row["id_calificacion"] = updatedRows[alumnoKey][tipoKey].id || null;
                }
            });
            mappedUpdatedRows.push(row);
        });

        const mappedAddedRows = [];
        const addedRowsKeys = Object.keys(addedRows);
        addedRowsKeys.forEach(alumnoKey => {
            const calificaciones = Object.keys(addedRows[alumnoKey]);
            for(const tipoKey of calificaciones){
                if(tipoKey !== "id_alumno" && tipoKey !== "id_curso" && tipoKey !== "id_materia"){
                    const tipoCalificacion = tiposCalificaciones.find(t => t.descripcion === tipoKey);
                    if(tipoCalificacion === undefined || addedRows[alumnoKey][tipoKey].nota === ""){
                        continue;
                    }
                    const row = {};
                    row["id_alumno"] = addedRows[alumnoKey].id_alumno;
                    row["id_curso"] = addedRows[alumnoKey].id_curso;
                    row["id_materia"] = addedRows[alumnoKey].id_materia;
                    row["id_tipo_calificacion"] = tipoCalificacion ? tipoCalificacion.id_tipo_calificacion : null;
                    row["nota"] = addedRows[alumnoKey][tipoKey].nota;
                    mappedAddedRows.push(row);
                }
            }
        });

        console.log("Mapped Updated Rows:", mappedUpdatedRows);
        console.log("Mapped Added Rows:", mappedAddedRows);

        try{

            if(mappedUpdatedRows.length > 0) await dataProvider.updateManyCalificaciones(mappedUpdatedRows);
            if(mappedAddedRows.length > 0) await dataProvider.createManyCalificaciones(mappedAddedRows);

            setSuccess(true);
            setMessage("Cambios guardados correctamente");
            setOpen(true);

            const filter = { id_curso: filterValues.curso.id_curso };
            if(filterValues.materia) filter.id_materia = filterValues.materia.id_materia;
            if(filterValues.alumno) filter.id_alumno = filterValues.alumno.id_alumno;

            const { data } = await dataProvider.getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: filter,
            });
            const mappedData = data.map((c) => {
                return {
                    ciclo_lectivo: c.materiaCurso.curso.cicloLectivo.anio,
                    id_materia: c.materiaCurso.id_materia,
                    materia: c.materiaCurso.materia.nombre,
                    alumno: `${c.alumno.usuario.apellido} ${c.alumno.usuario.nombre}`,
                    nota: c.nota,
                    tipo: c.tipoCalificacion.descripcion,
                    id: c.id_calificacion,
                    publicado: c.publicado,
                    id_alumno: c.alumno.id_alumno,
                    id_curso: filterValues.curso.id_curso,
                };
            });
            setCalificaciones(mappedData);
            if(mappedData.length === 0) setShowEmptyCalificacionesMessage(true);
            else setShowEmptyCalificacionesMessage(false);
        }catch(error){
            console.error("Error en la operación de calificaciones:", error);
            handleError("Error en la operación de calificaciones");
        }finally{
            setLoading(false);
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
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
                        options={cursos}
                        getOptionLabel={(option) => option.name || ""}
                        style={{ width: 300 }}
                        value={cursos.find(c => c.id_curso === filterValues.curso.id_curso) || null}
                        onChange={(event, newValue) => {
                            setFilterValues((prev) => ({...prev, curso: newValue ? newValue : ""}));
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar curso" variant="outlined" />}
                    />
                </Grid>

                {/* Selección de alumno */}
                {filterValues.curso &&
                    <Grid item>
                        <Autocomplete
                            options={alumnos}
                            getOptionLabel={(option) => `${option.usuario.apellido} ${option.usuario.nombre} `}
                            style={{ width: 300 }}
                            value={alumnos.find(a => a.id_alumno === filterValues.alumno.id_alumno) || null}
                            onChange={(event, newValue) => {
                                setFilterValues((prev) => ({...prev, alumno: newValue ? newValue : ""}));
                            }}
                            renderInput={(params) => <TextField {...params} label="Seleccionar alumno(opcional)" variant="outlined" />}
                        />
                    </Grid>
                }

                {/* Selección de materia */}
                {filterValues.curso && 
                    <Grid item>
                        <Autocomplete
                            options={materias}
                            getOptionLabel={(option) => option.nombre || ""}
                            style={{ width: 300 }}
                            value={materias.find(m => m.id_materia === filterValues.materia.id_materia) || null}
                            onChange={(event, newValue) => {
                                setFilterValues((prev) => ({...prev, materia: newValue ? newValue : ""}));
                            }}
                            renderInput={(params) => <TextField {...params} label="Seleccionar materia(opcional)" variant="outlined" />}
                        />
                    </Grid>
                }

                {/* Botón para buscar */}
                <Grid item>
                    <Button 
                        variant="outlined"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={18} /> : <Search />}
                        onClick={handleSearch}
                        disabled={disabledSearchButton}
                        sx={{height: 40}} 
                    >
                        Buscar
                    </Button>
                </Grid>

                {/* Botón para exportar PDF */}
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

            {/* === No hay alumnos en el curso === */}
            {showEmptyAlumnosMessage && (
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
                    <SearchOff sx={{ fontSize: 60, mb: 1, color: "#9E9E9E" }} />
                    <Typography variant="h6" fontWeight="500">
                        No hay alumnos registrados en este curso.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#9E9E9E" }}>
                        Verifica que el curso tenga alumnos asignados o selecciona otro curso.
                    </Typography>
                </Box>
            )}

            {/* === No hay materias en el curso === */}
            {showEmptyMateriasMessage && (
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
                    <SearchOff sx={{ fontSize: 60, mb: 1, color: "#9E9E9E" }} />
                    <Typography variant="h6" fontWeight="500">
                        No hay materias asignadas en este curso.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#9E9E9E" }}>
                        Verifica que el curso tenga materias asignadas o selecciona otro curso.
                    </Typography>
                </Box>
            )}
            
            {/* Mostrar calificaciones */}
            <Typography variant="h4" mt={2}>
                {title}
            </Typography>
            <Box>
                {showEmptyCalificacionesMessage && !loading &&
                    <Box key={new Date().getFullYear()} mb={4} mt={2}>
                        <Divider>
                            <Chip label={new Date().getFullYear()} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                        </Divider>
                        {displayWithAccordion && (
                            <Box>
                                {selectableMaterias.map(m => (
                                    <Accordion key={m.id} sx={{ mt: 2 }}>
                                        <AccordionSummary sx={{backgroundColor: "#E8EEF7"}} expandIcon={<ExpandMore />}>
                                            <Typography variant="h6">{m.nombre}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                            <Typography variant="body2" sx={{ fontStyle: "italic", color: "#616161", mb: 2, mt: 2, textAlign: "center" }}>
                                                No hay calificaciones cargadas para esta materia en el ciclo lectivo {new Date().getFullYear().toString()}.
                                            </Typography>
                                            <CustomTable
                                                alumnos={getAlumnos(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === m.id_materia))}
                                                headers={getHeaders(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === m.id_materia))}
                                                data={mapCalificaciones(calificaciones
                                                    .filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === m.id_materia))
                                                }
                                                defaultValues={getDefaultValues(m.id_materia)}
                                                options={getOptions(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === m.id_materia))}
                                                keys={getKeys(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === m.id_materia))}
                                                onSave={handleSave}
                                                onError={handleError}
                                                editable={EDIT_PERMISSION && new Date().getFullYear().toString().toString() === CURRENT_YEAR}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}
                        {!displayWithAccordion && (
                                <Box sx={{ backgroundColor: "#E8EEF7", p: 2, borderRadius: 1, mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "#616161", mb: 2, mt: 2, textAlign: "center" }}>
                                        No hay calificaciones cargadas para esta materia en el ciclo lectivo {new Date().getFullYear().toString()}.
                                    </Typography>
                                    <CustomTable
                                            alumnos={getAlumnos(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === filterValues.materia.id_materia))}
                                            headers={getHeaders(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === filterValues.materia.id_materia))}
                                            data={mapCalificaciones(calificaciones
                                                .filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === filterValues.materia.id_materia))
                                            }
                                            defaultValues={getDefaultValues(filterValues.materia.id_materia)}
                                            options={getOptions(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === filterValues.materia.id_materia))}
                                            keys={getKeys(calificaciones.filter(c => c.ciclo_lectivo === new Date().getFullYear().toString() && c.id_materia === filterValues.materia.id_materia))}
                                            onSave={handleSave}
                                            onError={handleError}
                                            editable={EDIT_PERMISSION && new Date().getFullYear().toString().toString() === CURRENT_YEAR}
                                        />
                                </Box>
                            )
                        }
                    </Box>
                }
                {!loading && calificaciones.length > 0 && uniqueAnios.map(anio => (
                    <Box key={anio} mb={4} mt={2}>
                        <Divider>
                            <Chip label={anio} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                        </Divider>
                        {!displayWithAccordion && (
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
                                <CustomTable
                                    alumnos={getAlumnos(calificaciones.filter(c => c.ciclo_lectivo === anio))}
                                    headers={getHeaders(calificaciones.filter(c => c.ciclo_lectivo === anio))} 
                                    data={mapCalificaciones(calificaciones.filter(c => c.ciclo_lectivo === anio))} 
                                    defaultValues={getDefaultValues}
                                    options={getOptions(calificaciones.filter(c => c.ciclo_lectivo === anio))}
                                    keys={getKeys(calificaciones.filter(c => c.ciclo_lectivo === anio))}
                                    onSave={handleSave}
                                    onError={handleError}
                                    editable={EDIT_PERMISSION && anio === CURRENT_YEAR}
                                />
                            </Box>
                        )}
                        {displayWithAccordion && (
                            <Box key={loading ? "loading" : "loaded"}>
                                {selectableMaterias.map(m => (
                                    <Accordion key={m.id} sx={{ mt: 2 }}>
                                        <AccordionSummary sx={{backgroundColor: "#E8EEF7"}} expandIcon={<ExpandMore />}>
                                            <Typography variant="h6">{m.nombre}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                            {calificaciones.filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia).length === 0 ? (
                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#616161", mb: 2, mt: 2, textAlign: "center" }}>
                                                    No hay calificaciones cargadas para esta materia en el ciclo lectivo {anio}.
                                                </Typography>
                                            ) : (
                                            <>
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
                                            </>
                                            )}
                                            <CustomTable
                                                alumnos={getAlumnos(calificaciones.filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia))}
                                                headers={getHeaders(calificaciones
                                                    .filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia))}
                                                data={mapCalificaciones(calificaciones
                                                    .filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia))
                                                }
                                                defaultValues={getDefaultValues(m.id_materia)}
                                                options={getOptions(calificaciones.filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia))}
                                                keys={getKeys(calificaciones.filter(c => c.ciclo_lectivo === anio && c.id_materia === m.id_materia))}
                                                onSave={handleSave}
                                                onError={handleError}
                                                editable={EDIT_PERMISSION && anio === CURRENT_YEAR}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
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