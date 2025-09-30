import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

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
    const url = `${API_URL}/${resource}`;
    return httpClient(url).then(({ json }) => ({
      data: json.map(item => ({ 
        ...item, 
        id: item.id_asistencia || item.id_alumno || item.id_docente || item.id_curso || item.id 
      })),
      total: json.length,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`).then(({ json }) => ({
      data: { 
        ...json, 
        id: json.id_asistencia || json.id_alumno || json.id_docente || json.id_curso || json.id 
      },
    })),

  getMany: (resource, params) => {
    const query = { filter: JSON.stringify({ id: params.ids }) };
    const url = `${API_URL}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
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
      data: { ...params.data, id: json.id || json.id_asistencia || json.insertId },
    })),

  update: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

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
};