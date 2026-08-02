/**
 * ISO Platform — Auth Guard
 * Importar al inicio de cada página protegida.
 * Verifica que el token exista Y sea válido contra /api/auth/me.
 * Si no: redirige a /login/ inmediatamente, antes de renderizar nada.
 *
 * Uso:
 *   import '/assets/js/auth-guard.js';
 */

import { auth } from '/assets/js/auth.js';

(async function guard() {
  const token = auth.getToken();

  if (!token) {
    // No hay token en absoluto → redirigir
    window.location.replace('/login/');
    return;
  }

  // Validar que el token siga siendo válido en el servidor
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      // Si la respuesta no es 200 OK o no es JSON (eg. HTML de error 404 del servidor de dev)
      if (res.status === 401 || res.status === 403) {
        auth.logout();
        return;
      }
      // Si es un error de red o servidor, no cerrar sesión abruptamente
      return;
    }

    const user = await res.json().catch(() => null);
    if (user) {
      auth.setUser(user);
    }
  } catch {
    // Error de conexión o red: continuar sin cerrar sesión
  }
})();
