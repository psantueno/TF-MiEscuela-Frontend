import { useState, useEffect } from "react";
import { useDataProvider } from "react-admin";
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
} from "@mui/material";
import { Search, Add, Image } from "@mui/icons-material";
import { styled } from '@mui/material/styles';

export const JustificativosHijos = () => {
    const dataProvider = useDataProvider();
    const { user } = useUser();

    const [hijos, setHijos] = useState([]);
    const [justificativos, setJustificativos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState("");
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dataProvider.getJustificativosHijos()
        .then(({ data }) => {
            setJustificativos(data);
        })
        .catch((error) => {
            console.error("Error fetching justificativos:", error);
        });

        dataProvider.getHijosPorTutor()
        .then(({ data }) => {
            setHijos(data);
        })
        .catch((error) => {
            console.error("Error fetching hijos:", error);
        });
    }, [dataProvider]);

    const handleSearch = () => {
        
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
                        renderInput={(params) => <TextField {...params} label="Seleccionar hijo (opcional)" variant="outlined" />}
                    />
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={18} /> : <Search />}
                        onClick={handleSearch}
                        sx={{height: 40}} 
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={2} marginTop={2}>
                <Grid item>
                    <Button 
                        variant="contained"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={18} /> : <Add />}
                        onClick={() => setShowAddModal(true)}
                        sx={{height: 40}} 
                    >
                        Cargar justificativo
                    </Button>
                </Grid>
            </Grid>

            {showAddModal && (
                <AddModal
                    hijos={hijos} 
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </Box>
    );
}

const AddModal = ({ hijos, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        hijo: null,
        fecha: '',
        imagen: null,
    });

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

    const validate = () => {
        const newErrors = {};

        if(!formData.hijo) newErrors.hijo = "Debe seleccionar un hijo.";
        if(!formData.fecha) newErrors.fecha = "Debe ingresar una fecha.";
        if(!formData.imagen) newErrors.imagen = "Debe subir una imágen.";
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSave = () => {
        if(!validate()) return;

        const data = new FormData();
        data.append('id_alumno', formData.hijo.id_alumno);
        data.append('fecha', formData.fecha);
        data.append('imagen', formData.imagen);

        console.log("Submitting justificativo:", data);
    }

    return(
        <Backdrop open={true}>
            <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                    Agregar justificativo
                </Typography>
                <Box>
                    <Grid container spacing={2} sx={{ mt: 2, mb: 2, width: '500px' }}>
                            <Grid size={4}>
                                <Autocomplete
                                    options={hijos}
                                    getOptionLabel={(option) => `${option.usuario.apellido} ${option.usuario.nombre}`}
                                    value={hijos.find(h => h.id_alumno === formData.hijo?.id_alumno) || null}
                                    onChange={(event, newValue) => {
                                        setFormData({ ...formData, hijo: newValue });
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Seleccionar hijo" variant="outlined" />}
                                />
                                {errors.materia && <Typography color="error" variant="body2">{errors.materia}</Typography>}
                            </Grid>
                            <Grid size={4}>
                                <TextField 
                                    label="Fecha del justificativo"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                {errors.fecha && <Typography color="error" variant="body2">{errors.fecha}</Typography>}
                            </Grid>
                            <Grid size={4}>
                                    <Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<Image />}
                                    >
                                        Subir imágen
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={(event) => {
                                                setFormData({ ...formData, imagen: event.target.files[0] });
                                            }}
                                            accept="image/*"
                                        />
                                    </Button>
                                    {errors.imagen && <Typography color="error" variant="body2">{errors.imagen}</Typography>}
                            </Grid>
                    </Grid>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Guardar
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Backdrop>
    )
}