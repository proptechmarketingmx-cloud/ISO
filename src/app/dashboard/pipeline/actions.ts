"use server"

import { EstadoLead } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createOportunidadSchema = z.object({
  clienteId: z.coerce.number().int().positive("Selecciona un cliente"),
  propiedadId: z.coerce.number().int().positive("Selecciona una propiedad"),
  valorEstimado: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.coerce.number().positive().nullable().optional()
  ),
  probabilidadCierre: z.coerce.number().int().min(0).max(100).default(10),
  notas: z.string().trim().optional().nullable(),
})

export type PipelineActionState = {
  success?: boolean
  data?: unknown
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createOportunidad(
  formData: FormData
): Promise<PipelineActionState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para crear oportunidades" }

  const validation = createOportunidadSchema.safeParse({
    clienteId: formData.get("clienteId"),
    propiedadId: formData.get("propiedadId"),
    valorEstimado: formData.get("valorEstimado"),
    probabilidadCierre: formData.get("probabilidadCierre") || 10,
    notas: formData.get("notas") || null,
  })
  if (!validation.success) {
    return {
      error: "Por favor corrige los errores del formulario",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const data = validation.data
    const [client, property] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: data.clienteId }, select: { id: true } }),
      prisma.propiedad.findUnique({ where: { id: data.propiedadId }, select: { id: true } }),
    ])

    if (!client) return { error: "El cliente seleccionado no existe" }
    if (!property) return { error: "La propiedad seleccionada no existe" }

    const opportunity = await prisma.oportunidad.create({
      data: {
        clienteId: data.clienteId,
        propiedadId: data.propiedadId,
        valorEstimado: data.valorEstimado ?? null,
        probabilidadCierre: data.probabilidadCierre,
        notas: data.notas ?? null,
        estado: EstadoLead.NUEVO,
      },
    })

    revalidatePath("/dashboard/pipeline")
    return { success: true, data: opportunity }
  } catch (error) {
    console.error("Error al crear oportunidad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al crear la oportunidad",
    }
  }
}

export async function updateOportunidadEstado(
  id: number,
  nuevoEstado: EstadoLead
): Promise<PipelineActionState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para actualizar oportunidades" }
  if (!Number.isInteger(id) || id <= 0) return { error: "Identificador de oportunidad inválido" }

  try {
    const opportunity = await prisma.oportunidad.update({
      where: { id },
      data: { estado: nuevoEstado },
    })
    revalidatePath("/dashboard/pipeline")
    return { success: true, data: opportunity }
  } catch (error) {
    console.error("Error al actualizar estado de oportunidad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al actualizar el estado",
    }
  }
}

export async function deleteOportunidad(id: number): Promise<PipelineActionState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para eliminar oportunidades" }
  if (!Number.isInteger(id) || id <= 0) return { error: "Identificador de oportunidad inválido" }

  try {
    await prisma.oportunidad.delete({ where: { id } })
    revalidatePath("/dashboard/pipeline")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar oportunidad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al eliminar la oportunidad",
    }
  }
}
