function formatApiError(detail, fallback = 'Error en la petición al servidor') {
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join('; ');
    }
    return String(detail);
}

export async function apiFetch(endpoint, options = {}) {
    // Si la aplicación legacy se abre desde Next.js (puerto 3000), sus
    // rutas relativas /api no llegan a FastAPI. En Vite/Nginx se conserva el
    // proxy relativo configurado para desarrollo y producción.
    const frontendPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const apiEndpoint = ['80', '443', '5173'].includes(frontendPort) && window.location.protocol !== 'file:'
        ? endpoint
        : `http://localhost:8000${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    let response;
    try {
        response = await fetch(apiEndpoint, config);
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        if (!response.ok) {
            if (response.status === 405) {
                const allowed = response.headers.get('allow');
                throw new Error(`Método ${config.method || 'GET'} no permitido${allowed ? `. Métodos permitidos: ${allowed}` : ''}`);
            }
            throw new Error(text || `Error HTTP ${response.status}`);
        }
        return text || null;
    }

    if (!response.ok) {
        const message = formatApiError(data?.detail, `Error HTTP ${response.status}`);
        console.error('API Error:', { endpoint, status: response.status, data });
        throw new Error(message);
    }

    return data;
}
