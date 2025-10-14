import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';
import { api } from "../services/api"

const API_URL = 'http://localhost:6543/api';

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

  return fetchUtils.fetchJson(url, options);
};


export const dataProvider = {


  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    //const { nombre_completo, id_rol } = params.filter;
    const filter = params.filter || {};
    const query = new URLSearchParams({
      page,
      perPage,
      ...filter,
        // nombre_completo: nombre_completo || '',
      // id_rol: id_rol || '',
    }).toString();

    const url = `${API_URL}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data ?
        json.data.map(item => ({
          ...item,
          id: item.id_asistencia || item.id_alumno || item.id_docente || item.id_curso || item.id_rol || item.id_usuario || item.id
        })) :
        json.map(item => ({
          ...item,
          id: item.id_asistencia || item.id_alumno || item.id_docente || item.id_curso || item.id_rol || item.id_usuario || item.id
        })),
      total: json.total,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`).then(({ json }) => ({
      data: {
        ...json,
        id: json.id_asistencia || json.id_alumno || json.id_docente || json.id_curso || json.id_rol || json.id_usuario || json.id
      },
    })),

  getMany: (resource, params) => {
    const query = { filter: JSON.stringify({ id: params.ids }) };
    const url = `${API_URL}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({
      data: json.map(item => ({
        ...item,
        id: item.id_asistencia || item.id_alumno || item.id_docente || item.id_curso || item.id_rol || item.id_usuario || item.id
      }))
    }));
  },

  getManyReference: (resource, params) => {
    const url = `${API_URL}/${resource}`;
    return httpClient(url).then(({ json }) => ({
      data: json,
      total: json.length,
    }));
  },

  create: (resource, params) =>
    httpClient(`${API_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id || json.id_asistencia || json.id_usuario || json.insertId },
    })),

  update: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: {
        ...json,
        id: json.id_asistencia || json.id_alumno || json.id_docente || json.id_curso || json.id_rol || json.id_usuario || json.id
      }
    })),

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
      console.error("❌ Error obteniendo asistencias históricas:", err);
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

  // obtener materias por curso
  getMateriasCurso: (cursoId) =>
    httpClient(`${API_URL}/cursos/${cursoId}/materias`)
      .then(({ json }) => ({
        data: json.map(m => ({
          ...m,
          id: m.id_materia,
        })),
      })),

  // obtener cursos por materia
  getCursosMateria: (materiaId) =>
    httpClient(`${API_URL}/materias/${materiaId}/cursos`)
      .then(({ json }) => ({
        data: json.map(c => ({
          ...c,
          id: c.id_curso,
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

  // obtener calificaciones por alumno
  getCalificacionesPorAlumno: (alumnoId, filter) =>
    httpClient(`${API_URL}/calificaciones/alumnos/${alumnoId}?${stringify(filter)}`)
      .then(({ json }) => ({
        data: json.map(c => ({
          ...c,
          id: c.id_calificacion,
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

  // eliminar muchas calificaciones
  deleteManyCalificaciones: (ids) =>
    httpClient(`${API_URL}/calificaciones`, {
      method: 'DELETE',
      body: JSON.stringify({ calificaciones: ids }),
    }).then(({ json }) => ({
      data: json,
    })),

  // obtener los hijos de un tutor
  getHijosPorTutor: () =>
    httpClient(`${API_URL}/tutores/hijos`)
      .then(({ json }) => ({
        data: json.map(h => ({
          ...h,
          id: h.id_tutor,
        })),
      })),
}