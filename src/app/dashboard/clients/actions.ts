"use server"

import { EstadoLead } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const optionalText = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.string().trim().nullable().optional()
)

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().finite().nullable().optional()
)

const clientSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellidoPaterno: optionalText,
  email: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.string().email("Correo inválido").nullable().optional()
  ),
  telefono: optionalText,
  presupuestoMin: optionalNumber,
  presupuestoMax: optionalNumber,
  engancheDisponible: optionalNumber,
  capacidadCreditoMax: optionalNumber,
  ingresoMensual: optionalNumber,
  tipoOperacionDeseada: optionalText,
  tipoPropiedadDeseada: optionalText,
  ciudad: optionalText,
  estado: optionalText,
  colonia: optionalText,
  recamarasMin: optionalNumber,
  banosMin: optionalNumber,
  m2TerrenoMin: optionalNumber,
  m2ConstruccionMin: optionalNumber,
})

export type CreateClientState = {
  success?: boolean
  data?: unknown
  error?: string
  fieldErrors?: Record<string, string[]>
}

function getClientInput(formData: FormData) {
  const fullName = String(formData.get("nombre") ?? "").trim().split(/\s+/)
  const nombre = fullName.shift() ?? ""
  const apellidoFromName = fullName.join(" ")

  return {
    nombre,
    apellidoPaterno: apellidoFromName || null,
    email: formData.get("correo"),
    telefono: formData.get("telefono_principal"),
    presupuestoMin: formData.get("presupuesto_min"),
    presupuestoMax: formData.get("presupuesto_max"),
    engancheDisponible: formData.get("enganche_disponible"),
    capacidadCreditoMax: formData.get("capacidad_credito_max"),
    ingresoMensual: formData.get("ingreso_mensual"),
    tipoOperacionDeseada: formData.get("operacion"),
    tipoPropiedadDeseada: formData.get("tipo_propiedad"),
    ciudad: formData.get("ciudad_busqueda"),
    estado: formData.get("estado_busqueda"),
    colonia: formData.get("fraccionamiento_colonia"),
    recamarasMin: formData.get("habitaciones_pa"),
    banosMin: formData.get("banos"),
    m2TerrenoMin: formData.get("m2_terreno_min"),
    m2ConstruccionMin: formData.get("m2_construccion_min"),
  }
}

export async function createClient(
  formData: FormData
): Promise<CreateClientState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para crear clientes" }

  const validation = clientSchema.safeParse(getClientInput(formData))
  if (!validation.success) {
    return {
      error: "Por favor corrige los errores marcados",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const client = await prisma.cliente.create({ data: validation.data })
    revalidatePath("/dashboard/clients")
    return { success: true, data: client }
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
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para editar clientes" }
  if (!Number.isInteger(id) || id <= 0) return { error: "Identificador de cliente inválido" }

  const validation = clientSchema.safeParse(getClientInput(formData))
  if (!validation.success) {
    return {
      error: "Por favor corrige los errores marcados",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const client = await prisma.cliente.update({
      where: { id },
      data: validation.data,
    })
    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${id}`)
    revalidatePath(`/dashboard/clients/${id}/editar`)
    return { success: true, data: client }
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return {
      error: error instanceof Error ? error.message : "Error inesperado al actualizar el cliente",
    }
  }
}

const estadoLeadByFormValue: Record<string, EstadoLead> = {
  nuevo: EstadoLead.NUEVO,
  contactado: EstadoLead.CONTACTADO,
  calificado: EstadoLead.CALIFICADO,
  en_proceso: EstadoLead.NEGOCIACION,
  cerrado: EstadoLead.CERRADO_GANADO,
  inactivo: EstadoLead.DESCARTADO,
  descartado: EstadoLead.DESCARTADO,
}

export async function updateClientEstado(
  id: number,
  nuevoEstado: string
): Promise<CreateClientState> {
  const session = await auth()
  if (!session?.user) return { error: "Debes iniciar sesión para actualizar clientes" }
  if (!Number.isInteger(id) || id <= 0) return { error: "Identificador de cliente inválido" }

  const estado = estadoLeadByFormValue[nuevoEstado.toLowerCase()]
  if (!estado) return { error: "Estado no válido" }

  try {
    const client = await prisma.cliente.update({
      where: { id },
      data: { estadoLead: estado },
    })
    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${id}`)
    return { success: true, data: client }
  } catch (error) {
    console.error("Error al actualizar estado del cliente:", error)
    return {
      error: error instanceof Error ? error.message : "Error al actualizar estado",
    }
  }
}

export async function assignClientAsesor(
  _id: number,
  _idAsesor: number | null
): Promise<CreateClientState> {
  return {
    error: "El esquema actual no contempla una asignación de asesor a cliente",
  }
}
