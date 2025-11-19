import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { DocentesMateriasCursoList } from '../docentesMateriasCurso/index';
import { AuxiliaresList } from '../auxiliares';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';

export const DesignarCargos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialTab = location.pathname.includes('auxiliares') ? 1 : 0;
    const [tab, setTab] = useState(initialTab);

    const BASE_PATH = '/gestion-academica/designar-cargos';

    const handleTabChange = (_, newValue) => {
        navigate(`${BASE_PATH}/${newValue === 0 ? 'docentes' : 'auxiliares'}`);
        setTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Designar docentes" />
            <Tab label="Designar auxiliares" />
        </Tabs>

        <Routes>
            <Route path="docentes" element={<DocentesMateriasCursoList />} />
            <Route path="auxiliares" element={<AuxiliaresList />} />
            <Route path="*" element={<DocentesMateriasCursoList />} /> {/* fallback */}
        </Routes>
        </Box>
    );


    // return (
    //     <Box sx={{ width: '100%' }}>
    //         <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
    //             <Tab label="Designar docentes" />
    //             <Tab label="Designar auxiliares" />
    //         </Tabs>

    //         <Box hidden={tab !== 0}>
    //             {tab === 0 && <AuxiliaresList />}
    //         </Box>
    //         <Box hidden={tab !== 1}>
    //             {tab === 1 && <DocentesMateriasCursoList />}
    //         </Box>
    //     </Box>
    // );
};