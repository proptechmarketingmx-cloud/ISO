"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const propiedadSchema = z.object({
  titulo: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  tipo: z.string().trim().min(1, "El tipo de propiedad es obligatorio"),
  tipo_operacion: z.string().trim().default("Venta"),
  ciudad: z.string().trim().min(1, "La ciudad es obligatoria"),
  precio: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número válido" })
    .positive("El precio debe ser un número positivo"),
  recamaras: z.coerce
    .number({ invalid_type_error: "Las recámaras deben ser un número" })
    .int("Debe ser un número entero")
    .nonnegative("No puede ser negativo")
    .default(0),
  banos: z.coerce
    .number({ invalid_type_error: "Los baños deben ser un número" })
    .nonnegative("No puede ser negativo")
    .default(0),
})

export type PropertyActionState = {
  success?: boolean
  data?: any
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createProperty(formData: FormData): Promise<PropertyActionState> {
  try {
    const rawData = {
      titulo: formData.get("titulo"),
      tipo: formData.get("tipo"),
      tipo_operacion: formData.get("tipo_operacion") || "Venta",
      ciudad: formData.get("ciudad"),
      precio: formData.get("precio"),
      recamaras: formData.get("recamaras") || 0,
      banos: formData.get("banos") || 0,
    }

    const validation = propiedadSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        error: "Por favor corrige los campos marcados",
        fieldErrors: validation.error.flatten().fieldErrors,
      }
    }

    const session = await auth()
    const user = session?.user
    if (!user) return { error: "No autenticado" }
    const tenantId = 1
    const validatedData = validation.data

    const nuevaPropiedad = await prisma.propiedad.create({
      data: {
        id_tenant: tenantId,
        id_asesor: 1,
        titulo: validatedData.titulo,
        tipo: validatedData.tipo,
        tipo_operacion: validatedData.tipo_operacion,
        ciudad: validatedData.ciudad,
        precio: validatedData.precio,
        recamaras: validatedData.recamaras,
        banos: validatedData.banos,
        status: "disponible",
        creditos_aceptados: [],
        ideal_para: [],
        amenidades: [],
        servicios: [],
      },
    })

    revalidatePath("/dashboard/propiedades")

    return {
      success: true,
      data: nuevaPropiedad,
    }
  } catch (error) {
    console.error("Error al crear propiedad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al crear la propiedad",
    }
  }
}

// Alias para compatibilidad hacia atrás
export async function crearPropiedad(formData: FormData): Promise<PropertyActionState> {
  return createProperty(formData)
}

export async function updateProperty(
  id: number,
  formData: FormData
): Promise<PropertyActionState> {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) return { error: "No autenticado" }
    const tenantId = 1

    if (!id || typeof id !== "number" || isNaN(id)) {
      return { error: "Identificador de propiedad inválido" }
    }

    const rawData = {
      titulo: formData.get("titulo"),
      tipo: formData.get("tipo"),
      tipo_operacion: formData.get("tipo_operacion") || "Venta",
      ciudad: formData.get("ciudad"),
      precio: formData.get("precio"),
      recamaras: formData.get("recamaras") || 0,
      banos: formData.get("banos") || 0,
    }

    const validation = propiedadSchema.safeParse(rawData)

    if (!validation.success) {
      return {
        error: "Por favor corrige los campos marcados",
        fieldErrors: validation.error.flatten().fieldErrors,
      }
    }

    // Verificar existencia y que pertenezca al tenant del usuario
    const existing = await prisma.propiedad.findFirst({
      where: {
        id_propiedad: id,
        id_tenant: tenantId,
        deletedAt: null,
      },
    })

    if (!existing) {
      return { error: "La propiedad no existe o no tienes permisos para editarla" }
    }

    const validatedData = validation.data

    const propiedadActualizada = await prisma.propiedad.update({
      where: {
        id_propiedad: id,
      },
      data: {
        titulo: validatedData.titulo,
        tipo: validatedData.tipo,
        tipo_operacion: validatedData.tipo_operacion,
        ciudad: validatedData.ciudad,
        precio: validatedData.precio,
        recamaras: validatedData.recamaras,
        banos: validatedData.banos,
      },
    })

    revalidatePath("/dashboard/propiedades")
    revalidatePath(`/dashboard/propiedades/${id}/editar`)

    return {
      success: true,
      data: propiedadActualizada,
    }
  } catch (error) {
    console.error("Error al actualizar propiedad:", error)
    return {
      error:
        error instanceof Error ? error.message : "Error inesperado al actualizar la propiedad",
    }
  }
}
