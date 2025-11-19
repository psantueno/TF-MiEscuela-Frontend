import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';
import { api } from "../services/api"
import { get } from 'react-hook-form';

const API_URL = 'http://localhost:6543/api';

const ENABLE_HTTP_LOGS = false;
const ENABLE_DP_LOGS = false;
const dlog = (...args) => { if (ENABLE_HTTP_LOGS || ENABLE_DP_LOGS) { try { console.log(...args); } catch {} } };

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  const csrfToken = sessionStorage.getItem('csrf_token');
  const accessToken = sessionStorage.getItem('access_token');
  const refreshToken = sessionStorage.getItem('refresh_token');

  if (csrfToken) {
    options.headers.set('X-CSRF-Token', csrfToken);
  }
  if (accessToken) {
    options.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (refreshToken) {
    options.headers.set('X-Refresh-Token', refreshToken);
  }

  options.credentials = 'include';

  try {
    if (ENABLE_HTTP_LOGS) {
      const method = options?.method || 'GET';
      const previewBody = (() => {
        try { return options?.body ? JSON.stringify(JSON.parse(options.body)).slice(0, 400) : undefined; } catch { return String(options?.body).slice(0, 200); }
      })();
      dlog(`[HTTP] ${method} ${url}`, previewBody ? `body: ${previewBody}` : '');
    }
  } catch {}
  return fetchUtils.fetchJson(url, options).then((res) => {
    try {
      if (ENABLE_HTTP_LOGS) {
        const cr = res.headers?.get?.('Content-Range');
        const size = Array.isArray(res.json) ? res.json.length : (res.json?.data?.length ?? 'n/a');
        dlog('[HTTP RES]', res.status, url, 'Content-Range:', cr || 'none', 'items:', size);
      }
    } catch {}
    return res;
  });
};


export const dataProvider = {
  // Normaliza el campo id según el recurso
  _mapId(resource, item) {
    switch (resource) {
      case 'cursos':
        {
          const v = item.id_curso ?? item.id;
          const n = Number(v);
          return Number.isNaN(n) ? v : n;
        }
      case 'ciclos-lectivos':
        {
          const v = item.id_ciclo ?? item.id;
          const n = Number(v);
          return Number.isNaN(n) ? v : n;
        }
      case 'asistencias':
        return item.id_asistencia ?? item.id;
      case 'alumnos':
        return item.id_alumno ?? item.id;
      case 'docentes':
        return item.id_docente ?? item.id;
      case 'roles':
        return item.id_rol ?? item.id;
      case 'usuarios':
        return item.id_usuario ?? item.id;
      case 'materias':
        return item.id_materia ?? item.id;
      case 'materias-curso':
        return item.id_materia_curso ?? item.id;
      case 'docentes-materias-curso':
        // backend expone id sintético string
        return `${item.id_docente}:${item.id_materia_curso}:${item.fecha_inicio}`;
      case 'auxiliares-curso':
        return `${item.id_auxiliar}:${item.curso.id_curso}:${item.fecha_inicio}`;
      case 'auxiliares':
        return item.id_auxiliar ?? item.id;
      default:
        return item.id;
    }
  },
  getList: (resource, params) => {
    // Recurso especial con RA Simple REST (_start/_end/_sort/_order & filter JSON)
    if (resource === 'docentes-materias-curso') {
      const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
      const rangeStart = (page - 1) * perPage;
      const rangeEnd = page * perPage - 1;
      const { field, order } = params.sort || {};
      const rawFilter = params.filter || {};
      // Limpia valores vacíos ('', null, undefined) para evitar where con NaN o strings vacías
      const baseFilter = Object.fromEntries(
        Object.entries(rawFilter).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const { numero_documento, id_ciclo, ...restFilter } = baseFilter;

      const buildAndRequest = async () => {
        let effectiveFilter = { ...restFilter };

        // Si filtra por DNI, resolvemos ids de docentes primero
        if (numero_documento) {
          const docentesUrl = `${API_URL}/docentes?${new URLSearchParams({
            filter: JSON.stringify({ numero_documento })
          }).toString()}`;
          const { json: docentesJson } = await httpClient(docentesUrl);
          const docentesArr = Array.isArray(docentesJson) ? docentesJson : (docentesJson?.data ?? []);
          const docenteIds = docentesArr.map(d => d.id_docente ?? d.id).filter(Boolean);
          if (!docenteIds.length) {
            return { data: [], total: 0 };
          }
          // soporta tanto único id como lista
          effectiveFilter.id_docente = docenteIds.length === 1 ? docenteIds[0] : docenteIds;
        }

        // Si filtra por ciclo, resolvemos ids de materias-curso del ciclo (cursos -> materias-curso)
        if (id_ciclo) {
          // 1) obtener cursos del ciclo
          const cursosUrl = `${API_URL}/cursos?${new URLSearchParams({ id_ciclo }).toString()}`;
          const { json: cursosJson } = await httpClient(cursosUrl);
          const cursosArr = Array.isArray(cursosJson) ? cursosJson : (cursosJson?.data ?? []);
          const cursoIds = cursosArr.map(c => c.id_curso ?? c.id).filter(Boolean);
          if (!cursoIds.length) {
            return { data: [], total: 0 };
          }
          // 2) obtener materias-curso de esos cursos
          const mcUrl = `${API_URL}/materias-curso?${new URLSearchParams({
            filter: JSON.stringify({ id_curso: cursoIds })
          }).toString()}`;
          const { json: mcJson } = await httpClient(mcUrl);
          const mcArr = Array.isArray(mcJson) ? mcJson : (mcJson?.data ?? []);
          const mcIds = mcArr.map(m => m.id_materia_curso ?? m.id).filter(Boolean);
          if (!mcIds.length) {
            return { data: [], total: 0 };
          }
          effectiveFilter.id_materia_curso = mcIds.length === 1 ? mcIds[0] : mcIds;
        }

        try { if (ENABLE_DP_LOGS) dlog('[DP][getList] docentes-materias-curso', { page, perPage, sort: { field, order }, filter: effectiveFilter }); } catch {}

        const qs = new URLSearchParams({
          _start: String(rangeStart),
          _end: String(rangeEnd + 1),
          ...(field ? { _sort: field } : {}),
          ...(order ? { _order: order } : {}),
          filter: JSON.stringify(effectiveFilter),
        }).toString();
        const url = `${API_URL}/${resource}?${qs}`;
        const { json, headers } = await httpClient(url);
        const raw = Array.isArray(json) ? json : (json?.data ?? []);
        const contentRange = headers?.get?.('Content-Range') || headers?.get?.('content-range');
        const headerTotal = contentRange ? parseInt(String(contentRange).split('/').pop(), 10) : undefined;
        let total = headerTotal ?? (json?.total ?? raw.length ?? 0);
        if (Array.isArray(raw) && typeof headerTotal === 'number' && raw.length > headerTotal) {
          total = raw.length;
        }
        return {
          data: raw.map(item => ({ ...item, id: dataProvider._mapId(resource, item) })),
          total,
        };
      };

      return buildAndRequest();
    }
    // Recursos con soporte de _start/_end y Content-Range
    if (resource === 'docentes' || resource === 'materias-curso') {
      const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
      const rangeStart = (page - 1) * perPage;
      const rangeEnd = page * perPage - 1;
      const { field, order } = params.sort || {};
      const filter = params.filter || {};
      // Pasar id_ciclo (si viene) como query directo para backend RA
      // id_curso queda dentro del filter JSON (el backend acepta arrays)
      const passthrough = {};
      if (filter.id_ciclo !== undefined && filter.id_ciclo !== null && filter.id_ciclo !== '') {
        passthrough.id_ciclo = filter.id_ciclo;
      }
      if (false && filter.id_curso !== undefined && filter.id_curso !== null && filter.id_curso !== '') {
        // Nota: backend espera un único id_curso; si viene array, lo ignoramos aquí
        if (!Array.isArray(filter.id_curso)) passthrough.id_curso = filter.id_curso;
      }
      const filterJson = Object.keys(filter || {}).length ? { filter: JSON.stringify(filter) } : {};
      const qs = new URLSearchParams({
        _start: String(rangeStart),
        _end: String(rangeEnd + 1),
        ...(field ? { _sort: field } : {}),
        ...(order ? { _order: order } : {}),
        ...filterJson,
        ...passthrough,
      }).toString();
      const url = `${API_URL}/${resource}?${qs}`;
      return httpClient(url).then(({ json, headers }) => {
        let raw = Array.isArray(json) ? json : (json?.data ?? []);
        const contentRange = headers?.get?.('Content-Range') || headers?.get?.('content-range');
        let total = contentRange ? parseInt(String(contentRange).split('/').pop(), 10) : (json?.total ?? raw.length ?? 0);
        // Tras el filtrado defensivo, priorizamos la cantidad efectiva
        if (Array.isArray(raw) && typeof total === 'number') {
          total = raw.length;
        }
        return {
          data: raw.map(item => ({ ...item, id: dataProvider._mapId(resource, item) })),
          total,
        };
      });
    }
    const { page, perPage } = params.pagination;

    const { filter } = params;

    // Cursos: usar getList por defecto (sin caso especial). Si se requiere lógica
    // particular, utilice un método custom del dataProvider (p.ej., getCursosPorRol).

    // Soporte especial para el recurso virtual 'usuarios-sin-rol'
    if (resource === 'usuarios-sin-rol') {
      const { field, order } = params.sort || {};
      const queryUSR = new URLSearchParams({
        page,
        perPage,
        ...(field ? { sort: field } : {}),
        ...(order ? { order } : {}),
        nombre_completo: filter.nombre_completo || '',
        apellido: filter.apellido || '',
        nombre: filter.nombre || '',
        numero_documento: filter.numero_documento || '',
        dni: filter.numero_documento || '',
      }).toString();
      const urlUSR = `${API_URL}/usuarios/sin-rol?${queryUSR}`;
      return httpClient(urlUSR).then(({ json }) => ({
        data: (json.data || json).map(item => ({
          ...item,
          id: item.id_usuario || item.id,
        })),
        total: json.total,
      }));
    }

    // Recurso virtual para 'usuarios-con-rol'
    if (resource === 'usuarios-con-rol') {
      const { field, order } = params.sort;
      const queryUCR = new URLSearchParams({
        page,
        perPage,
        sort: field,
        order: order,
        apellido: filter.apellido || '',
        nombre: filter.nombre || '',
        numero_documento: filter.numero_documento || '',
        id_rol: filter.id_rol || '',
      }).toString();
      const urlUCR = `${API_URL}/usuarios/con-rol?${queryUCR}`;
      return httpClient(urlUCR).then(({ json }) => ({
        data: (json.data || json).map(item => ({
          ...item,
          id: item.id_usuario || item.id,
        })),
        total: json.total,
      }));
    }

    // Recurso virtual para 'alumnos-sin-curso'
    if (resource === 'alumnos-sin-curso') {
      const { field, order } = params.sort || {};
      const queryASC = new URLSearchParams({
        page,
        perPage,
        ...(field ? { sort: field } : {}),
        ...(order ? { order } : {}),
        apellido: filter?.apellido || '',
        nombre: filter?.nombre || '',
        numero_documento: filter?.numero_documento || '',
        ...(filter?.id_ciclo ? { id_ciclo: filter.id_ciclo } : {}),
      }).toString();
      const urlASC = `${API_URL}/alumnos/sin-curso?${queryASC}`;
      return httpClient(urlASC).then(({ json }) => ({
        data: (json.data || json).map(item => ({
          ...item,
          id: item.id_alumno || item.id,
        })),
        total: json.total,
      }));
    }

    // recurso 'docentes-sin-asignacion' eliminado

    // Recurso virtual para 'alumnos-con-curso'
    if (resource === 'alumnos-con-curso') {
      const { field, order } = params.sort || {};
      const queryACC = new URLSearchParams({
        page,
        perPage,
        ...(field ? { sort: field } : {}),
        ...(order ? { order } : {}),
        apellido: filter?.apellido || '',
        nombre: filter?.nombre || '',
        numero_documento: filter?.numero_documento || '',
        ...(filter?.id_ciclo ? { id_ciclo: filter.id_ciclo } : {}),
        ...(filter?.id_curso ? { id_curso: filter.id_curso } : {}),
        modo: 'cambio',
      }).toString();
      const urlACC = `${API_URL}/alumnos/con-curso?${queryACC}`;
      return httpClient(urlACC).then(({ json }) => ({
        data: (json.data || json).map(item => ({
          ...item,
          id: item.id_alumno || item.id,
        })),
        total: json.total,
      }));
    }

    // Resto de recursos estándar
    const { field, order } = params.sort || {};
    const query = new URLSearchParams({
      page,
      perPage,
      ...(field ? { sort: field } : {}),
      ...(order ? { order } : {}),
      ...filter,
    }).toString();

    const url = `${API_URL}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({
      data: (json.data ? json.data : json).map(item => ({
        ...item,
        id: dataProvider._mapId(resource, item),
      })),
      total: json.total,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`).then(({ json }) => ({
      data: {
        ...json,
        id: dataProvider._mapId(resource, json),
      },
    })),

  getMany: (resource, params) => {
    const query = { filter: JSON.stringify({ id: params.ids }) };
    const url = `${API_URL}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => {
      const raw = json?.data ?? json;
      const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      return {
        data: arr.map(item => ({
          ...item,
          id: dataProvider._mapId(resource, item),
        }))
      };
    });
  },

  getManyReference: (resource, params) => {
    const url = `${API_URL}/${resource}`;
    return httpClient(url).then(({ json }) => ({
      data: json,
      total: json.length,
    }));
  },

  create: (resource, params) => {
    let payload = params.data;
    if (resource === 'docentes-materias-curso') {
      const { id_ciclo, id_curso, ...rest } = params?.data || {};
      payload = rest;
    }
    return httpClient(`${API_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(({ json }) => ({
      data: { ...payload, id: dataProvider._mapId(resource, json) ?? json.id ?? json.insertId },
    }));
  },

  update: (resource, params) => {
    try { if (ENABLE_DP_LOGS) dlog('[DP] update', resource, params?.id, { keys: Object.keys(params?.data || {}) }); } catch {}
    return httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: {
        ...json,
        id: dataProvider._mapId(resource, json),
      }
    }));
  },

  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

  delete: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'DELETE',
        })
      )
    ).then(responses => ({ data: responses.map(({ json }) => json.id) })),



  getAlumnosCurso: (cursoId, fecha = hoyAR()) =>
    httpClient(`${API_URL}/alumnos/curso/${cursoId}?fecha=${fecha}`)
      .then(({ json }) => ({
        data: json.map(a => ({
          ...a,
          id: a.id_alumno, // react-admin requiere "id"
        })),
      })),

  // registrar/editar asistencia
  registrarAsistenciaCurso: (cursoId, fecha, items) =>
    httpClient(`${API_URL}/asistencias/curso`, {
      method: 'POST',
      body: JSON.stringify({ id_curso: cursoId, fecha, items }),
    }).then(({ json }) => ({ data: json })),

  // obtener asistencias de un curso en una fecha dada
  getAsistenciaCursoFecha: (cursoId, fecha = hoyAR()) =>
    httpClient(`${API_URL}/asistencias/curso/${cursoId}/recientes?fecha=${fecha}`)
      .then(({ json }) => ({
        data: json.map(a => ({
          ...a,
          id: a.id_asistencia || `${a.alumno_id}-${a.fecha}`,
        })),
      })),


  // Asistencias históricas (curso o alumno) usando axios API
  asistenciasHistorico: async (tipo, id, desde, hasta) => {
    try {
      const url =
        tipo === "curso"
          ? `/asistencias/curso/${id}?desde=${desde}&hasta=${hasta}`
          : `/asistencias/alumno/${id}?desde=${desde}&hasta=${hasta}`;

      const { data } = await api.get(url);
      return { data };
    } catch (err) {
      if (ENABLE_DP_LOGS) {
        try { console.error("❌ Error obteniendo asistencias históricas:", err); } catch {}
      }
      throw err.response?.data || err;
    }
  },

  // eliminar asistencias de un curso en una fecha dada
  deleteAsistenciasCurso: (cursoId, fecha) =>
    httpClient(`${API_URL}/asistencias/curso/${cursoId}?fecha=${fecha}`, {
      method: "DELETE",
    }).then(({ json }) => ({
      data: json,
    })),

  // obtener promedio de asistencias de un curso en un rango
  getPromedioAsistenciaCurso: (cursoId, desde, hasta) =>
    httpClient(`${API_URL}/asistencias/curso/${cursoId}/promedio?desde=${desde}&hasta=${hasta}`)
      .then(({ json }) => ({
        data: json,
      })),

  // Inasistencias de un alumno
  getInasistenciasPorAlumno: (alumnoId) =>
    httpClient(`${API_URL}/asistencias/alumno/${alumnoId}/ausentes`)
      .then(({ json }) => ({
        data: json,
      })),

  // Usuarios sin rol asignado (endpoint custom del backend)
  getUsuariosSinRol: () =>
    httpClient(`${API_URL}/usuarios/sin-rol`).then(({ json }) => ({
      data: (json.data || json).map(u => ({
        ...u,
        id: u.id_usuario || u.id,
      })),
    })),

  // Asignar rol a usuario (endpoint específico recomendado)
  asignarRolUsuario: (idUsuario, idRol) =>
    httpClient(`${API_URL}/usuarios/${idUsuario}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ id_rol: Number(idRol) }),
    }).then(({ json }) => ({ data: json })),

  // Quitar rol a usuario (DELETE dedicado)
  desasignarRolUsuario: (idUsuario) =>
    httpClient(`${API_URL}/usuarios/${idUsuario}/rol`, {
      method: 'DELETE',
    }).then(() => ({ data: { id: idUsuario } })),

  // obtener cursos segun rol
  getCursosPorRol: () =>
    httpClient(`${API_URL}/cursos/restricted`)
      .then(({ json }) => ({
        data: json.map(c => ({
          ...c,
          id: c.id_curso,
        })),
      })),

  // obtener materias por curso
  getMateriasCurso: (cursoId) =>
    httpClient(`${API_URL}/cursos/${cursoId}/materias`)
      .then(({ json }) => ({
        data: json.map(m => ({
          ...m,
          id: m.id_materia,
        })),
      })),

  // obtener alumnos por curso
  getAlumnosPorCurso: (cursoId) =>
    httpClient(`${API_URL}/cursos/${cursoId}/alumnos`)
      .then(({ json }) => ({
        data: json.map(a => ({
          ...a,
          id: a.id_alumno,
        })),
      })),

  // modificar muchas calificaciones
  updateManyCalificaciones: (updatedRows) =>
    httpClient(`${API_URL}/calificaciones`, {
      method: 'PUT',
      body: JSON.stringify({ calificaciones: updatedRows }),
    }).then(({ json }) => ({
      data: json,
    })),

  // crear muchas calificaciones
  createManyCalificaciones: (newRows) =>
    httpClient(`${API_URL}/calificaciones`, {
      method: 'POST',
      body: JSON.stringify({ calificaciones: newRows }),
    }).then(({ json }) => ({
      data: json,
    })),

  // obtener tipos de calificaciones
  getTiposCalificaciones: () =>
    httpClient(`${API_URL}/calificaciones/tipos`)
      .then(({ json }) => ({
        data: json,
      })),

  // obtener calificaciones por alumno
  getCalificacionesPorAlumno: (alumnoId) =>
    httpClient(`${API_URL}/calificaciones/alumno/${alumnoId}`)
      .then(({ json }) => ({
        data: json,
      })),

  // obtener docentes por curso
  getDocentesPorCurso: (cursoId) =>
    httpClient(`${API_URL}/cursos/${cursoId}/docentes`)
      .then(({ json }) => ({
        data: json.map(d => ({
          ...d,
          id: d.id_docente,
        })),
      })),

  // obtener cursos por ciclo lectivo (estados abiertos/planeamiento)
  getCursosPorCiclo: (idCiclo) =>
    httpClient(`${API_URL}/cursos?${new URLSearchParams({ id_ciclo: idCiclo, estado: 'abierto,planeamiento' }).toString()}`)
      .then(({ json }) => ({
        data: (json.data || json).map(c => ({
          ...c,
          id: c.id_curso ?? c.id,
        })),
      })),

  // asignar curso (bulk)
  asignarCursoAlumnos: (ids, idCurso) =>
    httpClient(`${API_URL}/alumnos/curso/assign-bulk`, {
      method: 'POST',
      body: JSON.stringify({ ids, id_curso: Number(idCurso) }),
    }).then(({ json }) => ({ data: json })),

  // mover de curso (bulk)
  moverCursoAlumnos: (ids, idCurso) =>
    httpClient(`${API_URL}/alumnos/curso/move-bulk`, {
      method: 'POST',
      body: JSON.stringify({ ids, id_curso: Number(idCurso) }),
    }).then(({ json }) => ({ data: json })),

  // obtener los hijos de un tutor
  getHijosPorTutor: () =>
    httpClient(`${API_URL}/tutores/hijos`)
      .then(({ json }) => ({
        data: json.map(h => ({
          ...h,
          id: h.id_tutor,
        })),
      })),

  // cargar informe pedagogico
  crearInformePedagogico: (data) =>
    httpClient(`${API_URL}/informes-pedagogicos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(({ json }) => ({
      data: { ...json, id: json.id_informe || json.insertId },
    })),

  getAsesoresPedagogicos: () =>
    httpClient(`${API_URL}/asesores-pedagogicos`)
      .then(({ json }) => ({
        data: json.map(a => ({
          ...a,
          id: a.id_asesor,
        })),
      })),

  // obtener justificativos por alumno
  getJustificativosPorAlumno: (alumnoId) =>
    httpClient(`${API_URL}/justificativos/alumno/${alumnoId}`)
      .then(({ json }) => ({
        data: json,
      })),

  // obtener justificativos por curso
  getJustificativosPorCurso: (cursoId, id_alumno = null) =>
    httpClient(`${API_URL}/justificativos/curso/${cursoId}${id_alumno ? `?id_alumno=${id_alumno}` : ''}`)
      .then(({ json }) => ({
        data: json,
      })),

  // crear justificativo
  crearJustificativo: (formData, idAsistencia) =>
    httpClient(`${API_URL}/justificativos/asistencia/${idAsistencia}`, {
      method: 'POST',
      body: formData,
    }).then(({ json }) => ({
      data: { ...json, id: json.id_justificativo || json.insertId },
    })),

  // actualizar estado de justificativo
  actualizarEstadoJustificativo: (idJustificativo, estado, motivo_rechazo = null, detalle_justificativo = null) =>
    httpClient(`${API_URL}/justificativos/${idJustificativo}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado, motivo_rechazo, detalle_justificativo }),
    }).then(({ json }) => ({ data: json })),

  // ============ RENDIMIENTO ACADÉMICO ============
  _buildRendimientoQuery: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      qs.append(key, value);
    });
    return qs.toString();
  },

  getRendimientoCurso: (filters = {}) => {
    const query = dataProvider._buildRendimientoQuery({ scope: 'curso', ...filters });
    return httpClient(`${API_URL}/rendimiento?${query}`).then(({ json }) => ({ data: json }));
  },

  getRendimientoMateria: (filters = {}) => {
    const query = dataProvider._buildRendimientoQuery({ scope: 'materia', ...filters });
    return httpClient(`${API_URL}/rendimiento?${query}`).then(({ json }) => ({ data: json }));
  },

  getRendimientoAlumno: (filters = {}) => {
    const query = dataProvider._buildRendimientoQuery({ scope: 'alumno', ...filters });
    return httpClient(`${API_URL}/rendimiento?${query}`).then(({ json }) => ({ data: json }));
  },

  getRendimientoAlertas: (filters = {}) => {
    const query = dataProvider._buildRendimientoQuery({ scope: 'alertas', ...filters });
    return httpClient(`${API_URL}/rendimiento?${query}`).then(({ json }) => ({ data: json }));
  },

  getRendimientoHijos: () =>
    httpClient(`${API_URL}/rendimiento?scope=hijos`).then(({ json }) => ({ data: json })),

  generarInformeRendimiento: (payload) =>
    httpClient(`${API_URL}/rendimiento/informe`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(({ json }) => ({ data: json })),

  generarInformeRendimientoIA: (payload, { soloPayload = false, format = null } = {}) => {
    const params = new URLSearchParams();
    if (soloPayload) params.append('soloPayload', 'true');
    if (format) params.append('format', format);
    const queryString = params.toString();
    const url = `${API_URL}/rendimiento/informe-ia${queryString ? `?${queryString}` : ''}`;
    const body = JSON.stringify(payload);

    if (format === 'pdf') {
      const headers = new Headers({
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      });
      const csrfToken = sessionStorage.getItem('csrf_token');
      const accessToken = sessionStorage.getItem('access_token');
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      if (refreshToken) headers.set('X-Refresh-Token', refreshToken);

      return fetch(url, {
        method: 'POST',
        headers,
        body,
        credentials: 'include',
      }).then(async (response) => {
        if (!response.ok) {
          let errorBody = null;
          try {
            errorBody = await response.json();
          } catch {
            // ignore JSON parse error
          }
          const error = new Error(errorBody?.error || 'Error generando informe IA');
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }
        const blob = await response.blob();
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/i);
        const filename = match ? match[1] : null;
        return { data: blob, filename };
      });
    }

    return httpClient(url, {
      method: 'POST',
      body,
    }).then(({ json }) => ({ data: json }));
  },
}
