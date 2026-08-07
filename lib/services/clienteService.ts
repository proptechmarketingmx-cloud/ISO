import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export function calcularEdadYGeneracion(fechaNacimientoStr?: string | null): { edad: number | null; generacion: string | null } {
  if (!fechaNacimientoStr) return { edad: null, generacion: null };
  const birth = new Date(fechaNacimientoStr);
  if (isNaN(birth.getTime())) return { edad: null, generacion: null };

  const now = new Date();
  let edad = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    edad--;
  }

  const birthYear = birth.getFullYear();
  let generacion = null;
  if (birthYear >= 1997 && birthYear <= 2012) generacion = 'Gen Z';
  else if (birthYear >= 1981 && birthYear <= 1996) generacion = 'Millennial';
  else if (birthYear >= 1965 && birthYear <= 1980) generacion = 'Gen X';
  else if (birthYear >= 1946 && birthYear <= 1964) generacion = 'Baby Boomer';
  else if (birthYear < 1946) generacion = 'Silent Generation';

  return { edad, generacion };
}

export function extraerLada(telefono?: string | null): string | null {
  if (!telefono) return null;
  const clean = telefono.replace(/\D/g, '');
  if (clean.length >= 10) return clean.substring(0, 3);
  return null;
}

export async function listarClientes(filtros: {
  tenantId?: number | null;
  estado?: string;
  asesorId?: number;
  busqueda?: string;
  skip?: number;
  take?: number;
}) {
  const where: Prisma.ClienteWhereInput = {
    deletedAt: null,
  };

  if (filtros.tenantId !== undefined && filtros.tenantId !== null) {
    where.id_tenant = filtros.tenantId;
  }

  if (filtros.estado) {
    where.estado_cliente = filtros.estado;
  }

  if (filtros.asesorId) {
    where.id_asesor = filtros.asesorId;
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
      { apellido_paterno: { contains: filtros.busqueda, mode: 'insensitive' } },
      { correo: { contains: filtros.busqueda, mode: 'insensitive' } },
      { whatsapp: { contains: filtros.busqueda, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      include: {
        asesor: true,
        tenant: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: filtros.skip || 0,
      take: filtros.take || 50,
    }),
  ]);

  return { total, items };
}

export async function crearCliente(data: any, tenantId?: number | null) {
  const { edad, generacion } = calcularEdadYGeneracion(data.fecha_nacimiento);
  const lada = extraerLada(data.telefono_principal || data.whatsapp);

  return await prisma.cliente.create({
    data: {
      ...data,
      id_tenant: tenantId || data.id_tenant || null,
      edad: edad !== null ? edad : data.edad,
      generacion: generacion || data.generacion,
      lada: lada || data.lada,
    },
    include: {
      asesor: true,
    },
  });
}

export async function obtenerClientePorId(id: number) {
  return await prisma.cliente.findUnique({
    where: { id_cliente: id },
    include: {
      asesor: true,
      actividades: { orderBy: { fecha: 'desc' } },
      documentos: { orderBy: { fecha_subida: 'desc' } },
      notas: { orderBy: { fecha: 'desc' } },
      historial: { orderBy: { fecha: 'desc' } },
    },
  });
}

export async function actualizarCliente(id: number, data: any) {
  if (data.fecha_nacimiento) {
    const { edad, generacion } = calcularEdadYGeneracion(data.fecha_nacimiento);
    data.edad = edad;
    data.generacion = generacion;
  }

  if (data.telefono_principal || data.whatsapp) {
    data.lada = extraerLada(data.telefono_principal || data.whatsapp);
  }

  return await prisma.cliente.update({
    where: { id_cliente: id },
    data,
    include: {
      asesor: true,
    },
  });
}

export async function softDeleteCliente(id: number, usuario?: string) {
  return await prisma.$transaction([
    prisma.cliente.update({
      where: { id_cliente: id },
      data: { deletedAt: new Date() },
    }),
    prisma.clienteHistorial.create({
      data: {
        id_cliente: id,
        accion: 'SOFT_DELETE',
        descripcion: 'Cliente eliminado suavemente desde el sistema',
        usuario: usuario || 'Sistema',
      },
    }),
  ]);
}
