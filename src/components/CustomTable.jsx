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
import { Save, Edit, Delete, WarningAmberRounded, Check, Add } from "@mui/icons-material";

export const CustomTable = ({ alumnos, headers, data, defaultValues = [], options = [], keys, onSave = () =>{}, onError = () => {}, editable = false }) =>{
    const [alumnosState, setAlumnosState] = useState(JSON.parse(JSON.stringify(alumnos)));
    const [keysState, setKeysState] = useState([...keys]);
    const [headersState, setHeadersState] = useState([...headers]);
    const [dataState, setDataState] = useState(() => structuredClone(data));
    const [optionsState, setOptionsState] = useState(JSON.parse(JSON.stringify(options)));
    const [editingRows, setEditingRows] = useState([]);
    const [tempRowsValues, setTempRowsValues] = useState({});
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
        setDataState(structuredClone(data));
    }, [data]);

    useEffect(() => {
        const dataStateAlumnosCount = Object.keys(dataState).length;
        const dataAlumnosCount = Object.keys(data).length;

        if(dataAlumnosCount !== dataStateAlumnosCount) {
            setHasChanges(true);
            return;
        }

        if(!editable){
            setHasChanges(false);
            return;
        }

        const hasDifferences = Object.keys(dataState).some((alumno) => {
            const dataStateRow = dataState[alumno];
            const dataRow = data[alumno];

            const dataRowKeys = Object.keys(dataRow || {});
            const dataStateRowKeys = Object.keys(dataStateRow || {});

            if(dataRowKeys.length > dataStateRowKeys.length){
                const extraKeys = dataRowKeys.filter(key => !dataStateRowKeys.includes(key));
                extraKeys.forEach((key) => {
                    dataStateRow[key] = dataRow[key];
                });
            }

            if(!dataRow) return true;
            return keysState.some((key) => !dataRow[key.label] || dataRow[key.label].nota !== dataStateRow[key.label].nota);
        });

        setHasChanges(hasDifferences);
    }, [data, dataState, editable, keysState]);

    const handleEditRow = (alumno, disabled) => {
        if(disabled) return;

        if(editingRows && editingRows.includes(alumno)){
            const updatedData = JSON.parse(JSON.stringify(dataState));
            updatedData[alumno] = { ...updatedData[alumno], ...tempRowsValues[alumno] };
            setDataState(updatedData);
            setEditingRows(prev => prev.filter(r => r !== alumno));
            setTempRowsValues(prev => {
                const updatedTemp = { ...prev };
                delete updatedTemp[alumno];
                return updatedTemp;
            });

            const updatedAlumnos = [...alumnosState];
            const alumnoIndex = updatedAlumnos.findIndex(a => a.added && a.addedKey === alumno);
            if(alumnoIndex !== -1){
                updatedAlumnos[alumnoIndex].alumno = updatedData[alumno].alumno;
                setAlumnosState(updatedAlumnos);
            }
        }else{
            setEditingRows(prev => {
                if(prev.includes(alumno)) return prev.filter(r => r !== alumno);
                return [...prev, alumno];
            } );

            const tempKeysValues = {};
            keys.forEach((key) => {
                tempKeysValues[key] = dataState[alumno]?.[key] || "";
            });

            setTempRowsValues(prev => ({
                ...prev,
                [alumno]: { ...dataState[alumno],...tempKeysValues },
            }));
        }
    }

    const handleChange = (value, alumno, key) => {
        if(key === "alumno"){
            setTempRowsValues(prev => ({
                ...prev,
                [alumno]: {
                    ...prev[alumno],
                    alumno: value
                }
            }));

            const exists = alumnosState.some(a => a.alumno === value);
            if(exists){
                const alumnoRefIndex = alumnosState.findIndex(a => a.alumno === value);
                handleError(alumnoRefIndex, `El alumno "${value}" ya se encuentra en la tabla.`);
                handleDeleteRow(alumno);
            }
        }else{
            console.log("nota changed:", value);
            setTempRowsValues(prev => ({
                ...prev,
                [alumno]: {
                    ...prev[alumno],
                    [key]: {
                        nota: value,
                        id: dataState[alumno]?.[key]?.id || crypto.randomUUID()
                    }
                }
            }));
        }
    }

    const handleNotSavedChangesAdvice = () => {
        console.log("tempRowsValues before confirm modal:", tempRowsValues);
        if(tempRowsValues && Object.keys(tempRowsValues).length === 0){
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
        newRow.id = null;
        for(const defaultValue of Object.keys(defaultValues)) {
            if(defaultValue !== "alumnos"){
                newRow[defaultValue] = defaultValues[defaultValue];
            }
        }
        keys.forEach(key => {
            if(!(key.label in newRow)){
                newRow[key.label] = {
                    nota: "",
                    id: crypto.randomUUID()
                }
            }
        });
        newRow.added = true;

        const newAlumno = "";

        setAlumnosState([...alumnosState, { alumno: newAlumno, editable: true, added: true, addedKey: Object.keys(dataState).length }]);

        setDataState({...dataState, [Object.keys(dataState).length]: newRow });
        setHasChanges(true);
        handleEditRow(Object.keys(dataState).length);
    };

    const handleDeleteRow = (alumno) => {
        const updated = JSON.parse(JSON.stringify(dataState));
        delete updated[alumno];
        setDataState(updated);
        if(editingRows.includes(alumno)) setEditingRows(prev => prev.filter(r => r !== alumno));
        if(tempRowsValues[alumno]) {
            setTempRowsValues(prev => {
                const updatedTemp = { ...prev };
                delete updatedTemp[alumno];
                return updatedTemp;
            });
        }

        const updatedAlumnos = [...alumnosState];
        const filteredAlumnos = updatedAlumnos.filter(a => !a.addedKey || a.addedKey !== alumno);
        setAlumnosState(filteredAlumnos);
        closeConfirmModal();
    }

    const handleDeleteAlumnoAdvice = (alumno) => {
        setConfirmModal({
            open: true,
            title: "Confirmar eliminación",
            content: "¿Está seguro que quiere eliminar este registro? La acción no se puede deshacer",
            confirmLabel: "Eliminar",
            onConfirm: () => handleDeleteRow(alumno),
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

        if(keysState.some(k => k.label === tipo)){
            onError(`El tipo de calificación "${tipo}" ya existe en la tabla.`);
            setAddTipoCalificacionModalOpen(false);
            return;
        }

        setKeysState(prevKeys => [...prevKeys, { label: tipo, publicado: false }]);
        setHeadersState(prevHeaders => [...prevHeaders, { label: tipo, editable: true, deletable: true }]);
        const dataStateKeys = Object.keys(dataState);
        const updatedDataState = { ...dataState };
        if(Object.keys(updatedDataState).length === 0){
            alumnosState.forEach((alumno) => {
                updatedDataState[alumno.alumno] = {
                    id_alumno: alumno.id_alumno || defaultValues.id_alumno || defaultValues.alumnos.find(a => a.alumno === alumno.alumno)?.id_alumno || null,
                    id_curso: alumno.id_curso || defaultValues.id_curso || null,
                    id_materia: alumno.id_materia || defaultValues.id_materia || null,
                    [tipo]: { nota: "", id: crypto.randomUUID() }
                };
            });
        }
        dataStateKeys.forEach((key) => {
            updatedDataState[key] = {
                ...updatedDataState[key],
                [tipo]: { nota: "", id: crypto.randomUUID() }
            };
        });
        setDataState(updatedDataState);
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
        const updatedKeys = keysState.filter(k => k.label !== tipo);
        setKeysState(updatedKeys);
        const updatedHeaders = headersState.filter(h => h.label !== tipo);
        setHeadersState(updatedHeaders);
        const dataStateKeys = Object.keys(dataState);
        const updatedDataState = { ...dataState };
        dataStateKeys.forEach((key) => {
            const {[tipo]: _, ...rest} = updatedDataState[key];
            updatedDataState[key] = rest;
        });
        setDataState(updatedDataState);
        
        const updatedAlumnos = [...alumnosState];
        const leftNewHeaders = updatedHeaders.filter(h => h.deletable);

        if(leftNewHeaders.length === 0){
            updatedAlumnos.forEach((alumno) => {
                alumno.editable = alumnos.find(a => a.alumno === alumno.alumno)?.editable || false;
            });
        }

        if(updatedHeaders.length === 1){
            setDataState({});
        }
        setAlumnosState(updatedAlumnos);
        closeConfirmModal();
    }

    const handleSave = () => {
        const tempRowsKeys = Object.keys(tempRowsValues);
        const dataRowsKeys = Object.keys(dataState);

        const filteredData = {};

        dataRowsKeys.forEach((key) => {
            if(!tempRowsKeys.includes(key.toString())){
                filteredData[key] = dataState[key];
            }
        });

        const updatedRows = {};
        const filteredDataKeys = Object.keys(filteredData);

        const originalDataKeys = Object.keys(data);
        originalDataKeys.forEach((key) => {
            const dataRow = dataState[key];
            const originalRow = data[key];
            const originalTipoKeys = Object.keys(originalRow);
            originalTipoKeys.forEach((tipoKey) => {
                if(dataRow && originalRow && dataRow[tipoKey] && originalRow[tipoKey] && dataRow[tipoKey].id == originalRow[tipoKey].id && dataRow[tipoKey].nota !== originalRow[tipoKey].nota){
                    if(updatedRows[key] === undefined){
                        updatedRows[key] = {};
                    }
                    updatedRows[key].id_alumno = dataRow.id_alumno;
                    updatedRows[key].id_curso = dataRow.id_curso;
                    updatedRows[key].id_materia = dataRow.id_materia;
                    updatedRows[key][tipoKey] = dataRow[tipoKey];
                }
            });
        });

        if(!validateRequiredFields(updatedRows)) return;

        const newAddedRows = {};
        filteredDataKeys.forEach((key) => {
            const filterDataTipoCalificacionKeys = Object.keys(filteredData[key]).filter(k => headersState.some(header => header.label === k));
            const originalDataTipoCalificacionKeys = data[key] ? Object.keys(data[key]).filter(k => headersState.some(header => header.label === k)) : [];

            const newTipoCalificacion = filterDataTipoCalificacionKeys.filter(k => !originalDataTipoCalificacionKeys.includes(k));

            const newRow = {};
            newTipoCalificacion.forEach((tipo) => {
                if(newRow[key] === undefined){
                    newRow.id_alumno = dataState[key].id_alumno;
                    newRow.id_curso = dataState[key].id_curso;
                    newRow.id_materia = dataState[key].id_materia;
                }
                newRow[tipo] = dataState[key][tipo];
            });
            if(Object.keys(newRow).length > 0){
                newAddedRows[key] = { ...newAddedRows[key], ...newRow };
            }
        });

        if(!validateRequiredFields(newAddedRows)) return;
        const mappedAddedRows = {};
        const newAddedRowsKeys = Object.keys(newAddedRows);
        if(newAddedRowsKeys.length > 0) {
            newAddedRowsKeys.forEach((key) => {
                const mappedRow = { ...newAddedRows[key] };
                delete mappedRow.id;
                const nombreAlumno = alumnosState.find(a => (a.added && a.addedKey.toString() === key.toString()))?.alumno;
                mappedRow.id_alumno = optionsState.alumnos.find(a => a.label === nombreAlumno)?.id || newAddedRows[key].id_alumno || null;
                delete mappedRow.alumno;
                delete mappedRow.added;
                mappedAddedRows[key] = mappedRow;
            });
        }
        onSave(updatedRows, mappedAddedRows);
        setHasChanges(false);
    }

    const validateRequiredFields = (alumnosCalificaciones) => {
        const alumnosKeys = Object.keys(alumnosCalificaciones);
        const filteredAlumnosKeys = alumnosKeys.filter(alumnoKey => alumnosState.some(a => a.alumno === alumnoKey && (a.editable || a.creatable)));
        for (const alumnoKey of filteredAlumnosKeys) {
            const alumnoRefIndex = alumnosState.findIndex(
                a => a.alumno === alumnoKey || a.alumno === alumnosCalificaciones[alumnoKey].alumno
            );

            const calificacionKeys = Object.keys(alumnosCalificaciones[alumnoKey]).filter(key =>
                headersState.some(header => header.label === key)
            );

            for (const calificacionKey of calificacionKeys) {
                const nota = alumnosCalificaciones[alumnoKey][calificacionKey].nota;

                if (nota === "" || nota === null || nota === undefined) {
                    handleError(alumnoRefIndex, `El campo "${calificacionKey}" es obligatorio para el alumno "${alumnoKey}".`);
                    return false;
                }

                if (isNaN(nota)) {
                    handleError(alumnoRefIndex, `El campo "${calificacionKey}" debe ser un número válido para el alumno "${alumnoKey}".`);
                    return false;
                }

                const num = Number(nota);
                if (num < 1 || num > 10) {
                    handleError(alumnoRefIndex, `El campo "${calificacionKey}" debe estar entre 1 y 10 para el alumno "${alumnoKey}".`);
                    return false;
                }
            }
        }
        return true
    }

    const handleError = (rowIndex, message) => {
        const ref = rowRefs.current[rowIndex];
        if(ref && ref.scrollIntoView) {
            ref.scrollIntoView({ behavior: "smooth", block: "center" });
            ref.classList.add("row-error-pulse");
            setTimeout(() => ref.classList.remove("row-error-pulse"), 3000);
        }
        onError(message);
    }

    if(Object.keys(dataState).length === 0 && !editable) return null;

    //console.log("data:", data);
    //console.log("editingRows:", editingRows);
    //console.log("tempRowsValues:", tempRowsValues);
    //console.log("dataState:", dataState);
    //console.log("keysState:", keysState);
    //console.log("alumnos:", alumnos);
    //console.log("headers:", headers);
    //console.log("headersState:", headersState);
    //console.log("defaultValues:", defaultValues);
    //console.log("optionsState:", optionsState);

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
                    {(Object.keys(dataState).length !== 0  && optionsState.alumnos.length !== 0) && (
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
            {Object.keys(dataState).length !== 0 && (
                <Box sx={{ width: '100%', maxHeight: '400px', overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {headersState.map((header, index) => (
                                <TableCell key={index} align="center" sx={{backgroundColor: "#D9E2EF", minWidth: 150, maxWidth: 200}}>
                                    {header.deletable ? (
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                            {header.label}
                                            <Delete 
                                                sx={{ cursor: "pointer" }} 
                                                onClick={() => handleDeleteTipoCalificacionAdvice(header.label)} 
                                            />
                                        </Box>
                                    ):(
                                        header.label
                                    )}
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
                        {dataState && alumnosState.map((alumno, rowIndex) => (
                            <TableRow 
                                key={`alumno-${alumno.alumno}}`}
                                onKeyDown={(e) => {
                                    if(e.key === "Enter" && editingRows.includes(alumno.alumno)){
                                        handleEditRow(alumno.alumno);
                                    }
                                    if(e.key === "Enter" && alumno.added && editingRows.includes(alumno.addedKey)){
                                        handleEditRow(alumno.addedKey);
                                    }
                                }}
                                ref={el => rowRefs.current[rowIndex] = el}
                            >
                                <TableCell align="center">
                                    {(alumno.added && editingRows.includes(alumno.addedKey)) ? (
                                        <Select
                                            value={tempRowsValues[alumno.addedKey]?.alumno || dataState[alumno.addedKey]?.alumno || ""}
                                            variant="standard"
                                            size="small"
                                            onChange={(e) => handleChange(e.target.value , alumno.addedKey, 'alumno')}
                                            autoFocus
                                        >
                                            {optionsState.alumnos.map((option) => (
                                                <MenuItem key={option.id} value={option.label}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        alumno.alumno
                                    )}
                                </TableCell>
                                {keysState.map((key) => (
                                    <TableCell key={`nota-${key.label}-${rowIndex}`} align="center">
                                        {(editingRows.includes(alumno.alumno) && !dataState[alumno.alumno]?.[key.label]?.publicado && optionsState['current_alumnos'].some(option => option.label === alumno.alumno)) ? (
                                            <TextField
                                                value={tempRowsValues[alumno.alumno]?.[key.label]?.nota}
                                                type="number"
                                                onChange={(e) => handleChange(e.target.value , alumno.alumno, key.label)}
                                            />
                                        ) : (
                                            dataState[alumno.alumno]?.[key.label]?.nota
                                        )}
                                        {(editingRows.includes(alumno.addedKey) && !key.publicado) ? (
                                            <TextField
                                                value={tempRowsValues[alumno.addedKey]?.[key.label]?.nota}
                                                type="number"
                                                onChange={(e) => handleChange(e.target.value , alumno.addedKey, key.label)}
                                            />
                                        ) : (
                                            dataState[alumno.addedKey]?.[key.label]?.nota
                                        )}    
                                    </TableCell>
                                ))}
                                {editable &&
                                    <TableCell align="center">
                                        {alumno.added 
                                            ? editingRows.includes(alumno.addedKey) ? (
                                                <Check 
                                                    color="success"
                                                    onClick={() => handleEditRow(alumno.addedKey)}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            ) : (
                                                <Edit 
                                                    color="primary"
                                                    onClick={() => handleEditRow(alumno.addedKey)}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            )
                                    
                                            : editingRows.includes(alumno.alumno) ? (
                                                <Check 
                                                    color="success"
                                                    onClick={() => handleEditRow(alumno.alumno)}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            ) : (
                                                <Edit 
                                                    color={alumno.editable && editable ? "primary" : "disabled"}
                                                    onClick={() => handleEditRow(alumno.alumno, (!alumno.editable && !alumno.creatable) || !editable)}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            )
                                        } 
                                        {alumno.added &&
                                            <Delete 
                                                sx={{cursor: "pointer", marginLeft: 1}}
                                                onClick={() => handleDeleteAlumnoAdvice(alumno.addedKey)}
                                            />
                                        }
                                    </TableCell> 
                                }  
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