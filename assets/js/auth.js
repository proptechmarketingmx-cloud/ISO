/**
 * ISO Platform — Auth & Permission Manager
 * Maneja el almacenamiento de tokens JWT, información de perfil de usuario
 * y verificación de permisos RBAC en el frontend.
 */

/** Slugs de roles de sistema — deben coincidir 1:1 con la BD y backend/auth/constants.py */
export const SYSTEM_ROLES = Object.freeze({
  ADMIN:  'admin',
  ASESOR: 'asesor',
});

/** Slugs de módulos de permisos — deben coincidir con backend/auth/constants.py */
export const SYSTEM_MODULES = Object.freeze({
  CLIENTES:        'clientes',
  CLIENTES_AJENOS: 'clientes_ajenos',
  PROPIEDADES:     'propiedades',
  CNA:             'cna',
  RED_CONTACTOS:   'red_contactos',
  KPIS:            'kpis',
  ASESORES:        'asesores',
  USUARIOS:        'usuarios',
  FACTURACION:     'facturacion',
  CONFIG_TENANT:   'config_tenant',
});

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
   * Usa SYSTEM_ROLES y SYSTEM_MODULES para evitar strings mágicos en el sitio de llamada.
   */
  hasPermission(modulo, accion = 'leer') {
    const user = this.getUser();
    if (!user) return false;

    // Admin tiene acceso total
    const rolesSlugs = (user.roles || []).map(r => r.slug);
    if (rolesSlugs.includes(SYSTEM_ROLES.ADMIN)) {
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
