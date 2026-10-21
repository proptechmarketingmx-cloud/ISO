import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ClientForm } from "../../_components/client-form"

interface EditarClientePageProps {
  params: {
    id: string
  }
}

export const dynamic = "force-dynamic"

export default async function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const idNumber = parseInt(params.id, 10)

  if (isNaN(idNumber)) {
    notFound()
  }

  const session = await auth()
  if (!session?.user) redirect("/login")

  const client = await prisma.cliente.findUnique({
    where: { id: idNumber },
  })

  if (!client) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground mt-1">
            Modifica la información del prospecto #{client.id} ({client.nombre}).
          </p>
        </div>
      </div>

      <ClientForm
        initialData={{
          id_cliente: client.id,
          nombre: client.nombre,
          apellido_paterno: client.apellidoPaterno,
          correo: client.email,
          telefono_principal: client.telefono,
          enganche_disponible: client.engancheDisponible,
          capacidad_credito_max: client.capacidadCreditoMax,
          ingreso_mensual: client.ingresoMensual,
          presupuesto_min: client.presupuestoMin,
          presupuesto_max: client.presupuestoMax,
          operacion: client.tipoOperacionDeseada,
          tipo_propiedad: client.tipoPropiedadDeseada,
          ciudad_busqueda: client.ciudad,
          estado_busqueda: client.estado,
          fraccionamiento_colonia: client.colonia,
          habitaciones_pa: client.recamarasMin,
          banos: client.banosMin,
          m2_terreno_min: client.m2TerrenoMin,
          m2_construccion_min: client.m2ConstruccionMin,
        }}
      />
    </div>
  )
}
