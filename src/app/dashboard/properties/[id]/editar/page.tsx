import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
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

  const session = await auth()
  if (!session?.user) redirect("/login")

  const property = await prisma.propiedad.findUnique({
    where: { id: idNumber },
    include: { tipoPropiedad: true, tipoOperacion: true },
  })

  if (!property) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Propiedad</h1>
          <p className="text-muted-foreground mt-1">
            Modifica los detalles del inmueble #{property.id} ({property.titulo}).
          </p>
        </div>
      </div>

      <PropertyForm
        initialData={{
          id_propiedad: property.id,
          titulo: property.titulo,
          tipo: property.tipoPropiedad.nombre,
          tipo_operacion: property.tipoOperacion.nombre,
          ciudad: property.ciudad,
          precio: property.precio,
          recamaras: property.recamaras,
          banos: property.banos,
        }}
      />
    </div>
  )
}
