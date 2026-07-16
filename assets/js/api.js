/**
 * ISO Platform — API Client
 * Cliente HTTP centralizado para comunicarse con el backend FastAPI.
 * Usa una ruta relativa para que funcione tanto en desarrollo como en producción.
 */

const API_BASE = '/api';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
      const detail = err.detail;
      const message = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg || item.message || JSON.stringify(item)).join('; ')
          : `HTTP ${res.status}`;
      throw new Error(message);
    }
    return res.status === 204 ? null : await res.json();
  } catch (e) {
    console.error(`[API] ${method} ${path} →`, e.message);
    throw e;
  }
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
};

/* ── Clientes ──────────────────────────────────────── */
export const clientesApi = {
  list:        (params = '')  => api.get(`/clientes${params}`),
  get:         (id)           => api.get(`/clientes/${id}`),
  create:      (data)         => api.post('/clientes', data),
  update:      (id, data)     => api.put(`/clientes/${id}`, data),
  remove:      (id)           => api.delete(`/clientes/${id}`),
  cumpleanos:  ()             => api.get('/clientes/cumpleanos'),
};


/* ── Leads ─────────────────────────────────────────── */
export const leadsApi = {
  list:   ()                    => Promise.reject(new Error('El backend actual no expone un endpoint de leads.')),
  get:    ()                    => Promise.reject(new Error('El backend actual no expone un endpoint de leads.')),
  create: ()                    => Promise.reject(new Error('El backend actual no expone un endpoint de leads.')),
  update: ()                    => Promise.reject(new Error('El backend actual no expone un endpoint de leads.')),
  remove: ()                    => Promise.reject(new Error('El backend actual no expone un endpoint de leads.')),
};

/* ── Propiedades ───────────────────────────────────── */
export const propiedadesApi = {
  list:   (params = '')          => api.get(`/propiedades${params}`),
  get:    (id)                   => api.get(`/propiedades/${id}`),
  create: (data)                 => api.post('/propiedades', data),
  update: (id, data)             => api.put(`/propiedades/${id}`, data),
  remove: (id)                   => api.delete(`/propiedades/${id}`),
  getMultimedia:    (id)         => api.get(`/propiedades/${id}/multimedia`),
  addMultimedia:    (id, data)   => api.post(`/propiedades/${id}/multimedia`, data),
  removeMultimedia: (propId, mediaId) => api.delete(`/propiedades/${propId}/multimedia/${mediaId}`),
  propiedadMatches: (id, limit = 20) => api.get(`/propiedades/${id}/matches?limit=${limit}`),
  getExpediente:    (id)         => api.get(`/propiedades/${id}/expediente`),
  addNota:          (id, data)   => api.post(`/propiedades/${id}/notas`, data),
  addActividad:     (id, data)   => api.post(`/propiedades/${id}/actividades`, data),
  addDocumento:     (id, data)   => api.post(`/propiedades/${id}/documentos`, data),
  removeDocumento:  (propId, docId) => api.delete(`/propiedades/${propId}/documentos/${docId}`),
};

/* ── Asesores ──────────────────────────────────────── */
export const asesoresApi = {
  list:   (params = '')          => api.get(`/asesores${params}`),
  get:    (id)                   => api.get(`/asesores/${id}`),
  create: (data)                 => api.post('/asesores', data),
  update: (id, data)             => api.put(`/asesores/${id}`, data),
  remove: (id)                   => api.delete(`/asesores/${id}`),
};

/* ── CNA ───────────────────────────────────────────── */
export const cnaApi = {
  clientesNetwork:     ()        => api.get('/cna/clientes/network'),
  clientesScores:      ()        => api.get('/cna/clientes/scores'),
  clientesRankings:    ()        => api.get('/cna/clientes/rankings'),
  clientesCommunities: ()        => api.get('/cna/clientes/communities'),
  asesoresNetwork:     ()        => api.get('/cna/asesores/network'),
  asesoresScores:      ()        => api.get('/cna/asesores/scores'),
  asesoresRankings:    ()        => api.get('/cna/asesores/rankings'),
  asesoresCommunities: ()        => api.get('/cna/asesores/communities'),
};

/* ── Dashboard ─────────────────────────────────────── */
export const dashboardApi = {
  summary: ()                    => api.get('/dashboard/summary'),
};

/* ── KPIs ──────────────────────────────────────────── */
export const kpisApi = {
  clientes:    ()                => api.get('/kpis/clientes'),
  propiedades: ()                => api.get('/kpis/propiedades'),
  asesores:    ()                => api.get('/kpis/asesores'),
  matching:    ()                => api.get('/kpis/matching'),
};

/* ── Matching / Compatibilidad ─────────────────────── */
export const matchesApi = {
  clienteMatches:    (id, limit = 20) => api.get(`/clientes/${id}/matches?limit=${limit}`),
  propiedadMatches:  (id, limit = 20) => api.get(`/propiedades/${id}/matches?limit=${limit}`),
};
