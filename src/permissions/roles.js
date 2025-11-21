// Centralized role permissions mapping and helpers

// Actions: list, show, create, edit, delete
const resourcePerms = (overrides = {}) => ({
  list: false,
  show: false,
  create: false,
  edit: false,
  delete: false,
  ...overrides,
});

export const ROLE_PERMISSIONS = {
  admin: {
    resources: {
      asistencias: resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      'ciclos-lectivos': resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      usuarios: resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      alumnos: resourcePerms({ list: true, show: true }),
      docentes: resourcePerms({ list: true, show: true }),
      cursos: resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      materias: resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      'docentes-materias-curso': resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      roles: resourcePerms({ list: true, show: true }),
      'asistencia-estados': resourcePerms({ list: true, show: true }),
      'auxiliares-curso': resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
    },
    routes: new Set([
      '/administracion/roles',
      '/administracion/roles/modificar',
      '/administracion/usuarios',
      '/gestion-academica/ciclos-lectivos',
      '/gestion-academica/cursos',
      '/gestion-academica/materias',
      '/gestion-academica/asignar-docentes',
      '/gestion-academica/asignar-cursos',
      '/gestion-academica/cambiar-curso',
      '/gestion-academica/designar-cargos',
      '/asistencias/recientes',
      '/asistencias/registrar',
      '/asistencias/historico',
      '/asistencias/eliminar',
      '/notificaciones',
      '/mensajes',
      '/informes',
      '/calificaciones',
      '/informes-pedagogicos',
      '/justificativos/validar',
      '/justificativos/cargar',
      '/rendimiento/cursos',
      '/rendimiento/alumnos',
      '/rendimiento/alertas',
    ]),
    menu: new Set([
      'usuarios',
      'roles',
      'asistencias-registrar',
      'asistencias-recientes',
      'asistencias-historico',
      'asistencias-eliminar',
      'notificaciones',
      'mensajes',
      'informes',
      'calificaciones',
      'administracion',
      'ciclos-lectivos',
      'cursos',
      'materias',
      'asignar-docentes',
      'asignar-cursos',
      'cambiar-curso',
      'designar-cargos',
      'informes-pedagogicos',
      'justificativos-validar',
      'justificativos-cargar',
      'rendimiento',
      'rendimiento-cursos',
      'rendimiento-alumnos',
      'rendimiento-alertas',
    ]),
  },

  director: {
    resources: {
      asistencias: resourcePerms({ list: true, show: true }),
      alumnos: resourcePerms({ list: true, show: true }),
      docentes: resourcePerms({ list: true, show: true }),
      'docentes-materias-curso': resourcePerms({ list: true, show: true }),
      'asistencia-estados': resourcePerms({ list: true, show: true }),
    },
    routes: new Set([
      '/asistencias/recientes',
      '/asistencias/historico',
      '/calificaciones',
      '/rendimiento/cursos',
      '/rendimiento/alumnos',
      '/rendimiento/alertas',
      '/gestion-academica/cursos',
      '/gestion-academica/asignar-cursos',
      '/gestion-academica/cambiar-curso',
    ]),
    menu: new Set([
      'asistencias-recientes',
      'asistencias-historico',
      'calificaciones',
      'rendimiento',
      'rendimiento-cursos',
      'rendimiento-alumnos',
      'rendimiento-alertas',
      'cursos',
      'asignar-cursos',
      'cambiar-curso',
    ]),
  },

  auxiliar: {
    resources: {
      asistencias: resourcePerms({ list: true, show: true, create: true, edit: true, delete: true }),
      alumnos: resourcePerms({ list: true, show: true }),
      docentes: resourcePerms({ list: true, show: true }),
      'docentes-materias-curso': resourcePerms({ list: true, show: true }),
      'asistencia-estados': resourcePerms({ list: true, show: true }),
    },
    routes: new Set([
      '/asistencias/recientes',
      '/asistencias/registrar',
      '/asistencias/historico',
      '/asistencias/eliminar',
      '/gestion-academica/cursos',
      '/gestion-academica/asignar-cursos',
      '/gestion-academica/cambiar-curso',
      '/justificativos/validar',
      '/rendimiento/cursos',
      '/rendimiento/alumnos',
      '/rendimiento/alertas',
    ]),
    menu: new Set([
      'asistencias-recientes',
      'asistencias-registrar',
      'asistencias-historico',
      'asistencias-eliminar',
      'cursos',
      'asignar-cursos',
      'cambiar-curso',
      'justificativos-validar',
      'rendimiento',
      'rendimiento-cursos',
      'rendimiento-alumnos',
      'rendimiento-alertas',
    ]),
  },

  docente: {
    resources: {
      asistencias: resourcePerms({ list: true, show: true }),
      alumnos: resourcePerms({ list: true, show: true }),
      'asistencia-estados': resourcePerms({ list: true, show: true }),
    },
    routes: new Set([
      '/asistencias/recientes',
      '/asistencias/historico',
      '/calificaciones',
      '/rendimiento/cursos',
      '/rendimiento/alumnos',
    ]),
    menu: new Set([
      'asistencias-recientes',
      'asistencias-historico',
      'calificaciones',
      'rendimiento',
      'rendimiento-cursos',
      'rendimiento-alumnos',
    ]),
  },

  alumno: {
    resources: {
      // No resources in backoffice by default
    },
    routes: new Set([
      '/notificaciones',
      '/mensajes',
      // Optional: add custom route like '/mis-asistencias' if exists
    ]),
    menu: new Set([
      'notificaciones',
      'mensajes',
    ]),
  },

  tutor: {
    resources: {

    },
    routes: new Set([
      '/notificaciones',
      '/mensajes',
      '/calificaciones/hijos',
      '/justificativos/cargar',
      '/rendimiento/hijos',
    ]),
    menu: new Set([
      'notificaciones',
      'mensajes',
      'calificaciones-hijos',
      'justificativos-cargar',
      'rendimiento',
      'rendimiento-hijos',
    ]) 
  },

  asesor_pedagogico: {
    resources: {

    },
    routes: new Set([
      '/informes-pedagogicos',
    ]),
    menu: new Set([
      'informes-pedagogicos',
    ])
  }
};

export const getRole = (permissions) => {
  if (!permissions) return undefined;
  return String(permissions).toLowerCase();
};

export const allowResource = (role, name, action = 'list') => {
  const r = ROLE_PERMISSIONS[role]?.resources?.[name];
  if (!r) return false;
  return !!r[action];
};

export const allowRoute = (role, path) => {
  return !!ROLE_PERMISSIONS[role]?.routes?.has(path);
};

export const allowMenu = (role, menuId) => {
  return !!ROLE_PERMISSIONS[role]?.menu?.has(menuId);
};
