"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"

// Schema expandido para coincidir con la ficha de detalle
const createClientSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  correo: z.string().trim().email("Correo inválido").optional().or(z.literal("")).nullable().transform(v => v || null),
  telefono_principal: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  whatsapp: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  fuente_lead: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  
  tipo_credito: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  capacidad_credito_max: z.coerce.number().nullable().optional(),
  enganche_disponible: z.coerce.number().nullable().optional(),
  ingreso_mensual: z.coerce.number().nullable().optional(),
  presupuesto_min: z.coerce.number().nonnegative("Debe ser mayor o igual a 0").nullable().optional(),
  presupuesto_max: z.coerce.number().nullable().optional(),
  pago_mensual_objetivo: z.coerce.number().nullable().optional(),
  ocupacion: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  nombre_empresa: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),

  operacion: z.enum(["COMPRA", "RENTA"], { errorMap: () => ({ message: "Selecciona una operación válida" }) }),
  tipo_propiedad: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  ciudad_busqueda: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  estado_busqueda: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  fraccionamiento_colonia: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
  habitaciones_pa: z.coerce.number().nullable().optional(),
  habitaciones_pb: z.coerce.number().nullable().optional(),
  banos: z.coerce.number().nullable().optional(),
  estacionamiento: z.coerce.number().nullable().optional(),
  m2_construccion_min: z.coerce.number().nullable().optional(),
  m2_terreno_min: z.coerce.number().nullable().optional(),
  
  notas: z.string().trim().optional().or(z.literal("")).nullable().transform(v => v || null),
})

export type CreateClientState = {
  success?: boolean
  data?: unknown
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createClient(
  prevStateOrFormData: FormData | CreateClientState | null | undefined,
  maybeFormData?: FormData
): Promise<CreateClientState> {
  try {
    const formData = (
      prevStateOrFormData instanceof FormData ? prevStateOrFormData : maybeFormData
    ) as FormData

    if (!formData) {
      return { error: "No se proporcionaron datos de formulario" }
    }

    const rawData = {
      nombre: formData.get("nombre"),
      correo: formData.get("correo"),
      telefono_principal: formData.get("telefono_principal"),
      whatsapp: formData.get("whatsapp"),
      fuente_lead: formData.get("fuente_lead"),
      tipo_credito: formData.get("tipo_credito"),
      capacidad_credito_max: formData.get("capacidad_credito_max"),
      enganche_disponible: formData.get("enganche_disponible"),
      ingreso_mensual: formData.get("ingreso_mensual"),
      presupuesto_min: formData.get("presupuesto_min"),
      presupuesto_max: formData.get("presupuesto_max"),
      pago_mensual_objetivo: formData.get("pago_mensual_objetivo"),
      ocupacion: formData.get("ocupacion"),
      nombre_empresa: formData.get("nombre_empresa"),
      operacion: formData.get("operacion"),
      tipo_propiedad: formData.get("tipo_propiedad"),
      ciudad_busqueda: formData.get("ciudad_busqueda"),
      estado_busqueda: formData.get("estado_busqueda"),
      fraccionamiento_colonia: formData.get("fraccionamiento_colonia"),
      habitaciones_pa: formData.get("habitaciones_pa"),
      habitaciones_pb: formData.get("habitaciones_pb"),
      banos: formData.get("banos"),
      estacionamiento: formData.get("estacionamiento"),
      m2_construccion_min: formData.get("m2_construccion_min"),
      m2_terreno_min: formData.get("m2_terreno_min"),
      notas: formData.get("notas"),
    }

    const validation = createClientSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        error: "Por favor corrige los errores marcados en el formulario",
        fieldErrors: validation.error.flatten().fieldErrors,
      }
    }

    const validatedData = validation.data
    const session = await verifySession()
    const tenantId = session?.tenantId || 1
    
    const partesNombre = validatedData.nombre.trim().split(/\s+/)
    const apellidoPaterno = partesNombre.length > 1 ? partesNombre.slice(1).join(" ") : "-"

    const nuevoCliente = await prisma.cliente.create({
      data: {
        id_tenant: tenantId,
        nombre: validatedData.nombre,
        apellido_paterno: apellidoPaterno,
        correo: validatedData.correo,
        telefono_principal: validatedData.telefono_principal,
        whatsapp: validatedData.whatsapp,
        fuente_lead: validatedData.fuente_lead,
        tipo_credito: validatedData.tipo_credito,
        capacidad_credito_max: validatedData.capacidad_credito_max,
        enganche_disponible: validatedData.enganche_disponible,
        ingreso_mensual: validatedData.ingreso_mensual,
        presupuesto_min: validatedData.presupuesto_min,
        presupuesto_max: validatedData.presupuesto_max,
        pago_mensual_objetivo: validatedData.pago_mensual_objetivo,
        ocupacion: validatedData.ocupacion,
        nombre_empresa: validatedData.nombre_empresa,
        operacion: validatedData.operacion,
        tipo_propiedad: validatedData.tipo_propiedad,
        ciudad_busqueda: validatedData.ciudad_busqueda,
        estado_busqueda: validatedData.estado_busqueda,
        fraccionamiento_colonia: validatedData.fraccionamiento_colonia,
        habitaciones_pa: validatedData.habitaciones_pa,
        habitaciones_pb: validatedData.habitaciones_pb,
        banos: validatedData.banos,
        estacionamiento: validatedData.estacionamiento,
        m2_construccion_min: validatedData.m2_construccion_min,
        m2_terreno_min: validatedData.m2_terreno_min,
        estado_cliente: "nuevo",
        ...(validatedData.notas ? { notas: { create: [{ contenido: validatedData.notas }] } } : {}),
      },
    })

    revalidatePath("/dashboard/clientes")
    return { success: true, data: nuevoCliente }
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return { error: error instanceof Error ? error.message : "Error inesperado al crear el cliente" }
  }
}

export async function updateClient(
  id: number,
  formData: FormData
): Promise<CreateClientState> {
  try {
    const session = await verifySession()
    const tenantId = session?.tenantId || 1

    if (!id || typeof id !== "number" || isNaN(id)) {
      return { error: "Identificador de cliente inválido" }
    }

    const rawData = {
      nombre: formData.get("nombre"),
      correo: formData.get("correo"),
      telefono_principal: formData.get("telefono_principal"),
      whatsapp: formData.get("whatsapp"),
      fuente_lead: formData.get("fuente_lead"),
      tipo_credito: formData.get("tipo_credito"),
      capacidad_credito_max: formData.get("capacidad_credito_max"),
      enganche_disponible: formData.get("enganche_disponible"),
      ingreso_mensual: formData.get("ingreso_mensual"),
      presupuesto_min: formData.get("presupuesto_min"),
      presupuesto_max: formData.get("presupuesto_max"),
      pago_mensual_objetivo: formData.get("pago_mensual_objetivo"),
      ocupacion: formData.get("ocupacion"),
      nombre_empresa: formData.get("nombre_empresa"),
      operacion: formData.get("operacion"),
      tipo_propiedad: formData.get("tipo_propiedad"),
      ciudad_busqueda: formData.get("ciudad_busqueda"),
      estado_busqueda: formData.get("estado_busqueda"),
      fraccionamiento_colonia: formData.get("fraccionamiento_colonia"),
      habitaciones_pa: formData.get("habitaciones_pa"),
      habitaciones_pb: formData.get("habitaciones_pb"),
      banos: formData.get("banos"),
      estacionamiento: formData.get("estacionamiento"),
      m2_construccion_min: formData.get("m2_construccion_min"),
      m2_terreno_min: formData.get("m2_terreno_min"),
      notas: formData.get("notas"),
    }

    const validation = createClientSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      return {
        error: "Por favor corrige los errores marcados en el formulario",
        fieldErrors,
      }
    }

    // Verificar que el cliente existe y pertenece al tenant
    const existing = await prisma.cliente.findFirst({
      where: {
        id_cliente: id,
        id_tenant: tenantId,
        deletedAt: null,
      },
    })

    if (!existing) {
      return { error: "El cliente no existe o no tienes permisos para editarlo" }
    }

    const validatedData = validation.data
    const partesNombre = validatedData.nombre.trim().split(/\s+/)
    const apellidoPaterno = partesNombre.length > 1 ? partesNombre.slice(1).join(" ") : existing.apellido_paterno || "-"

    const clienteActualizado = await prisma.cliente.update({
      where: {
        id_cliente: id,
      },
      data: {
        nombre: validatedData.nombre,
        apellido_paterno: apellidoPaterno,
        correo: validatedData.correo,
        telefono_principal: validatedData.telefono_principal,
        whatsapp: validatedData.whatsapp,
        fuente_lead: validatedData.fuente_lead,
        tipo_credito: validatedData.tipo_credito,
        capacidad_credito_max: validatedData.capacidad_credito_max,
        enganche_disponible: validatedData.enganche_disponible,
        ingreso_mensual: validatedData.ingreso_mensual,
        presupuesto_min: validatedData.presupuesto_min,
        presupuesto_max: validatedData.presupuesto_max,
        pago_mensual_objetivo: validatedData.pago_mensual_objetivo,
        ocupacion: validatedData.ocupacion,
        nombre_empresa: validatedData.nombre_empresa,
        operacion: validatedData.operacion,
        tipo_propiedad: validatedData.tipo_propiedad,
        ciudad_busqueda: validatedData.ciudad_busqueda,
        estado_busqueda: validatedData.estado_busqueda,
        fraccionamiento_colonia: validatedData.fraccionamiento_colonia,
        habitaciones_pa: validatedData.habitaciones_pa,
        habitaciones_pb: validatedData.habitaciones_pb,
        banos: validatedData.banos,
        estacionamiento: validatedData.estacionamiento,
        m2_construccion_min: validatedData.m2_construccion_min,
        m2_terreno_min: validatedData.m2_terreno_min,
        ...(validatedData.notas
          ? {
              notas: {
                create: [
                  {
                    contenido: validatedData.notas,
                  },
                ],
              },
            }
          : {}),
      },
    })

    revalidatePath("/dashboard/clientes")
    revalidatePath(`/dashboard/clientes/${id}`)
    revalidatePath(`/dashboard/clientes/${id}/editar`)

    return {
      success: true,
      data: clienteActualizado,
    }
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al actualizar el cliente",
    }
  }
}

// ─── Update Macro Estado ─────────────────────────────────────────────────────
export async function updateClientEstado(
  id: number,
  nuevoEstado: string
): Promise<CreateClientState> {
  try {
    const session = await verifySession()
    const tenantId = session?.tenantId || 1

    const validEstados = [
      "nuevo",
      "contactado",
      "calificado",
      "en_proceso",
      "cerrado",
      "inactivo",
      "descartado",
    ]

    if (!validEstados.includes(nuevoEstado.toLowerCase())) {
      return { error: "Estado no válido" }
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id_cliente: id, id_tenant: tenantId, deletedAt: null },
    })

    if (!cliente) {
      return { error: "Cliente no encontrado o sin permisos" }
    }

    const actualizado = await prisma.cliente.update({
      where: { id_cliente: id },
      data: { estado_cliente: nuevoEstado.toLowerCase() },
    })

    revalidatePath("/dashboard/clientes")
    revalidatePath(`/dashboard/clientes/${id}`)

    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al actualizar estado del cliente:", error)
    return { error: error instanceof Error ? error.message : "Error al actualizar estado" }
  }
}

// ─── Assign Asesor ───────────────────────────────────────────────────────────
export async function assignClientAsesor(
  id: number,
  idAsesor: number | null
): Promise<CreateClientState> {
  try {
    const session = await verifySession()
    const tenantId = session?.tenantId || 1

    const cliente = await prisma.cliente.findFirst({
      where: { id_cliente: id, id_tenant: tenantId, deletedAt: null },
    })

    if (!cliente) {
      return { error: "Cliente no encontrado o sin permisos" }
    }

    if (idAsesor !== null) {
      const asesor = await prisma.asesor.findFirst({
        where: { id_asesor: idAsesor, id_tenant: tenantId },
      })
      if (!asesor) {
        return { error: "El asesor seleccionado no existe o no pertenece a tu cuenta" }
      }
    }

    const actualizado = await prisma.cliente.update({
      where: { id_cliente: id },
      data: { id_asesor: idAsesor },
    })

    revalidatePath("/dashboard/clientes")
    revalidatePath(`/dashboard/clientes/${id}`)

    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al asignar asesor:", error)
    return { error: error instanceof Error ? error.message : "Error al asignar asesor" }
  }
}
