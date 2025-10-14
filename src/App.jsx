import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { theme } from './theme/theme';
import { CustomLayout } from './layout/CustomLayout';
import { AsistenciasRecientes } from './resources/asistencias/AsistenciasRecientes';

// IMPORTANTE: Importar tu UserProvider
import UserProvider from './contexts/UserContext/UserProvider';

// Tu página de login ACTUAL
import { Login } from './pages/Login';

// Importar recursos de react-admin
import {
  AsistenciasList,
  AsistenciasEdit,
  AsistenciasCreate,
  AsistenciasShow,
} from './resources/asistencias';

import {
  UsuariosList,
  UsuariosEdit,
  UsuariosCreate,
  UsuariosShow,
} from './resources/usuarios';

import { Dashboard } from './pages/Dashboard';

// Iconos
import { Today, School, Person, Class } from '@mui/icons-material';
import { RegistrarAsistencia } from './resources/asistencias/RegistrarAsistencia';
import { EliminarAsistencias } from './resources/asistencias/EliminarAsistencias';
import { AsistenciasHistorico } from './resources/asistencias/AsistenciasHistorico';
import { RolesAdmin } from './resources/roles/RolesAdmin';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      {/* Envolver TODO con UserProvider */}
      <UserProvider>
        <Routes>
          {/* Tu login actual */}
          <Route path="/login" element={<Login />} />

          {/* React-admin para el resto */}
          <Route
            path="/*"
            element={
              <Admin
                dataProvider={dataProvider}
                // authProvider={authProvider}
                theme={theme}
                layout={CustomLayout}
                dashboard={Dashboard}
                loginPage={false} // Usamos tu login
                requireAuth
              >
                {/* Recursos */}
                <Resource
                  name="asistencias"
                  list={AsistenciasList}
                  edit={AsistenciasEdit}
                  create={AsistenciasCreate}
                  show={AsistenciasShow}
                  icon={Today}
                  options={{ label: 'Asistencias' }}
                />

                <Resource
                  name="usuarios"
                  list={UsuariosList}
                  edit={UsuariosEdit}
                  create={UsuariosCreate}
                  show={UsuariosShow}
                  icon={Person}
                  options={{ label: 'Usuarios' }}
                />

                {/* Recursos auxiliares (sin vistas, solo para referencias) */}
                <Resource name="asistencia-estados" />
                <Resource name="alumnos" icon={School} />
                <Resource name="docentes" icon={Person} />
                <Resource name="cursos" icon={Class} />
                <Resource name="roles" />

                {/* Rutas personalizadas para módulos sin CRUD */}
                <CustomRoutes>
                  {/* Administración: rutas amigables que redirigen a los recursos */}
                  <Route path="/administracion/usuarios" element={<Navigate to="/usuarios" replace />} />
                  <Route path="/administracion/roles" element={<RolesAdmin initialTab={0} />} />
                  <Route path="/administracion/roles/modificar" element={<RolesAdmin initialTab={1} />} />
                  <Route path="/asistencias/recientes" element={<AsistenciasRecientes />} />
                  <Route path="/asistencias/registrar" element={<RegistrarAsistencia />} />
                  <Route path="/asistencias/historico" element={<AsistenciasHistorico />} />
                  <Route path="/asistencias/eliminar" element={<EliminarAsistencias />} />
                  <Route path="/notificaciones" element={<div>Notificaciones</div>} />
                  <Route path="/mensajes" element={<div>Mensajes</div>} />
                  <Route path="/informes" element={<div>Informes</div>} />
                  {/* Fallback 404 para rutas no encontradas dentro de Admin */}
                  <Route path="*" element={<NotFound />} />
                </CustomRoutes>
              </Admin>
            }
          />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
