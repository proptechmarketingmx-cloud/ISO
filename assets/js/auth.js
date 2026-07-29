/**
 * ISO Platform — Auth & Permission Manager
 * Maneja el almacenamiento de tokens JWT, información de perfil de usuario
 * y verificación de permisos RBAC en el frontend.
 */

const TOKEN_KEY = 'iso_access_token';
const USER_KEY  = 'iso_user_profile';

export const auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = '/login/';
  },

  /**
   * Verifica si el usuario tiene permiso para una acción en un módulo.
   * Acciones: 'crear', 'leer', 'editar', 'eliminar'.
   */
  hasPermission(modulo, accion = 'leer') {
    const user = this.getUser();
    if (!user) return false;

    // Super Admin o Admin tienen acceso total
    const rolesSlugs = (user.roles || []).map(r => r.slug);
    if (rolesSlugs.includes('super_admin') || rolesSlugs.includes('admin')) {
      return true;
    }

    // Buscar en los permisos de los roles asignados
    const propKey = `puede_${accion}`;
    for (const rol of (user.roles || [])) {
      for (const p of (rol.permisos || [])) {
        if (p.modulo === modulo && p[propKey]) {
          return true;
        }
      }
    }

    return false;
  }
};
