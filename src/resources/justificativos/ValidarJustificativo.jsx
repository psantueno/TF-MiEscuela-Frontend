import { 
    Box, 
    Grid,
    Autocomplete,
    TextField,
    Button,
    CircularProgress,
    Typography,
    Divider,
    Chip,
    Backdrop,
    TextareaAutosize,
} from "@mui/material"
import { LoaderOverlay } from "../../components/LoaderOverlay";
import { Search, SearchOff } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useDataProvider, useNotify } from "react-admin";

export const ValidarJustificativo = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [justificativos, setJustificativos] = useState([]);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [uniqueFechas, setUniqueFechas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dataProvider.getCursosPorRol()
            .then(({ data }) => {
                setCursos(data);
            })
            .catch((error) => {
                console.error("Error fetching cursos:", error);
                notify("Error al cargar los cursos", { type: "error" });
            });
    }, []);

    useEffect(() => {
        if (selectedCurso) {
            dataProvider.getAlumnosPorCurso(selectedCurso.id_curso)
                .then(({ data }) => {
                    setAlumnos(data);
                })
                .catch((error) => {
                    console.error("Error fetching alumnos:", error);
                    notify("Error al cargar los alumnos", { type: "error" });
                });
        } else {
            setAlumnos([]);
        }
    }, [selectedCurso]);

    const handleSearch = () => {
        setLoading(true);
        setShowEmptyMessage(false);

        if(!selectedCurso) return;

        dataProvider.getJustificativosPorCurso(selectedCurso.id_curso, selectedAlumno ? selectedAlumno.id_alumno : null)
            .then(({ data }) => {
                setJustificativos(data);
                if(data.length === 0){
                    setShowEmptyMessage(true)
                }else{
                    const fechasInasistencia = [...new Set(data.map(j => j.fecha_asistencia))]
                    setUniqueFechas(fechasInasistencia)
                }
            })
            .catch((error) => {
                console.error("Error fetching justificativos:", error);
                notify("Error al cargar los justificativos", { type: "error" });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleAccept = (id_justificativo) => {
        setLoading(true);
        dataProvider.actualizarEstadoJustificativo(id_justificativo, 'Aceptado')
            .then(() => {
                notify("Justificativo aceptado correctamente", { type: "success" });
                handleSearch();
            })
            .catch((error) => {
                console.error("Error updating justificativo status:", error);
                notify("Error al actualizar el estado del justificativo", { type: "error" });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleReject = (id_justificativo, motivo) => {
        setLoading(true);
        dataProvider.actualizarEstadoJustificativo(id_justificativo, 'Rechazado', motivo)
            .then(() => {
                notify("Justificativo rechazado correctamente", { type: "success" });
                handleSearch();
            })
            .catch((error) => {
                console.error("Error updating justificativo status:", error);
                notify("Error al actualizar el estado del justificativo", { type: "error" });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return(
        <Box>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Autocomplete
                        options={cursos}
                        getOptionLabel={(option) => `${option.anio_escolar}° ${option.division}`}
                        style={{ width: 300 }}
                        value={cursos.find(c => c.id_curso === selectedCurso?.id_curso) || null}
                        onChange={(event, newValue) => {
                            setSelectedCurso(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar curso" variant="outlined" />}
                    />
                </Grid>
                <Grid item>
                    <Autocomplete 
                        options={alumnos}
                        getOptionLabel={(option) => `${option.usuario.apellido} ${option.usuario.nombre}`}
                        style={{ width: 300 }}
                        value={alumnos.find(a => a.id_alumno === selectedAlumno?.id_alumno) || null}
                        onChange={(event, newValue) => {
                            setSelectedAlumno(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar alumno(opcional)" variant="outlined" />}
                    />
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={18} /> : <Search />}
                        onClick={handleSearch}
                        sx={{height: 40}} 
                        disabled={loading || !selectedCurso}
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>
            {showEmptyMessage && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                    mt: 5,
                    color: "#5f6368",
                    textAlign: "center",
                    }}
                >
                    <SearchOff sx={{ fontSize: 60, mb: 1, color: "#9E9E9E" }} />
                    <Typography variant="h6" fontWeight="500">
                        No hay justificativos de inasistencias para los filtros seleccionados.
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        Pruebe con otro curso o alumno.
                    </Typography>
                </Box>
            )}
            {!showEmptyMessage && justificativos.length > 0 && (
                <Box sx={{ paddingY: 3 }}>
                    {uniqueFechas.map(fecha => (
                        <Box key={`inasistencias-fecha-${fecha}`}>
                            <Divider>
                                <Chip label={fecha} sx={{backgroundColor: "#061B46", color: "#fff"}}/>
                            </Divider>
                            <Box sx={{ paddingY: 2 }}>
                                {justificativos.filter(j => j.fecha_asistencia === fecha).map(j => (
                                    <JustificativoCard 
                                        justificativo={j}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                        key={`${j.fecha_asistencia}-${j.alumno}`}    
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
            <LoaderOverlay open={loading} />
        </Box>
    )
}

const ImageModal = ({ imageUrl, onClose }) => {
    return(
        <Backdrop open={true} onClick={onClose} sx={{ zIndex: 1300 }}>
            <img 
                src={imageUrl} 
                alt="Justificativo Ampliado" 
                style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} 
            />
        </Backdrop>
    )
}

const RejectModal = ({ id_justificativo, onSave, onClose }) => {
    const [motivo, setMotivo] = useState("");
    const [errors, setErrors] = useState(null);

    const validate = () => {
        const newErrors = {};

        if(motivo.trim() === "") newErrors.motivo = "Debe especificar el motivo"

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSave = () => {
        if(!validate()) return;

        onSave(id_justificativo, motivo);
    }

    return(
        <Backdrop open={true} sx={{ zIndex: 1300 }}>
            <Box
                sx={{
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: "10px",
                    paddingY: 4,
                    paddingX: 4
                }}
            >
                <Typography variant="h5">
                    Motivo
                </Typography>
                <TextareaAutosize 
                    minRows={10}
                    placeholder="Ingrese el motivo del rechazo"
                    value={motivo}
                    onChange={(e) => { setMotivo(e.target.value) }}
                    style={{ width: "300px" }}
                />
                {errors?.motivo && (
                    <Typography variant="body2" color="error">
                        {errors.motivo}
                    </Typography>
                )}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleSave}
                    >
                        Enviar
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Backdrop>
    )
}

const JustificativoCard = ({ justificativo, onAccept, onReject }) => {
    const SERVER_URL = "http://localhost:6543";
    const estadoColors = {
        "Sin justificar": "grey",
        "Aceptado": "green",
        "Rechazado": "red",
        "Pendiente": "blue",
        "Bloqueado": "gold"
    };
    const color = estadoColors[justificativo.estado] || "grey";

    const [showImageModal, setShowImageModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    return(
        <Box
            sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                p: 2,
                mb: 2,
                boxShadow: 1,
                backgroundColor: "#f9f9f9",
                width: "100%",
                maxWidth: 700
            }}
        >
            <Grid container spacing={2} display={'flex'} alignItems={'center'}>
                <Grid display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <img
                        src={`${SERVER_URL}/${justificativo.image_path}`}
                        alt="Justificativo"
                        style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                        onClick={() => {setShowImageModal(true)}}
                    />
                </Grid>
                <Grid display={'flex'} flexDirection={'column'} justifyContent={'space-between'} maxHeight={'100%'}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {justificativo.alumno}
                    </Typography>
                    {justificativo?.detalle_justificativo && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Detalle del justificativo
                            </Typography>
                            <Typography variant="body2">
                                {justificativo?.detalle_justificativo}
                            </Typography>
                        </Box>
                    )}

                    {justificativo.estado === 'Pendiente' ? (
                        <Box sx={{ display: 'flex', gap:2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => {onAccept(justificativo.id_justificativo)}}
                            >
                                Aceptar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {setShowRejectModal(true)}}
                            >
                                Rechazar
                            </Button>
                        </Box>
                    ) : (
                        <Chip
                            label={justificativo.estado}
                            sx={{
                                mt: 1,
                                backgroundColor: color,
                                color: "#fff",
                                fontWeight: "bold",
                                maxWidth: 100,
                            }}
                        />
                    )}
                </Grid>
            </Grid>

            {showImageModal && (
                <ImageModal 
                    imageUrl={`${SERVER_URL}/${justificativo.image_path}`} 
                    onClose={() => setShowImageModal(false)} 
                />
            )}

            {showRejectModal && (
                <RejectModal
                    id_justificativo={justificativo.id_justificativo}
                    onSave={(id_justificativo, motivo) => {
                        onReject(id_justificativo, motivo);
                        setShowRejectModal(false);
                    }}
                    onClose={() => {setShowRejectModal(false)} }
                />
            )}
        </Box>
    )
}