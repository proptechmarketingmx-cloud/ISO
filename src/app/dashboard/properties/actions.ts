"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const crearPropiedadSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  tipo: z.string().min(1, "El tipo de propiedad es obligatorio"),
  tipo_operacion: z.string().default("Venta"),
  ciudad: z.string().min(1, "La ciudad es obligatoria"),
  precio: z.coerce.number().positive("El precio debe ser un número positivo"),
})

export async function crearPropiedad(formData: FormData) {
  const rawData = {
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    tipo_operacion: formData.get("tipo_operacion") || "Venta",
    ciudad: formData.get("ciudad"),
    precio: formData.get("precio"),
  }

  const validatedData = crearPropiedadSchema.parse(rawData)

  await prisma.propiedad.create({
    data: {
      id_tenant: 1,
      id_asesor: 1,
      titulo: validatedData.titulo,
      tipo: validatedData.tipo,
      tipo_operacion: validatedData.tipo_operacion,
      ciudad: validatedData.ciudad,
      precio: validatedData.precio,
      status: "disponible",
      creditos_aceptados: [],
      ideal_para: [],
      amenidades: [],
      servicios: [],
    },
  })

  revalidatePath("/dashboard/properties")
  redirect("/dashboard/properties")
}
