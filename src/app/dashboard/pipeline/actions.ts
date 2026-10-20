"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { EstadoOportunidad } from "@prisma/client"

// ─── Schemas ────────────────────────────────────────────────────────────────
const createOportunidadSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  id_cliente: z.coerce.number({ invalid_type_error: "Selecciona un cliente" }).int().positive("Selecciona un cliente"),
  id_propiedad: z.coerce.number().int().positive().optional().nullable(),
  valor_estimado: z.coerce.number().positive().optional().nullable(),
  probabilidad: z.coerce.number().int().min(0).max(100).default(10),
  notas: z.string().trim().optional().nullable(),
})

// ─── Types ───────────────────────────────────────────────────────────────────
export type PipelineActionState = {
  success?: boolean
  data?: unknown
  error?: string
  fieldErrors?: Record<string, string[]>
}

// ─── Create Oportunidad ──────────────────────────────────────────────────────
export async function createOportunidad(
  formData: FormData
): Promise<PipelineActionState> {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) return { error: "No autenticado" }
    const tenantId = 1

    const rawData = {
      titulo: formData.get("titulo"),
      id_cliente: formData.get("id_cliente"),
      id_propiedad: formData.get("id_propiedad") || null,
      valor_estimado: formData.get("valor_estimado") || null,
      probabilidad: formData.get("probabilidad") || 10,
      notas: formData.get("notas") || null,
    }

    const validation = createOportunidadSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        error: "Por favor corrige los errores del formulario",
        fieldErrors: validation.error.flatten().fieldErrors,
      }
    }

    const data = validation.data

    // Verificar que el cliente pertenece al tenant
    const cliente = await prisma.cliente.findFirst({
      where: { id_cliente: data.id_cliente, id_tenant: tenantId, deletedAt: null },
    })
    if (!cliente) {
      return { error: "El cliente seleccionado no existe o no pertenece a tu cuenta" }
    }

    const nueva = await prisma.oportunidad.create({
      data: {
        id_tenant: tenantId,
        id_cliente: data.id_cliente,
        id_asesor: null,
        id_propiedad: data.id_propiedad ?? null,
        titulo: data.titulo,
        estado: EstadoOportunidad.NUEVO,
        valor_estimado: data.valor_estimado ?? null,
        probabilidad: data.probabilidad,
        notas: data.notas ?? null,
      },
      include: {
        cliente: { select: { nombre: true, apellido_paterno: true } },
      },
    })

    revalidatePath("/dashboard/pipeline")
    return { success: true, data: nueva }
  } catch (error) {
    console.error("Error al crear oportunidad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al crear la oportunidad",
    }
  }
}

// ─── Update Estado (drag & drop / botones) ───────────────────────────────────
export async function updateOportunidadEstado(
  id: number,
  nuevoEstado: EstadoOportunidad
): Promise<PipelineActionState> {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) return { error: "No autenticado" }
    const tenantId = 1

    const existente = await prisma.oportunidad.findFirst({
      where: { id_oportunidad: id, id_tenant: tenantId },
    })
    if (!existente) {
      return { error: "Oportunidad no encontrada o sin permisos" }
    }

    const actualizada = await prisma.oportunidad.update({
      where: { id_oportunidad: id },
      data: { estado: nuevoEstado },
    })

    revalidatePath("/dashboard/pipeline")
    return { success: true, data: actualizada }
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al actualizar el estado",
    }
  }
}

// ─── Delete Oportunidad ──────────────────────────────────────────────────────
export async function deleteOportunidad(id: number): Promise<PipelineActionState> {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) return { error: "No autenticado" }
    const tenantId = 1

    const existente = await prisma.oportunidad.findFirst({
      where: { id_oportunidad: id, id_tenant: tenantId },
    })
    if (!existente) {
      return { error: "Oportunidad no encontrada o sin permisos" }
    }

    await prisma.oportunidad.delete({ where: { id_oportunidad: id } })

    revalidatePath("/dashboard/pipeline")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar oportunidad:", error)
    return { error: error instanceof Error ? error.message : "Error inesperado" }
  }
}
