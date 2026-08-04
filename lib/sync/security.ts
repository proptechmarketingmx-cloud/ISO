import { NextRequest } from 'next/server';

/**
 * Convierte una dirección IPv4 a número entero de 32 bits para comparación de rangos Subnet.
 */
function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return 0;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Verifica si una IP pertenece al rango CGNAT de Tailscale (100.64.0.0/10: 100.64.0.0 - 100.127.255.255)
 * o si es una dirección de bucle local (loopback) para pruebas de desarrollo.
 */
export function isAllowedSyncIp(clientIp: string | null): boolean {
  if (!clientIp) return false;

  // Limpiar sintaxis de IPv6 mapeada a IPv4 (ej. ::ffff:100.x.x.x o ::1)
  const cleanIp = clientIp.replace(/^::ffff:/, '');

  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost'
  ) {
    return true;
  }

  const ipInt = ipv4ToInt(cleanIp);
  const tailscaleStart = ipv4ToInt('100.64.0.0');
  const tailscaleEnd = ipv4ToInt('100.127.255.255');

  return ipInt >= tailscaleStart && ipInt <= tailscaleEnd;
}

/**
 * Valida tanto el Token de Sincronización compartido como la IP de origen del peer.
 */
export function validateSyncSecurity(req: NextRequest): { valid: boolean; error?: string; status?: number } {
  // 1. Obtener la IP del cliente desde headers de proxy o socket
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');

  if (!isAllowedSyncIp(clientIp)) {
    return {
      valid: false,
      error: `Acceso denegado. La IP de origen (${clientIp}) no pertenece al rango de Tailscale (100.64.0.0/10) ni a localhost.`,
      status: 403,
    };
  }

  // 2. Validar Token Compartido SYNC_TOKEN
  const expectedToken = process.env.SYNC_TOKEN;
  if (!expectedToken) {
    return {
      valid: false,
      error: 'SYNC_TOKEN no está configurado en las variables de entorno del servidor.',
      status: 500,
    };
  }

  const tokenHeader = req.headers.get('x-sync-token');
  const authHeader = req.headers.get('authorization');
  const providedToken = tokenHeader || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (!providedToken || providedToken !== expectedToken) {
    return {
      valid: false,
      error: 'Token de sincronización inválido o ausente.',
      status: 401,
    };
  }

  return { valid: true };
}
