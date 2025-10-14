import { useState, useEffect } from "react";
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
    MenuItem
} from "@mui/material";
import { Save, Edit, Add, Delete } from "@mui/icons-material";

export const CustomTable = ({ headers, dataArray, keys, onSave, onError, editable = true }) =>{
    const [data, setData] = useState(JSON.parse(JSON.stringify(dataArray)));
    const [editCell, setEditCell] = useState({ row: null, key: null });
    const [tempValue, setTempValue] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [addedRows, setAddedRows] = useState([]);
    const [deletedRows, setDeletedRows] = useState([]);

    useEffect(() => {
        setHasChanges(false);
        keys.forEach(key => {
            if(data.length > dataArray.length || data.length < dataArray.length || data.some((item, index) => item[key.key] !== dataArray[index][key.key])) {
                setHasChanges(true);
                return;
            }
        })

    }, [data, dataArray, keys]);

    const handleDoubleClick = (rowIndex, key) => {
        if(!key.editable && !editable) return;
        setEditCell({ row: rowIndex, key: key.key });
        setTempValue(data[rowIndex][key.key]);
    }
    
    const handleChange = (e) => {
        setTempValue(e.target.value);
    };

    const handleBlur = () => {
        const updated = [...data];
        updated[editCell.row][editCell.key] = tempValue;
        setData(updated);
        setEditCell({ row: null, key: null });
    };

    const handleSave = () => {
        if(!validateRequiredFields()) return;

        const updatedRows = data.map((item) => {
            if(item.id_calificacion){
                const change = keys.some((key) => {
                    const originalItem = dataArray.find(d => d.id_calificacion === item.id_calificacion);
                    if(!originalItem) return false;
                    return originalItem[key.key] !== item[key.key];
                })

                if(change) return item;
                return null;
            }else{
                return null;
            }
        }).filter(item => item !== null);

        const newAddedRows = data.filter(item => !item.id_calificacion);
        
        if(newAddedRows.length > 0) {
            newAddedRows.map(row => {
                keys.forEach(key => {
                    if(key.type === "select" && key.options){
                        const selectedOption = key.options.find(option => option.label === row[key.key]);
                        if(selectedOption) row[key.key] = selectedOption.id;
                    }
                });
            })
            setAddedRows(newAddedRows);
        }

        console.log("Updated Rows:", updatedRows);
        console.log("Added Rows:", newAddedRows);
        console.log("Deleted Rows:", deletedRows);

        onSave(updatedRows, newAddedRows, deletedRows);
        setHasChanges(false);
    }

    const handleAddRow = () => {
        const newRow = {};
        keys.forEach((key) => (newRow[key.key] = key.default ? key.default : ""));
        setData([...data, newRow]);
        //setAddedRows([...addedRows, newRow]);
        setHasChanges(true);
    };

    const handleDeleteRow = (rowIndex) => {
        if(rowIndex < dataArray.length){
            const res = confirm(`¿Estás seguro de eliminar este registro?`);
            if(!res) return;
            setDeletedRows([...deletedRows, data[rowIndex]]);
            const updated = data.filter((_, index) => index !== rowIndex);
            setData(updated);
            setHasChanges(true);
        }else{
            const updated = data.filter((_, index) => index !== rowIndex);
            setData(updated);
            setHasChanges(true);
        }
    }

    const validateRequiredFields = () => {
        for (let row of addedRows) {
            for (let key of keys) {
                if (key.required && (!row[key.key] || row[key.key].toString().trim() === "")) {
                    onError(`El campo "${key.key}" es obligatorio.`);
                    return false;
                }

                if(key.type === "number") {
                    const value = parseFloat(row[key.key]);
                    if(isNaN(value)) {
                        onError(`El campo "${key.key}" debe ser un número.`);
                        return false;
                    }
                    if(value < 1 || value > 10) {
                        onError(`El campo "${key.key}" debe estar entre 1 y 10.`);
                        return false;
                    }
                }

                if(key.type === "select" && key.options){
                    const isValidOption = key.options.some(option => option.label === row[key.key]);
                    if(!isValidOption){
                        onError(`El campo "${key.key}" tiene un valor inválido.`);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    return (
        <Box>
            <Table>
                <TableHead>
                    <TableRow >
                        {headers.map((header, index) => (
                            <TableCell key={index} align="center" sx={{backgroundColor: "#D9E2EF"}}>
                                {header.editable 
                                    ? 
                                        <>
                                            {header.label} <Edit sx={{verticalAlign: "middle", fontSize: "16px"}} />
                                        </> 
                                    : header.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            {keys.map((key) => (
                                <TableCell key={key.key} align="center" onDoubleClick={() => handleDoubleClick(index, key)} sx={{ cursor: 'pointer' }}>
                                    {editCell.row === index && editCell.key === key.key && key.type !== "select" ? (
                                        <TextField
                                            value={tempValue}
                                            type={key.type || "text"}
                                            slotProps={{
                                                input: {
                                                    step: "0.01", 
                                                    min: "1",       
                                                    max: "10"       
                                                }
                                            }}
                                            onChange={handleChange}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleBlur(); 
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            variant="standard"
                                            size="small"
                                            autoFocus
                                        />
                                        ) : editCell.row === index && editCell.key === key.key && key.type === "select" ? (
                                        <Select
                                            value={tempValue}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="standard"
                                            size="small"
                                            autoFocus
                                        >
                                            {key.options.map((option) => (
                                                <MenuItem key={option.id} value={option.label}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        item[key.key]
                                    )}
                                </TableCell>
                            ))}
                            {editable &&
                                <TableCell align="center">
                                    <Delete
                                        sx={{ cursor: 'pointer', color: 'red' }}
                                        onClick={() => {
                                            handleDeleteRow(index);
                                        }}
                                    />
                                </TableCell>
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {editable && 
                <Box 
                    onClick={handleAddRow} 
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1, cursor: "pointer", color: "#1976d2", backgroundColor: "#D9E2EF", paddingTop: 1, paddingBottom: 1 }}
                >
                    <Add />
                </Box>
            }
            {hasChanges &&
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{mt: 2}}
                    onClick={handleSave}
                >
                    Guardar Cambios
                </Button>
            }
        </Box>
    );
}