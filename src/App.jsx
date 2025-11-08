import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { useEffect } from 'react';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { theme } from './theme/theme';
import { CustomLayout } from './layout/CustomLayout';
import { AsistenciasRecientes } from './resources/asistencias/AsistenciasRecientes';
import { Calificaciones } from './resources/calificaciones/Calificaciones';
import { CalificacionesHijos } from './resources/calificaciones/CalificacionesHijos';
import { JustificativosHijos } from './resources/justificativos/JustificativosHijos';

// Contexto de usuario
import UserProvider from './contexts/UserContext/UserProvider';
import useUser from './contexts/UserContext/useUser';

// Login
import { Login } from './pages/Login';

// Recursos RA
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

import { InformesPedagogicos } from './resources/pedagogia/InformesPedagogicos';

// Iconos
import { Today, School, Person, Class, CalendarMonth } from '@mui/icons-material';
import { CiclosLectivosList, CiclosLectivosEdit, CiclosLectivosCreate, CiclosLectivosShow } from './resources/ciclosLectivos';
import { CursosList, CursosEdit, CursosCreate, CursosShow } from './resources/cursos';
import { MateriasList, MateriasEdit, MateriasCreate, MateriasShow } from './resources/materias';
import { DocentesMateriasCursoList, DocentesMateriasCursoEdit, DocentesMateriasCursoCreate, DocentesMateriasCursoShow } from './resources/docentesMateriasCurso';
import { RegistrarAsistencia } from './resources/asistencias/RegistrarAsistencia';
import { EliminarAsistencias } from './resources/asistencias/EliminarAsistencias';
import { AsistenciasHistorico } from './resources/asistencias/AsistenciasHistorico';
import { RolesAdmin } from './resources/roles/RolesAdmin';
import { AsignarCursos } from './resources/alumnos/AsignarCursos';
import { CambiarCurso } from './resources/alumnos/CambiarCurso';
import { NotFound } from './pages/NotFound';
import { NoAccess } from './pages/NoAccess';
import { getRole, allowResource, allowRoute } from './permissions/roles';

// Redirecciona a /no-access si hay sesión pero no tiene rol
const RoleRedirector = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const token = sessionStorage.getItem('access_token');
      const role = user?.rol || sessionStorage.getItem('permissions');
      const path = location.pathname || '/';
      if (token && !role && path !== '/no-access' && path !== '/login') {
        navigate('/no-access', { replace: true });
      }
    } catch {}
  }, [user, location.pathname, navigate]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <RoleRedirector />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-access" element={<NoAccess />} />

          <Route
            path="/*"
            element={
              <Admin
                dataProvider={dataProvider}
                authProvider={authProvider}
                theme={theme}
                layout={CustomLayout}
                dashboard={Dashboard}
                loginPage={false}
                requireAuth
              >
                {(permissions) => {
                  const role = getRole(permissions);
                  console.log('Current role:', role);
                  return (
                    <>
                      {/* Asistencias */}
                      {allowResource(role, 'asistencias', 'list') && (
                        <Resource
                          name="asistencias"
                          list={AsistenciasList}
                          edit={allowResource(role, 'asistencias', 'edit') ? AsistenciasEdit : undefined}
                          create={allowResource(role, 'asistencias', 'create') ? AsistenciasCreate : undefined}
                          show={allowResource(role, 'asistencias', 'show') ? AsistenciasShow : undefined}
                          icon={Today}
                          options={{ label: 'Asistencias' }}
                        />
                      )}

                      {/* Usuarios */}
                      {allowResource(role, 'usuarios', 'list') && (
                        <Resource
                          name="usuarios"
                          list={UsuariosList}
                          edit={allowResource(role, 'usuarios', 'edit') ? UsuariosEdit : undefined}
                          create={allowResource(role, 'usuarios', 'create') ? UsuariosCreate : undefined}
                          show={allowResource(role, 'usuarios', 'show') ? UsuariosShow : undefined}
                          icon={Person}
                          options={{ label: 'Usuarios' }}
                        />
                      )}

                      {/* Recursos auxiliares para referencias */}
                      <Resource name="asistencia-estados" />
                      <Resource name="alumnos" icon={School} />
                      <Resource name="docentes" icon={Person} />
                      <Resource
                        name="cursos"
                        list={allowResource(role, 'cursos', 'list') ? CursosList : undefined}
                        edit={allowResource(role, 'cursos', 'edit') ? CursosEdit : undefined}
                        create={allowResource(role, 'cursos', 'create') ? CursosCreate : undefined}
                        show={allowResource(role, 'cursos', 'show') ? CursosShow : undefined}
                        icon={Class}
                        options={{ label: 'Cursos' }}
                      />

                      {/* Gestión académica */}
                      {allowResource(role, 'ciclos-lectivos', 'list') && (
                        <Resource
                          name="ciclos-lectivos"
                          list={CiclosLectivosList}
                          edit={allowResource(role, 'ciclos-lectivos', 'edit') ? CiclosLectivosEdit : undefined}
                          create={allowResource(role, 'ciclos-lectivos', 'create') ? CiclosLectivosCreate : undefined}
                          show={allowResource(role, 'ciclos-lectivos', 'show') ? CiclosLectivosShow : undefined}
                          icon={CalendarMonth}
                          options={{ label: 'Ciclos lectivos' }}
                        />
                      )}

                      {/* Materias */}
                      {allowResource(role, 'materias', 'list') && (
                        <Resource
                          name="materias"
                          list={MateriasList}
                          edit={allowResource(role, 'materias', 'edit') ? MateriasEdit : undefined}
                          create={allowResource(role, 'materias', 'create') ? MateriasCreate : undefined}
                          show={allowResource(role, 'materias', 'show') ? MateriasShow : undefined}
                          icon={School}
                          options={{ label: 'Materias' }}
                        />
                      )}

                      {/* Asignaciones Docente-Materia-Curso */}
                      {allowResource(role, 'docentes-materias-curso', 'list') && (
                        <Resource
                          name="docentes-materias-curso"
                          list={DocentesMateriasCursoList}
                          edit={allowResource(role, 'docentes-materias-curso', 'edit') ? DocentesMateriasCursoEdit : undefined}
                          create={allowResource(role, 'docentes-materias-curso', 'create') ? DocentesMateriasCursoCreate : undefined}
                          show={allowResource(role, 'docentes-materias-curso', 'show') ? DocentesMateriasCursoShow : undefined}
                          options={{ label: 'Designar Docentes' }}
                        />
                      )}

                      {/* Roles metadata solo si aplica */}
                      {allowResource(role, 'roles', 'list') && <Resource name="roles" />}
                      {/* recurso 'docentes-sin-asignacion' eliminado */}
                      <CustomRoutes>
                        {allowRoute(role, '/administracion/usuarios') && (
                          <Route path="/administracion/usuarios" element={<Navigate to="/usuarios" replace />} />
                        )}
                        {allowRoute(role, '/gestion-academica/ciclos-lectivos') && (
                          <Route path="/gestion-academica/ciclos-lectivos" element={<Navigate to="/ciclos-lectivos" replace />} />
                        )}
                        {allowRoute(role, '/gestion-academica/cursos') && (
                          <Route path="/gestion-academica/cursos" element={<Navigate to="/cursos" replace />} />
                        )}
                        {allowRoute(role, '/gestion-academica/materias') && (
                          <Route path="/gestion-academica/materias" element={<Navigate to="/materias" replace />} />
                        )}
                        {allowRoute(role, '/gestion-academica/asignar-docentes') && (
                          <Route path="/gestion-academica/asignar-docentes" element={<Navigate to="/docentes-materias-curso" replace />} />
                        )}
                        {/* ruta 'docentes-sin-asignacion' eliminada */}
                        {allowRoute(role, '/gestion-academica/asignar-cursos') && (
                          <Route path="/gestion-academica/asignar-cursos" element={<AsignarCursos />} />
                        )}
                        {allowRoute(role, '/gestion-academica/cambiar-curso') && (
                          <Route path="/gestion-academica/cambiar-curso" element={<CambiarCurso />} />
                        )}
                        {allowRoute(role, '/administracion/roles') && (
                          <Route path="/administracion/roles" element={<RolesAdmin initialTab={0} />} />
                        )}
                        {allowRoute(role, '/administracion/roles/modificar') && (
                          <Route path="/administracion/roles/modificar" element={<RolesAdmin initialTab={1} />} />
                        )}
                        {allowRoute(role, '/asistencias/recientes') && (
                          <Route path="/asistencias/recientes" element={<AsistenciasRecientes />} />
                        )}
                        {allowRoute(role, '/asistencias/registrar') && (
                          <Route path="/asistencias/registrar" element={<RegistrarAsistencia />} />
                        )}
                        {allowRoute(role, '/asistencias/historico') && (
                          <Route path="/asistencias/historico" element={<AsistenciasHistorico />} />
                        )}
                        {allowRoute(role, '/asistencias/eliminar') && (
                          <Route path="/asistencias/eliminar" element={<EliminarAsistencias />} />
                        )}
                        {allowRoute(role, '/calificaciones') && (
                          <Route path="/calificaciones" element={<Calificaciones />} />
                        )}
                        {allowRoute(role, '/calificaciones/hijos') && (
                          <Route path="/calificaciones/hijos" element={<CalificacionesHijos />} />
                        )}
                        {allowRoute(role, '/informes-pedagogicos') && (
                          <Route path="/informes-pedagogicos" element={<InformesPedagogicos />} />
                        )}
                        {allowRoute(role, '/justificativos/hijos') && (
                          <Route path="/justificativos/hijos" element={<JustificativosHijos />} />
                        )}
                        {allowRoute(role, '/notificaciones') && (
                          <Route path="/notificaciones" element={<div>Notificaciones</div>} />
                        )}
                        {allowRoute(role, '/mensajes') && (
                          <Route path="/mensajes" element={<div>Mensajes</div>} />
                        )}
                        {allowRoute(role, '/informes') && (
                          <Route path="/informes" element={<div>Informes</div>} />
                        )}
                        <Route path="*" element={<NotFound />} />
                      </CustomRoutes>
                    </>
                  );
                }}
              </Admin>
            }
          />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

