import { useState } from "react";
import { 
    Tabs,
    Tab
} from "@mui/material";
import { CalificacionesPorAlumno } from "./CalificacionesPorAlumno";
import { CalificacionesPorCurso } from "./CalificacionesPorCurso";

export const Calificaciones = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    }

    return (
        <>
        <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            sx={{mb: 2}}
        >
            <Tab label="Por Alumno" />
            <Tab label="Por Curso" />
        </Tabs>
            
        {tabIndex === 0 && <CalificacionesPorAlumno />}
        {tabIndex === 1 && <CalificacionesPorCurso />}
        </>
    )
}