"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"

const createClientSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  correo: z
    .string()
    .trim()
    .email("Formato de correo electrónico inválido")
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  telefono_principal: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  presupuesto_min: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z
      .number({ invalid_type_error: "El presupuesto debe ser un número válido" })
      .nonnegative("El presupuesto debe ser mayor o igual a 0")
      .nullable()
      .optional()
  ),
  operacion: z.enum(["COMPRA", "RENTA"], {
    errorMap: () => ({ message: "Selecciona una operación válida ('COMPRA' o 'RENTA')" }),
  }),
  notas: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
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
      presupuesto_min: formData.get("presupuesto_min"),
      operacion: formData.get("operacion"),
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
        presupuesto_min: validatedData.presupuesto_min,
        operacion: validatedData.operacion,
        estado_cliente: "nuevo",
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

    revalidatePath("/dashboard/clients")

    return {
      success: true,
      data: nuevoCliente,
    }
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al crear el cliente",
    }
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
      presupuesto_min: formData.get("presupuesto_min"),
      operacion: formData.get("operacion"),
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
        presupuesto_min: validatedData.presupuesto_min,
        operacion: validatedData.operacion,
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

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${id}`)
    revalidatePath(`/dashboard/clients/${id}/editar`)

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

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${id}`)

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

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${id}`)

    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al asignar asesor:", error)
    return { error: error instanceof Error ? error.message : "Error al asignar asesor" }
  }
}

