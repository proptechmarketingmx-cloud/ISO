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

    if (!res.ok) {
      // 401 / 403 / cualquier error → limpiar y redirigir
      auth.logout();
      return;
    }

    // Refrescar perfil local con los datos más recientes (incluyendo roles actualizados)
    const user = await res.json();
    auth.setUser(user);

  } catch {
    // Error de red: en este caso permitimos continuar — el API guard del backend
    // devolverá 401 cuando se haga la primera petición de datos.
  }
})();
