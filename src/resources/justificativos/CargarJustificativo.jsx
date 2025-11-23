import { useState, useEffect } from "react";
import { useDataProvider, useNotify } from "react-admin";
import useUser from "../../contexts/UserContext/useUser";
import { 
    Box,
    Grid,
    Autocomplete,
    TextField,
    Button,
    CircularProgress,
    Backdrop,
    Typography,
    Chip,
    TextareaAutosize
} from "@mui/material";
import { Search, Add, Image, SearchOff, Cached } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import { LoaderOverlay } from "../../components/LoaderOverlay";

export const CargarJustificativo = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const { user } = useUser();

    const [hijos, setHijos] = useState([]);
    const [inasistencias, setInasistencias] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [selectedAsistencia, setSelectedAsistencia] = useState("");
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dataProvider.getHijosPorTutor()
        .then(({ data }) => {
            setHijos(data);
        })
        .catch((error) => {
            notify("Error al obtener hijos", { type: "error" });
            console.error("Error fetching hijos:", error);
        });
    }, [dataProvider]);

    const handleSearch = () => {
        if(!selectedHijo) return;

        setLoading(true);

        dataProvider.getInasistenciasPorAlumno(selectedHijo.id_alumno)
            .then(({ data }) => {
                setInasistencias(data);
                setShowEmptyMessage(data.length === 0);
            })
            .catch((error) => {
                notify("Error al obtener inasistencias", { type: "error" });
                console.error("Error fetching inasistencias:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleShowAddModal = (inasistencia) => {
        setSelectedAsistencia(inasistencia);
        setShowAddModal(true);
    }

    const handleHideAddModal = () => {
        setShowAddModal(false);
        setSelectedAsistencia("");
    }

    const handleUploadJustificativo = (formData) => {
        setLoading(true);

        if(!selectedAsistencia || !selectedAsistencia.id_asistencia) {
            console.error("No se ha seleccionado una asistencia válida.");
            setLoading(false);
            return;
        }

        if(selectedAsistencia.justificativo && selectedAsistencia.justificativo.estado === "Rechazado") {
            dataProvider.actualizarEstadoJustificativo(selectedAsistencia.justificativo.id_justificativo, 'Pendiente', null, formData.get('detalle_justificativo'))
            .then(({data}) => {
                setLoading(false);
                setShowAddModal(false);
                notify("Justificativo enviado con éxito", { type: "success" });
                handleSearch(); // Refresh the list after adding a justificativo
            })
            .catch((error) => {
                notify("Error al enviar justificativo", { type: "error" });
                console.error("Error uploading justificativo:", error);
                setLoading(false);
            })
                
        }else{
            dataProvider.crearJustificativo(formData, selectedAsistencia.id_asistencia)
            .then(({ data }) => {
                setLoading(false);
                setShowAddModal(false);
                notify("Justificativo enviado con éxito", { type: "success" });
                handleSearch(); // Refresh the list after adding a justificativo
            })
            .catch((error) => {
                notify("Error al enviar justificativo", { type: "error" });
                console.error("Error uploading justificativo:", error);
                setLoading(false);
            });
        }
    }

    return (
        <Box>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    <Autocomplete
                        options={hijos}
                        getOptionLabel={(option) => `${option.usuario.apellido} ${option.usuario.nombre}`}
                        style={{ width: 300 }}
                        value={hijos.find(h => h.id_alumno === selectedHijo?.id_alumno) || null}
                        onChange={(event, newValue) => {
                            setSelectedHijo(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleccionar hijo" variant="outlined" />}
                    />
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={18} /> : <Search />}
                        onClick={handleSearch}
                        sx={{height: 40}} 
                        disabled={loading || !selectedHijo}
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
                        El alumno seleccionado no tiene inasistencias recientes.
                    </Typography>
                </Box>
            )}

            {inasistencias.length > 0 && (
                <Box sx={{ mt: 2, paddingY: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                        Inasistencias recientes
                    </Typography>
                    {inasistencias.map((inasistencia) => (
                        <InasistenciaCard 
                            key={inasistencia.id_asistencia} 
                            inasistencia={inasistencia} 
                            onAddClick={() => handleShowAddModal(inasistencia)}
                        />
                    ))}
                </Box>
            )}

            {showAddModal && (
                <AddModal
                    onClose={handleHideAddModal}
                    onSubmit={handleUploadJustificativo}
                />
            )}

            <LoaderOverlay open={loading} />
        </Box>
    );
}

const AddModal = ({ onSubmit, onClose }) => {
    const [imagen, setImagen] = useState(null);
    const [detalle, setDetalle] = useState("");

    const [errors, setErrors] = useState({});

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleImageChange = (event) => {
        setImagen(event.target.files[0]);

        if(errors.imagen) {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors.imagen;
                return newErrors;
            });
        }
    }

    const validate = () => {
        const newErrors = {};

        if(!imagen) newErrors.imagen = "Debe subir una imágen";
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSave = () => {
        if(!validate()) return;

        const data = new FormData();
        data.append('imagen', imagen);
        data.append('detalle_justificativo', detalle);

        onSubmit(data);
    }

    return(
        <Backdrop open={true}>
            <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 300 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Agregar justificativo
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Grid container spacing={2} display='flex' alignItems='flex-start'>
                        <Grid display="flex" flexDirection="column" alignItems="center">
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    border: imagen ? "1px solid #ccc" : "2px dashed #bbb",
                                    borderRadius: 2,
                                    backgroundColor: imagen ? "#fff" : "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden"
                                }}
                            >
                                {imagen ? (
                                    <img
                                        src={URL.createObjectURL(imagen)}
                                        alt="Preview"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Sin imagen seleccionada
                                    </Typography>
                                )}
                            </Box>

                            {errors.imagen && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    {errors.imagen}
                                </Typography>
                            )}

                            {/* Botón de subida */}
                            <Button
                                component="label"
                                variant="contained"
                                color="secondary"
                                tabIndex={-1}
                                startIcon={<Image />}
                                sx={{ mt: 2 }}
                            >
                                Subir imagen
                                <input
                                type="file"
                                hidden
                                onChange={(event) => {
                                    handleImageChange(event);
                                }}
                                accept="image/*"
                                />
                            </Button>
                        </Grid>
                        <Grid>
                            <TextareaAutosize 
                                minRows={10}
                                placeholder="Detalle el motivo de la inasistencia (opcional)"
                                value={detalle}
                                onChange={(e) => { setDetalle(e.target.value) }}
                                style={{ width: "300px" }}
                            />
                        </Grid>
                    </Grid>
                    
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Enviar
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Backdrop>
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

const InasistenciaCard = ({ inasistencia, onAddClick }) => {
    const estadoColors = {
        "Sin justificar": "grey",
        "Aceptado": "green",
        "Rechazado": "red",
        "Pendiente": "#349FDA",
        "Bloqueado": "#d32f2f"
    };
    const [showImageModal, setShowImageModal] = useState(false);

    const parseDate = (dateString) => {
        const separator = dateString.includes('-') ? '-' : '/';
        const [day, month, year] = dateString.split(separator);
        return new Date(`${year}-${month}-${day}`);
    }

    const hanPasadoMasDe3Dias = () => {
        const fechaInasistencia = parseDate(inasistencia.fecha);
        const fechaActual = new Date();

        let diasHabiles = 0;
        let fechaIteracion = new Date(fechaInasistencia);

        while (fechaIteracion < fechaActual) {
            fechaIteracion.setDate(fechaIteracion.getDate() + 1);
            const dia = fechaIteracion.getDay(); // 0=Domingo, 6=Sábado
            if (dia !== 0 && dia !== 6) {
                diasHabiles++;
            }
            if (diasHabiles > 3) {
                return true; // ya pasaron más de 3 días hábiles
            }
        }
        return false;
    }

    let estado = inasistencia.justificativo?.estado || (hanPasadoMasDe3Dias() ? "Bloqueado" : "Sin justificar");
    const color = estadoColors[estado] || "grey";

    const SERVER_URL = "http://localhost:6543";

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
                maxWidth: 600
            }}
        >
            <Grid container spacing={2} alignItems="center">
            {/* Texto a la izquierda */}
                <Grid item size={6}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {inasistencia.fecha}
                    </Typography>

                    <Chip
                        label={estado}
                        sx={{
                            mt: 1,
                            backgroundColor: color,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                    />

                    {inasistencia.justificativo?.detalle_justificativo && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Detalle del justificativo
                            </Typography>
                            <Typography variant="body2">
                                {inasistencia.justificativo?.detalle_justificativo}
                            </Typography>
                        </Box>
                    )}

                    {inasistencia.justificativo?.motivo_rechazo && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Motivo del rechazo
                            </Typography>
                            <Typography variant="body2">
                                {inasistencia.justificativo?.motivo_rechazo}
                            </Typography>
                        </Box>
                    )}

                    {inasistencia.justificativo?.auxiliar && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Validado por
                            </Typography>
                            <Typography variant="body2">
                                {inasistencia.justificativo?.auxiliar}
                            </Typography>
                        </Box>
                    )}
                </Grid>
                
                <Grid item size={6} display={"flex"} justifyContent="flex-end">
                {/* Imagen a la derecha */}
                    {inasistencia.justificativo?.image_path && (
                            <Box
                                sx={{
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <img
                                    src={`${SERVER_URL}/${inasistencia.justificativo.image_path}`}
                                    alt="Justificativo"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "8px"
                                    }}
                                    onClick={() => {setShowImageModal(true)}}
                                />
                                {(inasistencia.justificativo.estado === "Rechazado" && !hanPasadoMasDe3Dias()) && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Cached />}
                                        onClick={onAddClick}
                                    >
                                        Reemplazar
                                    </Button>
                                )}
                            </Box>
                    )}
                    {(estado === "Sin justificar") && (
                        
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Add />}
                                onClick={onAddClick}
                            >
                                Agregar justificativo
                            </Button>
                    )}
                </Grid>
            </Grid>
            {showImageModal && (
                <ImageModal 
                    imageUrl={`${SERVER_URL}/${inasistencia.justificativo?.image_path}`} 
                    onClose={() => setShowImageModal(false)} 
                />
            )}
        </Box>
    );
}
