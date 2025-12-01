import { useEffect, useState } from "react";
import {
    useDataProvider,
    useNotify,
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
    const notify = useNotify();

    const [cursos, setCursos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [selectableMaterias, setSelectableMaterias] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [tiposCalificaciones, setTiposCalificaciones] = useState([]);
    const [filterValues, setFilterValues] = useState(
        {
            curso: "",
            alumno: "",
            materia: "",
        }
    );
    const [calificaciones, setCalificaciones] = useState([]);
    const [calificacionesValues, setCalificacionesValues] = useState({
        id_curso: "",
        id_materia: "",
    });

    const [uniqueAnios, setUniqueAnios] = useState([]);

    const [title, setTitle] = useState("");
    const [displayWithAccordion, setDisplayWithAccordion] = useState(true);
    const [showEmptyAlumnosMessage, setShowEmptyAlumnosMessage] = useState(false);
    const [showEmptyMateriasMessage, setShowEmptyMateriasMessage] = useState(false);
    const [showEmptyCalificacionesMessage, setShowEmptyCalificacionesMessage] = useState(false);
    const [disabledSearchButton, setDisabledSearchButton] = useState(true);
    const [loading, setLoading] = useState(false);

    const CURRENT_YEAR = new Date().getFullYear().toString();

    const { user } = useUser();
    const EDIT_PERMISSION = user.rol === "docente" || user.rol === "admin";

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

        setFilterValues((prev) => ({...prev, alumno: "", materia: ""}));

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
        const uniqueAnios = [...new Set(calificaciones.map(c => c.curso.cicloLectivo))];
        setUniqueAnios(uniqueAnios);

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
            }
        );

        dataProvider
            .getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: { id_curso: filterValues.curso.id_curso ?? "", id_materia: filterValues.materia.id_materia ?? "", id_alumno: filterValues.alumno.id_alumno ?? "" },
            })
            .then(({ data }) => {
                setCalificaciones(data);

                if(data.length === 0) setShowEmptyCalificacionesMessage(true);
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
        return (calificaciones.filter(c => c.curso.cicloLectivo === anio && c.nota >= 6 && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length / calificaciones.filter(c => c.curso.cicloLectivo === anio && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length * 100).toFixed(2);
    }

    const getTotalAprobadas = (anio, materia = null, curso = null) => {
        return `Total: ${calificaciones.filter(c => c.curso.cicloLectivo === anio && c.nota >= 6 && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length}`;
    }

    const getPorcentajeReprobadas = (anio, materia = null, curso = null) => {
        return (calificaciones.filter(c => c.curso.cicloLectivo === anio && c.nota < 6 && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length / calificaciones.filter(c => c.curso.cicloLectivo === anio && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length * 100).toFixed(2);
    }

    const getTotalReprobadas = (anio, materia = null, curso = null) => {
        return `Total: ${calificaciones.filter(c => c.curso.cicloLectivo === anio && c.nota < 6 && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length}`;
    }

    const getPromedioGeneral = (anio, materia = null, curso = null) => {
        return (calificaciones.filter(c => c.curso.cicloLectivo === anio && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / calificaciones.filter(c => c.curso.cicloLectivo === anio && (materia ? c.materia.id_materia === materia.id_materia : true) && (curso ? c.curso.id_curso === curso.id_curso : true)).length).toFixed(2)
    }

    const exportarPDF = async () => {
        await generarReportePDF({ curso: filterValues.curso, materia: filterValues.materia, alumno: filterValues.alumno, calificaciones: calificaciones });
    }

    const getDefaultValues = (idMateria) => {
        const defaultValues = {};
        defaultValues["id_curso"] = calificacionesValues.id_curso;
        defaultValues["id_materia"] = calificacionesValues.id_materia || idMateria;
        return defaultValues;
    }
    
    const getOptions = (filteredCalificaciones) => {
        const options = {};
        options["alumnos"] = getAlumnosOptions(filteredCalificaciones);
        options["tiposCalificaciones"] = tiposCalificaciones.map(t => ({ id: t.id_tipo_calificacion, label: t.descripcion }));

        if(filterValues.alumno){
            options["current_alumnos"] = [{
                id: filterValues.alumno.id_alumno,
                label: `${filterValues.alumno.usuario.apellido} ${filterValues.alumno.usuario.nombre}`,
            }];
        }else{
            options["current_alumnos"] = alumnos.map(a => ({
                id: a.id_alumno,
                label: `${a.usuario.apellido} ${a.usuario.nombre}`,
            }));
        }
        return options;
    }

    const getHeaders = (filteredCalificaciones) => {
        const tiposCalificaciones = [];
        
        filteredCalificaciones.forEach((c) => {
            if(!tiposCalificaciones.some(t => t.label === c.tipoCalificacion.descripcion && t.fecha === c.fecha)){
                tiposCalificaciones.push({ label: c.tipoCalificacion.descripcion, fecha: c.fecha, editable: !c.publicado });
            }
        })

        tiposCalificaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        tiposCalificaciones.sort((a, b) => {
            const [dayA, monthA, yearA] = a.fecha.split("/").map(Number);
            const [dayB, monthB, yearB] = b.fecha.split("/").map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

        return tiposCalificaciones;
    }

    const getAlumnos = (filteredCalificaciones) => {
        const filteredAlumnos = []
        filteredCalificaciones.forEach((c) => {
            if(!filteredAlumnos.some(a => a.alumno === `${c.alumno.apellido} ${c.alumno.nombre}`)){
                // Desactivacion temporal de la restriccion de edición por alumno
                //filteredAlumnos.push({ alumno: `${c.alumno.apellido} ${c.alumno.nombre}`, editable: alumnos.some(a => `${a.usuario.apellido} ${a.usuario.nombre}` === `${c.alumno.apellido} ${c.alumno.nombre}`)});
                filteredAlumnos.push({ alumno: `${c.alumno.apellido} ${c.alumno.nombre}`, editable: true });
            }
        });
        return filteredAlumnos;
    }

    const getAlumnosOptions = (filteredCalificaciones) => {
        if(filteredCalificaciones.length === 0) return [];
        if(filterValues.alumno) return [];
        const filteredAlumnos = alumnos.filter(a => {
            const nombreCompleto = `${a.usuario.apellido} ${a.usuario.nombre}`;
            return !filteredCalificaciones.some(c => `${c.alumno.apellido} ${c.alumno.nombre}`=== nombreCompleto);
        });
        const mappedAlumnos = filteredAlumnos.map(a => ({
            id: a.id_alumno,
            label: `${a.usuario.apellido} ${a.usuario.nombre}`,
        }));
        
        return mappedAlumnos;
    }

    const handleSave = async (updatedRows, addedRows) => {
        setLoading(true);

        const mappedUpdatedRows = [];
        updatedRows.forEach((c) => {
            const idCalificacion = calificaciones.find(cal => cal.alumno.id_alumno === c.id_alumno && cal.tipoCalificacion.id_tipo_calificacion === c.id_tipo_calificacion && cal.curso.cicloLectivo === CURRENT_YEAR  && cal.fecha === c.fecha)?.id_calificacion;
            
            if(idCalificacion){
                mappedUpdatedRows.push({
                    id_calificacion: idCalificacion,
                    nota: c.nota,
                    id_materia: c.id_materia,
                    id_curso: c.id_curso,
                });
            }
        })

        const mappedAddedRows = [];
        addedRows.forEach((c) => {
            mappedAddedRows.push({
                id_alumno: c.id_alumno,
                id_tipo_calificacion: c.id_tipo_calificacion,
                id_materia: c.id_materia,
                id_curso: c.id_curso,
                nota: c.nota,
                fecha: c.fecha,
            });
        })

        console.log("Mapped Updated Rows:", mappedUpdatedRows);
        console.log("Mapped Added Rows:", mappedAddedRows);

        try{

            if(mappedUpdatedRows.length > 0) await dataProvider.updateManyCalificaciones(mappedUpdatedRows);
            if(mappedAddedRows.length > 0) await dataProvider.createManyCalificaciones(mappedAddedRows);

            notify("Cambios guardados correctamente", { type: "success" });

            const filter = { id_curso: filterValues.curso.id_curso };
            if(filterValues.materia) filter.id_materia = filterValues.materia.id_materia;
            if(filterValues.alumno) filter.id_alumno = filterValues.alumno.id_alumno;

            const { data } = await dataProvider.getList("calificaciones", {
                pagination: { page: 1, perPage: 100 },
                sort: {},
                filter: filter,
            });
            setCalificaciones(data);
            if(data.length === 0) setShowEmptyCalificacionesMessage(true);
            else setShowEmptyCalificacionesMessage(false);
        }catch(error){
            console.error("Error en la operaciÃ³n de calificaciones:", error);
            handleError("Error en la operaciÃ³n de calificaciones");
        }finally{
            setLoading(false);
        }
    }

    const handleError = (errorMessage) => {
        notify(errorMessage, { type: "error" });
    }

    return (
        <Box sx={{paddingBottom: 2}}>
            <LoaderOverlay open={loading} />
            <Grid container spacing={2} alignItems="center">
                {/* SelecciÃ³n de curso */}
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

                {/* SelecciÃ³n de materia */}
                {filterValues.curso && 
                    <>
                        <Grid item>
                            <Autocomplete
                                options={alumnos}
                                getOptionLabel={(option) => `${option.usuario.apellido} ${option.usuario.nombre}`}
                                style={{ width: 300 }}
                                value={alumnos.find(a => a.id_alumno === filterValues.alumno?.id_alumno) || null}
                                onChange={(event, newValue) => {
                                    setFilterValues((prev) => ({...prev, alumno: newValue ? newValue : ""}));
                                }}
                                renderInput={(params) => <TextField {...params} label="Seleccionar alumno (opcional)" variant="outlined" />}
                            />
                        </Grid>
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
                    </>
                }

                {/* BotÃ³n para buscar */}
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

                {/* BotÃ³n para exportar PDF */}
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
                                                alumnos={
                                                    getAlumnos(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === m.id_materia))
                                                }
                                                headers={
                                                    getHeaders(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === m.id_materia))
                                                }
                                                data={
                                                    calificaciones
                                                        .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === m.id_materia)
                                                }
                                                defaultValues={getDefaultValues(m.id_materia)}
                                                options={
                                                    getOptions(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === m.id_materia))
                                                }
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
                                            alumnos={
                                                    getAlumnos(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === filterValues.materia.id_materia))
                                                    }
                                            headers={
                                                getHeaders(calificaciones
                                                    .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === filterValues.materia.id_materia))
                                                }
                                            data={
                                                calificaciones
                                                    .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === filterValues.materia.id_materia)
                                            }
                                            defaultValues={getDefaultValues(filterValues.materia.id_materia)}
                                            options={
                                                getOptions(calificaciones
                                                    .filter(c => c.curso.cicloLectivo === new Date().getFullYear().toString() && c.materia.id_materia === filterValues.materia.id_materia))
                                            }
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
                                    alumnos={
                                        getAlumnos(calificaciones
                                            .filter(c => c.curso.cicloLectivo === anio))
                                    }
                                    headers={
                                        getHeaders(calificaciones
                                            .filter(c => c.curso.cicloLectivo === anio))
                                    } 
                                    data={
                                        calificaciones
                                            .filter(c => c.curso.cicloLectivo === anio)
                                    } 
                                    defaultValues={getDefaultValues(filterValues.materia ? filterValues.materia.id_materia : null)}
                                    options={
                                        getOptions(calificaciones
                                            .filter(c => c.curso.cicloLectivo === anio))
                                    }
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
                                            {calificaciones.filter(c => c.curso.cicloLectivo === anio && c.materia.id_materia === m.id_materia).length === 0 ? (
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
                                                alumnos={
                                                    getAlumnos(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === anio && c.materia.id_materia === m.id_materia))
                                                }
                                                headers={
                                                    getHeaders(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === anio && c.materia.id_materia === m.id_materia))
                                                }
                                                data={
                                                    calificaciones
                                                        .filter(c => c.curso.cicloLectivo === anio && c.materia.id_materia === m.id_materia)
                                                }
                                                defaultValues={getDefaultValues(m.id_materia)}
                                                options={
                                                    getOptions(calificaciones
                                                        .filter(c => c.curso.cicloLectivo === anio && c.materia.id_materia === m.id_materia))
                                                }
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
        </Box>
    );
}

