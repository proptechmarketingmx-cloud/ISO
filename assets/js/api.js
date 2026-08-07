import { auth } from '/assets/js/auth.js';

// Vite (5173) y Nginx (80) hacen proxy de /api hacia FastAPI. Cuando el
// CRM legacy se abre desde Next (3000), /api pertenece a las rutas de Next,
// por lo que debemos dirigir las llamadas directamente al backend Python.
const frontendPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
const API_BASE = ['80', '443', '5173'].includes(frontendPort) && window.location.protocol !== 'file:'
  ? '/api'
  : 'http://localhost:8000/api';

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 401 && !path.startsWith('/auth/login')) {
      auth.logout();
      throw new Error('Sesión expirada. Por favor inicie sesión de nuevo.');
    }

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (res.status === 403) {
      const err = isJson ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'No tiene permisos para realizar esta acción');
    }

    if (!res.ok) {
      let message = `Error en el servidor (HTTP ${res.status})`;
      if (res.status === 405) {
        const allowed = res.headers.get('allow');
        message = `Método ${method} no permitido para ${path}${allowed ? `. Métodos permitidos: ${allowed}` : ''}`;
      }
      if (isJson) {
        const err = await res.json().catch(() => ({}));
        const detail = err.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((item) => item.msg || item.message || JSON.stringify(item)).join('; ');
        }
      } else if (res.status === 404) {
        message = `Endpoint no encontrado (${path}). Verifica que el backend esté ejecutándose en el puerto 8000.`;
      }
      throw new Error(message);
    }

    if (res.status === 204) return null;

    if (!isJson) {
      throw new Error(`Respuesta no válida del servidor backend (no es JSON). Verifica que el servidor FastAPI esté iniciado.`);
    }

    return await res.json();
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
