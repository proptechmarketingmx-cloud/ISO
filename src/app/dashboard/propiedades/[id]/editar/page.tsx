import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { PropertyForm } from "../../_components/property-form"

interface EditarPropiedadPageProps {
  params: {
    id: string
  }
}

export const dynamic = "force-dynamic"

export default async function EditarPropiedadPage({
  params,
}: EditarPropiedadPageProps) {
  const idNumber = parseInt(params.id, 10)

  if (isNaN(idNumber)) {
    notFound()
  }

  const session = await verifySession()
  const tenantId = session?.tenantId || 1

  const property = await prisma.propiedad.findUnique({
    where: {
      id_propiedad: idNumber,
    },
  })

  if (!property || property.id_tenant !== tenantId || property.deletedAt) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/propiedades">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Propiedad</h1>
          <p className="text-muted-foreground mt-1">
            Modifica los detalles del inmueble #{property.id_propiedad} ({property.titulo}).
          </p>
        </div>
      </div>

      <PropertyForm
        initialData={{
          id_propiedad: property.id_propiedad,
          titulo: property.titulo,
          tipo: property.tipo,
          tipo_operacion: property.tipo_operacion,
          ciudad: property.ciudad,
          precio: property.precio,
          recamaras: property.recamaras,
          banos: property.banos,
        }}
      />
    </div>
  )
}
