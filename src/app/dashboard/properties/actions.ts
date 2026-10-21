"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const propertySchema = z.object({
  titulo: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  tipo: z.string().trim().min(1, "El tipo de propiedad es obligatorio"),
  tipo_operacion: z.string().trim().min(1, "La operación es obligatoria"),
  ciudad: z.string().trim().min(1, "La ciudad es obligatoria"),
  precio: z.coerce.number().positive("El precio debe ser positivo"),
  recamaras: z.coerce.number().int().nonnegative().default(0),
  banos: z.coerce.number().nonnegative().default(0),
})

export type PropertyActionState = {
  success?: boolean
  data?: unknown
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parsePropertyForm(formData: FormData) {
  return propertySchema.safeParse({
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    tipo_operacion: formData.get("tipo_operacion") || "Venta",
    ciudad: formData.get("ciudad"),
    precio: formData.get("precio"),
    recamaras: formData.get("recamaras") || 0,
    banos: formData.get("banos") || 0,
  })
}

async function getCatalogIds(tipo: string, operacion: string) {
  const tipoPropiedad = await prisma.tipoPropiedad.upsert({
    where: { nombre: tipo },
    update: { activo: true },
    create: { nombre: tipo, activo: true },
  })
  const tipoOperacion = await prisma.tipoOperacion.upsert({
    where: { nombre: operacion },
    update: { activo: true },
    create: { nombre: operacion, activo: true },
  })

  return { tipoPropiedadId: tipoPropiedad.id, tipoOperacionId: tipoOperacion.id }
}

export async function createProperty(formData: FormData): Promise<PropertyActionState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para crear propiedades" }

  const validation = parsePropertyForm(formData)
  if (!validation.success) {
    return {
      error: "Por favor corrige los campos marcados",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const data = validation.data
    const catalogIds = await getCatalogIds(data.tipo, data.tipo_operacion)
    const property = await prisma.propiedad.create({
      data: {
        titulo: data.titulo,
        ciudad: data.ciudad,
        precio: data.precio,
        recamaras: data.recamaras,
        banos: data.banos,
        ...catalogIds,
      },
    })

    revalidatePath("/dashboard/properties")
    return { success: true, data: property }
  } catch (error) {
    console.error("Error al crear propiedad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al crear la propiedad",
    }
  }
}

export async function crearPropiedad(formData: FormData): Promise<PropertyActionState> {
  return createProperty(formData)
}

export async function updateProperty(
  id: number,
  formData: FormData
): Promise<PropertyActionState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para editar propiedades" }
  if (!Number.isInteger(id) || id <= 0) return { error: "Identificador de propiedad inválido" }

  const validation = parsePropertyForm(formData)
  if (!validation.success) {
    return {
      error: "Por favor corrige los campos marcados",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const data = validation.data
    const catalogIds = await getCatalogIds(data.tipo, data.tipo_operacion)
    const property = await prisma.propiedad.update({
      where: { id },
      data: {
        titulo: data.titulo,
        ciudad: data.ciudad,
        precio: data.precio,
        recamaras: data.recamaras,
        banos: data.banos,
        ...catalogIds,
      },
    })

    revalidatePath("/dashboard/properties")
    revalidatePath(`/dashboard/properties/${id}/editar`)
    return { success: true, data: property }
  } catch (error) {
    console.error("Error al actualizar propiedad:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al actualizar la propiedad",
    }
  }
}
