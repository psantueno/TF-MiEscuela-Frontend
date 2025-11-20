import { 
    List,
    Show,
    TopToolbar,
    CreateButton,
    ExportButton,
    ReferenceInput,
    AutocompleteInput,
    TextInput,
    Datagrid,
    TextField,
    FunctionField,
    EditButton,
    SimpleShowLayout,
} from "react-admin"
import { 
    Typography, 
    Box, 
    Button,
    TextField as Input,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem
} from "@mui/material";
import { ArrowBack, Delete, Search, SearchOff, Restore, Save } from "@mui/icons-material";
import { LoaderOverlay } from "../../components/LoaderOverlay";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

const filters = [
    (
        <TextInput
            key="f_dni"
            source="tutor_numero_documento"
            label="DNI"
            alwaysOn
            resettable
        />
    ),
];

const ListActions = () => (
    <TopToolbar>
        
    </TopToolbar>
)

const CustomListButton = () => {
    const navigate = useNavigate();
    return (
        <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tutores')}
        >
            Volver al listado
        </Button>
    );
};

export const TutoresList = () => (
    <List
        resource="tutores-hijos"
        title="Asignaciones de auxiliares a cursos"
        filters={filters}
        perPage={25}
        actions={<ListActions />}
    >
        <Datagrid rowClick={(id) => `/tutores/${id}/show`} bulkActionButtons={false}>
            <FunctionField
                label="Tutor"
                render={record => `${record.apellido}, ${record.nombre}`}
            />
            <TextField source="numero_documento" label="DNI N°" />
            <FunctionField
                label="Tutor de"
                render={(record) => {
                    if(record.hijos && record.hijos.length > 0) {
                        return <Box>
                            {record.hijos.map((hijo) => (
                                <Typography key={hijo.id_alumno} variant="body2">
                                    {hijo.usuario.apellido}, {hijo.usuario.nombre} - {hijo.curso.anio_escolar}° {hijo.curso.division} {`(${hijo.parentesco})`}
                                </Typography>
                            ))}                 
                        </Box>
                    } else {
                        return <Typography variant="body2" color="textSecondary">No tiene hijos asignados</Typography>;
                    };
                }}
            />
            <EditButton 
                label="Editar"
                size="small"
                sx={{ minWidth: 0, p: 0.25, width: 60, justifyContent: 'center' }}
            />
        </Datagrid>
    </List>
)

const EditActions = () => (
    <TopToolbar sx={{ display:'flex', justifyContent:'end', alignItems:'center' }}>
        <EditButton label="Editar" />
        <CustomListButton />
    </TopToolbar>
)

export const TutoresShow = () => (
    <Show title="Detalle del tutor" actions={<EditActions />} resource="tutores-hijos">
        <SimpleShowLayout>
            <FunctionField
                label="Tutor"
                render={record => `${record.apellido}, ${record.nombre}`}
            />
            <TextField source="numero_documento" label="DNI N°" />
            <FunctionField
                label="Hijos asignados"
                render={(record) => {
                    if(record.hijos && record.hijos.length > 0) {
                        return <Box>
                            {record.hijos.map((hijo) => (
                                <Typography key={hijo.id_alumno} variant="body2">
                                    {hijo.usuario.apellido}, {hijo.usuario.nombre} - {hijo.curso.anio_escolar}° {hijo.curso.division} {`(${hijo.parentesco})`}
                                </Typography>
                            ))}                 
                        </Box>
                    } else {
                        return <Typography variant="body2" color="textSecondary">No tiene hijos asignados</Typography>;
                    };
                }}
            />
        </SimpleShowLayout>
    </Show>
)

export const TutoresEdit = () => {
    const location = useLocation();
    const dataProvider = useDataProvider();
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    const [addedAlumnos, setAddedAlumnos] = useState([]);
    const [deletedAlumnos, setDeletedAlumnos] = useState([]);
    const [updatedAlumnos, setUpdatedAlumnos] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tutorId = location.pathname.split('/')[2];
        
        dataProvider.getOne('tutores-hijos', { id: tutorId })
            .then(({ data }) => {
                setAlumnos(data.hijos || []);
            })
            .catch((error) => {
                console.error('Error fetching tutor data:', error);
            });
    }, [dataProvider]);

    useEffect(() => {
        setHasChanges(updatedAlumnos.length > 0 || addedAlumnos.length > 0 || deletedAlumnos.length > 0);
    }, [updatedAlumnos, addedAlumnos, deletedAlumnos]);

    const handleSearch = () => {
        setLoading(true);

        dataProvider.getList('alumnos', {
            filter: { numero_documento: searchValue },
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'usuario.apellido', order: 'ASC' },
        })
        .then(({ data }) => {
            const mappedData = data.map((alumno) => ({
                id_alumno: alumno.id_alumno,
                usuario: alumno.usuario,
                curso: alumno.cursos[0],
            }))
            setSearchResults(mappedData);
        })
        .catch((error) => {
            console.error('Error searching for student:', error);
        })
        .finally(() => {
            setLoading(false);
            setShowSearchResults(true);
        });
    }

    const handleAlumnoChange = (index, value) => {
        setAlumnos((prevAlumnos) => {
            const newAlumnos = [...prevAlumnos];
            newAlumnos[index].parentesco = value;
            return newAlumnos;
        });
        setUpdatedAlumnos((prev) => {
            const exists = prev.find(a => a.id_alumno === alumnos[index].id_alumno);
            if(exists) {
                return prev.map(a => a.id_alumno === alumnos[index].id_alumno ? { ...a, parentesco: value } : a);
            } else {
                return [...prev, { id_alumno: alumnos[index].id_alumno, parentesco: value }];
            }
        })
    }

    const handleAddedAlumnoChange = (index, value) => {
        setAddedAlumnos((prevAlumnos) => {
            const newAlumnos = [...prevAlumnos];
            newAlumnos[index].parentesco = value;
            return newAlumnos;
        });
    }

    const handleAddAlumno = (alumno) => {
        const newAlumno = { ...alumno, parentesco: 'Tutor' };
        setAddedAlumnos((prevAdded) => [...prevAdded, newAlumno]);
    }

    const handleDeleteExistingAlumno = (index) => {
        setDeletedAlumnos((prevDeleted) => [...prevDeleted, alumnos[index].id_alumno]);
    }

    const handleDeleteAddedAlumno = (index) => {
        setAddedAlumnos((prevAdded) => {
            const newAdded = [...prevAdded];
            newAdded.splice(index, 1);
            return newAdded;
        });
    }

    const handleRestoreAlumno = (id_alumno) => {
        setDeletedAlumnos((prevDeleted => prevDeleted.filter(id => id !== id_alumno)));
    }

    const handleSave = () => {
        setLoading(true);

        const tutorId = location.pathname.split('/')[2];
        const payload = {
            added_hijos: addedAlumnos.map(alumno => ({
                id_alumno: alumno.id_alumno,
                parentesco: alumno.parentesco,
            })),
            deleted_hijos: deletedAlumnos,
            updated_hijos: updatedAlumnos,
        };

        dataProvider.update('tutores-hijos', {
            id: tutorId,
            data: payload,
        })
        .then(() => {
            navigate(`/tutores/${tutorId}/show`);
        })
        .catch((error) => {
            console.error('Error al guardar los cambios:', error);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    return (
        <Box sx={{ p:2 }}>
            <Box
                sx={{ display: 'flex', justifyContent:'space-between' }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Input 
                        label="Buscar alumno por DNI"
                        variant="outlined"
                        size="small"
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<Search />}
                        disabled={!searchValue.trim()}
                        onClick={handleSearch}
                    >
                        Buscar
                    </Button>
                </Box>
                <EditActions />
            </Box>
            {showSearchResults && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Resultados de la búsqueda</Typography>
                    {searchResults.length > 0 ? 
                        (
                            <Box>
                                {searchResults.map((alumno) => (
                                    <Box
                                        key={alumno.id_alumno}
                                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}
                                    >
                                        <Typography>{alumno.usuario.apellido}, {alumno.usuario.nombre} - DNI N° {alumno.usuario.numero_documento} - {alumno.curso.anio_escolar}° {alumno.curso.division}</Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={alumnos.some(hijo => hijo.id_alumno === alumno.id_alumno) || addedAlumnos.some(hijo => hijo.id_alumno === alumno.id_alumno)}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleAddAlumno(alumno)}
                                        >
                                            Agregar
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="textSecondary">No se encontraron alumnos con este DNI</Typography>
                        )}
                </Box>
            )}
            <Box>
                {alumnos.length > 0 || addedAlumnos.length > 0 ? 
                    (
                        <Table sx={{ mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Alumno</TableCell>
                                    <TableCell>DNI N°</TableCell>
                                    <TableCell>Curso</TableCell>
                                    <TableCell>Parentesco</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alumnos.map((hijo, index) => (
                                    <TableRow 
                                        key={hijo.id_alumno}
                                        sx={{
                                            backgroundColor: deletedAlumnos.includes(hijo.id_alumno) ? '#ff7961B3' : 'inherit'
                                        }}      
                                    >
                                        <TableCell>
                                            {hijo.usuario.apellido}, {hijo.usuario.nombre}
                                        </TableCell>
                                        <TableCell>
                                            {hijo.usuario.numero_documento}
                                        </TableCell>
                                        <TableCell>
                                            {hijo.curso.anio_escolar}° {hijo.curso.division}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={hijo.parentesco}
                                                label=""
                                                onChange={(e) => {handleAlumnoChange(index, e.target.value)}}
                                            >
                                                <MenuItem value="Padre">Padre</MenuItem>
                                                <MenuItem value="Madre">Madre</MenuItem>
                                                <MenuItem value="Hermano">Hermano</MenuItem>
                                                <MenuItem value="Tio">Tio</MenuItem>
                                                <MenuItem value="Tutor">Tutor</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {deletedAlumnos.includes(hijo.id_alumno) ? (
                                                <Button
                                                    startIcon={<Restore />}
                                                    color="primary"
                                                    onClick={() => handleRestoreAlumno(hijo.id_alumno)}
                                                >
                                                    Reestablecer
                                                </Button>
                                            ) : (
                                                <Button
                                                    startIcon={<Delete />}
                                                    color="error"
                                                    onClick={() => handleDeleteExistingAlumno(index)}
                                                >
                                                    Eliminar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {addedAlumnos.map((hijo, index) => (
                                    <TableRow key={hijo.id_alumno}>
                                        <TableCell>
                                            {hijo.usuario.apellido}, {hijo.usuario.nombre}
                                        </TableCell>
                                        <TableCell>
                                            {hijo.usuario.numero_documento}
                                        </TableCell>
                                        <TableCell>
                                            {hijo.curso.anio_escolar}° {hijo.curso.division}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={hijo.parentesco}
                                                label=""
                                                onChange={(e) => {handleAddedAlumnoChange(index, e.target.value)}}
                                            >
                                                <MenuItem value="Padre">Padre</MenuItem>
                                                <MenuItem value="Madre">Madre</MenuItem>
                                                <MenuItem value="Hermano">Hermano</MenuItem>
                                                <MenuItem value="Tio">Tio</MenuItem>
                                                <MenuItem value="Tutor">Tutor</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                startIcon={<Delete />}
                                                color="error"
                                                onClick={() => handleDeleteAddedAlumno(index)}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
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
                                No tiene hijos asignados.
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Utilice el buscador para agregar alumnos a este tutor.
                            </Typography>
                        </Box>
                    )}
                    {hasChanges && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                onClick={() => handleSave()}
                            >
                                Guardar cambios
                            </Button>
                        </Box>
                    )}
            </Box>
            <LoaderOverlay open={loading} />
        </Box>
    )
}
