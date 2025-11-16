import { useState, useEffect, useRef } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TextField,
    Button,
    Box,
    Select,
    MenuItem,
    Typography,
    Grid,
    Backdrop,
    Paper
} from "@mui/material";
import { Confirm } from "react-admin";
import { Save, Edit, Delete, WarningAmberRounded, Check, Add, Construction } from "@mui/icons-material";

export const CustomTable = ({ alumnos, headers, data, defaultValues = [], options = [], onSave = () => {}, onError = () => {}, editable = false }) =>{
    const [newAlumnos, setNewAlumnos] = useState([]);
    const [newHeaders, setNewHeaders] = useState([]);
    const [editedData, setEditedData] = useState([]);
    const [addedData, setAddedData] = useState([]);
    const [editingRows, setEditingRows] = useState([]);
    const [tempRowsValues, setTempRowsValues] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        content: "",
        confirmLabel: "",
        onConfirm: null,
        onCancel: null
    });

    const [addTipoCalificacionModalOpen, setAddTipoCalificacionModalOpen] = useState(false);

    const rowRefs = useRef({});

    useEffect(() => {
        if(editedData.length > 0){
            setHasChanges(true);
            return;
        }

        if(addedData.length > 0){
            setHasChanges(true);
            return;
        }

        setHasChanges(false);
    }, [editedData, addedData]);

    const handleEditRow = (alumno, disabled = false) => {
        if(disabled) return;

        if(editingRows && editingRows.some(r => r === alumno)){
            setEditingRows(prev => prev.filter(r => r !== alumno));
            setEditedData((prev) => {
                const tempValues = tempRowsValues.filter(r => r.alumno === alumno);

                if(tempValues.length === 0) return prev;
                
                tempValues.forEach((temp) => {
                    const existingIndex = prev.findIndex(item => item.alumno === alumno && item.tipoCalificacion === temp.tipoCalificacion && item.fecha === temp.fecha);
                    if (existingIndex !== -1) {
                        const updated = [...prev];

                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            nota: temp.nota
                        };

                        prev = updated;
                    } else {
                        prev = [...prev, { alumno: alumno, tipoCalificacion: temp.tipoCalificacion, fecha: temp.fecha, nota: temp.nota }];
                    }
                })


                const filteredPrev = prev.filter(item => {
                    const originalData = data.find(c => `${c.alumno.apellido} ${c.alumno.nombre}` === item.alumno && c.tipoCalificacion.descripcion === item.tipoCalificacion && c.fecha === item.fecha);

                    if(!originalData) return false;
                    return !(originalData && originalData.nota === item.nota);
                });

                return filteredPrev;
            })
            setAddedData((prev) => {
                const tempValues = tempRowsValues.filter(r => r.alumno === alumno);
                if(tempValues.length === 0) return prev;
                
                tempValues.forEach((temp) => {
                    const existingIndex = prev.findIndex(item => item.alumno === alumno && item.tipoCalificacion === temp.tipoCalificacion && item.fecha === temp.fecha);
                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            nota: temp.nota
                        };
                        prev = updated;
                    } else {
                        prev = [...prev, { alumno: alumno, tipoCalificacion: temp.tipoCalificacion, fecha: temp.fecha, nota: temp.nota }];
                    }
                })

                const filteredPrev = prev.filter(item => {
                    const originalData = data.find(c => `${c.alumno.apellido} ${c.alumno.nombre}` === item.alumno && c.tipoCalificacion.descripcion === item.tipoCalificacion && c.fecha === item.fecha);

                    if(originalData || !originalData && item.nota === "") return false;
                    return true;
                });
                return filteredPrev;
            });
            setTempRowsValues(prev => prev.filter(r => r.alumno !== alumno || !r.alumno));
        }else{
            setEditingRows(prev => {
                if(prev.some(r => r.alumno === alumno)) return prev.filter(r => r.alumno !== alumno);
                return [...prev, alumno];
            });
            [...headers, ...newHeaders].forEach((header) => {
                const existingTemp = tempRowsValues.find(r => r.alumno === alumno && r.tipoCalificacion === header.label && r.fecha === header.fecha);
                if(!existingTemp){
                    const existingEdited = editedData.find(c => c.alumno === alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha);
                    const existingAdded = addedData.find(c => c.alumno === alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha);
                    const existingData = data.find(c => `${c.alumno.apellido} ${c.alumno.nombre}` === alumno && c.tipoCalificacion.descripcion === header.label && c.fecha === header.fecha);
                    setTempRowsValues((prev) => [...prev, { 
                        alumno: alumno, 
                        tipoCalificacion: header.label, 
                        fecha: header.fecha,
                        nota: existingEdited ? existingEdited.nota : (existingAdded ? existingAdded.nota : (existingData ? existingData.nota : "")) 
                    }]);
                }
            })
        }
    }

    const handleChange = (value, alumno, header) => {
        if(header.label === "Alumno"){
            if(newAlumnos.some(a => a.alumno === value)){
                handleError(alumno, `El alumno ${value} ya fue agregado a la tabla.`);
                return;
            }
            setNewAlumnos((prev) => {
                const updated = prev.map((a) => {
                    if(a.alumno === alumno){
                        return {
                            ...a,
                            alumno: value
                        };
                    }
                    return a;
                });
                return updated;
            });

            if(value !== ""){
                setEditingRows((prev) => {
                    const filteredPrev = [...prev].filter(r => r !== "");
                    filteredPrev.push(value);
                    return filteredPrev;
                });
            }
        }
        setTempRowsValues((prev) => {
            const existingIndex = prev.findIndex(item => item.alumno === alumno && item.tipoCalificacion === header.label && item.fecha === header.fecha);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    nota: value
                };
                return updated;
            } else {
                return [...prev, { alumno: alumno, tipoCalificacion: header.label, fecha: header.fecha, nota: value }];
            }
        });   
    }

    const handleNotSavedChangesAdvice = () => {
        const filteredTempRows = [...tempRowsValues].filter(r => r.alumno);

        if(filteredTempRows && Object.keys(filteredTempRows).length === 0){
            handleSave();
            return;
        }

        setConfirmModal({
            open: true,
            title: "Confirmar guardado",
            content: "Hay cambios sin guardar. ¿Desea continuar sin guardarlos?",
            confirmLabel: "Guardar",
            onConfirm: handleSave,
            onCancel: closeConfirmModal
        });
    }

    const handleAddRow = () => {
        const newRow = {};
        newRow.alumno = "";
        newRow.editable = true;
        setNewAlumnos(prev => [...prev, newRow]);

        handleEditRow(newRow.alumno);
    };

    const handleDeleteRow = (rowIndex) => {
        const alumno = newAlumnos[rowIndex];
        if(editingRows.includes(alumno)) setEditingRows(prev => prev.filter(r => r !== alumno));

        const filteredTempRows = tempRowsValues.filter(r => r.alumno !== alumno.alumno);
        setTempRowsValues(filteredTempRows);

        const filteredAddedData = addedData.filter(d => d.alumno !== alumno.alumno);
        setAddedData(filteredAddedData)

        setNewAlumnos((prev) => {
            return prev.filter(a => a !== alumno)
        });
        closeConfirmModal();
    }

    const handleDeleteAlumnoAdvice = (rowIndex) => {
        setConfirmModal({
            open: true,
            title: "Confirmar eliminación",
            content: "¿Está seguro que quiere eliminar este registro? La acción no se puede deshacer",
            confirmLabel: "Eliminar",
            onConfirm: () => handleDeleteRow(rowIndex),
            onCancel: closeConfirmModal
        });
    }

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            title: "",
            content: "",
            onConfirm: null,
            onCancel: null
        });
    }

    const handleAddTipoCalificacion = (tipo) => {
        if(!tipo){
            setAddTipoCalificacionModalOpen(false);
            return;
        }

        setNewHeaders(prevHeaders => [...prevHeaders, { label: tipo, editable: true, deletable: true, fecha: new Date().toLocaleDateString() }]);
        if(data.length === 0){
            if(newAlumnos.length === 0){
                const updatedNewAlumnos = options.current_alumnos.map((alumno) => ({
                    alumno: alumno.label,
                    editable: true
                }));
                setNewAlumnos(updatedNewAlumnos);
            }
        }

        setAddTipoCalificacionModalOpen(false);
        setHasChanges(true);
    }

    const handleDeleteTipoCalificacionAdvice = (tipo) => {
        setConfirmModal({
            open: true,
            title: "Confirmar eliminación",
            content: "¿Está seguro que quiere eliminar este tipo de calificacion? La acción no se puede deshacer",
            confirmLabel: "Eliminar",
            onConfirm: () => handleDeleteTipoCalificacion(tipo),
            onCancel: closeConfirmModal
        });
    }

    const handleDeleteTipoCalificacion = (tipo) => {
        const updatedHeaders = [...newHeaders].filter(h => h.label !== tipo);
        setNewHeaders(updatedHeaders);

        closeConfirmModal();
    }

    const handleSave = () => {
        const updatedRows = [...editedData];
        const mappedUpdatedRows = updatedRows.map((row) => {
            const defaultValuesKeys = Object.keys(defaultValues);
            defaultValuesKeys.forEach((key) => {
                row[key] = defaultValues[key];
            });

            const idAlumno = options.current_alumnos.find(a => a.label === row.alumno)?.id;
            const idTipoCalificacion = options.tiposCalificaciones.find(t => t.label === row.tipoCalificacion)?.id;

            return {
                ...row,
                id_alumno: idAlumno,
                id_tipo_calificacion: idTipoCalificacion
            }
        });

        if(!validateRequiredFields(mappedUpdatedRows)) return;
        
        const addedRows = [...addedData];
        const mappedAddedRows = addedRows.map((row) => {
            const defaultValuesKeys = Object.keys(defaultValues);
            defaultValuesKeys.forEach((key) => {
                row[key] = defaultValues[key];
            });

            const idAlumno = options.current_alumnos.find(a => a.label === row.alumno)?.id;
            const idTipoCalificacion = options.tiposCalificaciones.find(t => t.label === row.tipoCalificacion)?.id;

            return {
                ...row,
                id_alumno: idAlumno,
                id_tipo_calificacion: idTipoCalificacion,
                fecha: row.fecha
            }
        });

        if(!validateRequiredFields(mappedAddedRows)) return;
        
        onSave(mappedUpdatedRows, mappedAddedRows);
        setHasChanges(false);
        setConfirmModal({
            open: false,
            title: "",
            content: "",
            onConfirm: null,
            onCancel: null
        });
    }

    const validateRequiredFields = (calificaciones) => {
        for(const c of calificaciones){
            if(c.nota === "" || c.nota === null || c.nota === undefined){
                handleError(c.alumno, `La calificación para el alumno ${c.alumno} en el tipo de calificación ${c.tipoCalificacion} es obligatoria.`);
                return false;
            }
            if(isNaN(c.nota) || c.nota < 0 || c.nota > 10){
                handleError(c.alumno, `La calificación para el alumno ${c.alumno} en el tipo de calificación ${c.tipoCalificacion} debe ser un número entre 0 y 10.`);
                return false;
            }

            if(!c.alumno || c.alumno === ""){
                handleError(c.alumno, `El nombre del alumno es obligatorio.`);
                return false;
            }
        }
        return true
    }

    const handleError = (alumno, message) => {
        const ref = rowRefs.current[alumno];
        if(ref && ref.scrollIntoView) {
            ref.scrollIntoView({ behavior: "smooth", block: "center" });
            ref.classList.add("row-error-pulse");
            setTimeout(() => ref.classList.remove("row-error-pulse"), 5000);
        }
        onError(message);
    }

    if(Object.keys(data).length === 0 && !editable) return null;

    
    //console.log("editingRows:", editingRows);
    //console.log("tempRowsValues:", tempRowsValues);
    //console.log("alumnos:", alumnos);
    //console.log("newAlumnos:", newAlumnos);
    //console.log("headers:", headers);
    //console.log("newHeaders:", newHeaders);
    //console.log("data:", data);
    //console.log("defaultValues:", defaultValues);
    //console.log("editedData:", editedData);
    //console.log("addedData:", addedData);
    //console.log("options:", options);

    return (
        <Box>
            {editable && 
                <Grid container justifyContent="flex-end" sx={{ mb: 2, gap: 2 }}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={() => setAddTipoCalificacionModalOpen(true)}
                        >
                            Agregar calificación
                        </Button>
                    </Grid>
                    {(Object.keys(data).length !== 0  && options.alumnos.length !== 0) && (
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Add />}
                                onClick={handleAddRow}
                            >
                                Agregar alumno
                            </Button>
                        </Grid>
                    )}
                </Grid>
            }
            {([...headers, ...newHeaders].length !== 0 && [...alumnos, ...newAlumnos].length !== 0) && (
                <Box sx={{ width: '100%', maxHeight: '400px', overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                align="center" 
                                sx={{backgroundColor: "#D9E2EF", minWidth: 150, maxWidth: 200}}
                            >
                                Alumno
                            </TableCell>
                            {headers.map((header, index) => (
                                <TableCell 
                                    key={index} 
                                    align="center" 
                                    sx={{backgroundColor: "#D9E2EF", minWidth: 150, maxWidth: 200}}
                                >
                                    {header.label}
                                </TableCell>
                            ))}
                            {newHeaders.map((header, index) => (
                                <TableCell 
                                    key={index} 
                                    align="center" 
                                    sx={{backgroundColor: "#D9E2EF", minWidth: 150, maxWidth: 200}}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        {header.label}
                                        <Delete 
                                            sx={{ cursor: "pointer" }} 
                                            onClick={() => handleDeleteTipoCalificacionAdvice(header.label)} 
                                        />
                                    </Box>
                                </TableCell>
                            ))}
                            {editable && 
                                <TableCell align="center" sx={{backgroundColor: "#D9E2EF", minWidth: 150, maxWidth: 200}}>
                                    Acciones
                                </TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data && alumnos.map((alumno, rowIndex) => (
                            <TableRow 
                                key={`alumno-${alumno.alumno}}`}
                                onKeyDown={(e) => {
                                    if(e.key === "Enter" && editingRows.includes(alumno.alumno)){
                                        handleEditRow(alumno.alumno);
                                    }
                                }}
                                ref={el => rowRefs.current[alumno.alumno] = el}
                            >
                                <TableCell align="center">
                                    {alumno.alumno}
                                </TableCell>
                                {[...headers, ...newHeaders].map((header) => (
                                    <TableCell 
                                        key={`nota-${alumno.alumno}-${header.label}-${header.fecha}-${rowIndex}`} align="center"
                                    >
                                        {(editingRows.includes(alumno.alumno) && header.editable) ? (
                                            <TextField
                                                value={
                                                    tempRowsValues.find(c => c.alumno === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota || 
                                                    ""
                                                }
                                                type="number"
                                                onChange={(e) => handleChange(e.target.value , alumno.alumno, header)}
                                            />
                                        ) : (
                                            editedData.find(c => c.alumno === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota ||
                                            addedData.find(c => c.alumno === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota ||
                                            data.find(c => `${c.alumno.apellido} ${c.alumno.nombre}` === alumno.alumno && c.tipoCalificacion.descripcion === header.label && c.fecha === header.fecha)?.nota || ""
                                        )}  
                                    </TableCell>
                                ))}
                                {editable &&
                                    <TableCell align="center">
                                        {editingRows.includes(alumno.alumno) ? 
                                            (
                                                <Check 
                                                    color="success"
                                                    onClick={() => handleEditRow(alumno.alumno)}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            ) : (
                                                <Edit 
                                                    color={alumno.editable && editable ? "primary" : "disabled"}
                                                    onClick={
                                                        () => handleEditRow(alumno.alumno, (!alumno.editable && !alumno.creatable) || !editable)
                                                    }
                                                    sx={{cursor: "pointer"}}
                                                />
                                            )
                                        } 
                                    </TableCell> 
                                }  
                            </TableRow>
                        ))}
                        {newAlumnos.map((alumno, rowIndex) => (
                            <TableRow 
                                key={`alumno-${alumno.alumno}}`}
                                onKeyDown={(e) => {
                                    if(e.key === "Enter" && editingRows.includes(alumno.alumno)){
                                        handleEditRow(alumno.alumno);
                                    }
                                }}
                                ref={el => rowRefs.current[alumno.alumno] = el}
                            >
                                <TableCell align="center">
                                    {editingRows.includes(alumno.alumno) && data.length !== 0 ? (
                                        <Select
                                            value={alumno.alumno || ""}
                                            variant="standard"
                                            sx={{width: '100%'}}
                                            onChange={(e) => {handleChange(e.target.value , alumno.alumno, { label: "Alumno" })}}
                                            autoFocus
                                        >
                                            {options.alumnos.map((option) => (
                                                <MenuItem key={option.id} value={option.label}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        alumno.alumno
                                    )}
                                </TableCell>
                                {[...headers, ...newHeaders].map((header) => (
                                    <TableCell 
                                        key={`nota-${alumno.alumno}-${header.label}-${header.fecha}-${rowIndex}`} align="center"
                                    >
                                        {(editingRows.includes(alumno.alumno) && header.editable) ? (
                                            <TextField
                                                value={
                                                    tempRowsValues.find(c => c.alumno === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota || 
                                                    ""
                                                }
                                                type="number"
                                                onChange={(e) => handleChange(e.target.value , alumno.alumno, header)}
                                            />
                                        ) : (
                                            addedData.find(c => c.alumno === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota ||
                                            data.find(c => `${c.alumno.apellido} ${c.alumno.nombre}` === alumno.alumno && c.tipoCalificacion === header.label && c.fecha === header.fecha)?.nota || ""
                                        )}  
                                    </TableCell>
                                ))}
                                <TableCell align="center">
                                    {editingRows.includes(alumno.alumno) ? 
                                        (
                                            <Check 
                                                color="success"
                                                onClick={() => handleEditRow(alumno.alumno)}
                                                sx={{cursor: "pointer"}}
                                            />
                                        ) : (
                                            <Edit 
                                                color={alumno.editable && editable ? "primary" : "disabled"}
                                                onClick={
                                                    () => handleEditRow(alumno.alumno, (!alumno.editable && !alumno.creatable) || !editable)
                                                }
                                                sx={{cursor: "pointer"}}
                                            />
                                        )
                                    }
                                    <Delete 
                                        sx={{ ml: 2, cursor: "pointer" }} 
                                        onClick={() => handleDeleteAlumnoAdvice(rowIndex)} 
                                    /> 
                                </TableCell> 
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </Box>
            )}
            {hasChanges &&
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{mt: 2}}
                    onClick={handleNotSavedChangesAdvice}
                >
                    Guardar Cambios
                </Button>
            }
            <Confirm
                isOpen={confirmModal.open}
                title={
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <WarningAmberRounded sx={{ color: "#D32F2F", fontSize: 48 }} />
                    <Typography variant="h6" fontWeight="bold">
                        {confirmModal.title}
                    </Typography>
                    </Box>
                }
                content={
                    <Box sx={{ mt: 1 }}>
                    <Typography>
                        {confirmModal.content}
                    </Typography>
                    </Box>
                }
                confirm={confirmModal.confirmLabel || "Confirmar"}
                cancel="Cancelar"
                onConfirm={confirmModal.onConfirm}
                onClose={confirmModal.onCancel}
                sx={{
                    "& .RaConfirm-confirmButton": {
                    backgroundColor: "#D32F2F",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#B71C1C" },
                    },
                }}
            />
            {addTipoCalificacionModalOpen &&
                <AddTipoCalificacionModal
                    options={options.tiposCalificaciones}
                    onSave={handleAddTipoCalificacion}
                    onClose={() => setAddTipoCalificacionModalOpen(false)}
                />
            }
        </Box>
    );
};

const AddTipoCalificacionModal = ({ options, onSave, onClose }) => {
    const [selectedTipo, setSelectedTipo] = useState("");

    const handleChange = (newValue) => {
        setSelectedTipo(newValue);
    }

    const handleSave = () => {
        onSave(selectedTipo);
    }

    return (
        <Backdrop 
            open 
            sx={{
                zIndex: (theme) => 2000,
            }}    
        >
            <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Agregar Tipo de Calificación
                        </Typography>
                        <Select
                            value={selectedTipo || ""}
                            variant="standard"
                            sx={{width: '100%'}}
                            onChange={(e) => handleChange(e.target.value)}
                            autoFocus
                        >
                            {options.map((option) => (
                                <MenuItem key={option.id} value={option.label}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <Grid container justifyContent="flex-end" sx={{mt: 2}}>
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                Agregar
                            </Button>
                            <Button variant="text" color="secondary" onClick={onClose} sx={{ml: 2}}>
                                Cancelar
                            </Button>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Backdrop>
    )
}