import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
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

  const session = await verifySession()
  const tenantId = session?.tenantId || 1

  const client = await prisma.cliente.findUnique({
    where: {
      id_cliente: idNumber,
    },
    include: {
      notas: {
        take: 1,
        orderBy: {
          fecha: "desc",
        },
      },
    },
  })

  if (!client || client.id_tenant !== tenantId || client.deletedAt) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground mt-1">
            Modifica la información y notas del prospecto #{client.id_cliente} ({client.nombre}).
          </p>
        </div>
      </div>

      <ClientForm
        initialData={{
          id_cliente: client.id_cliente,
          nombre: client.nombre,
          apellido_paterno: client.apellido_paterno,
          correo: client.correo,
          telefono_principal: client.telefono_principal,
          presupuesto_min: client.presupuesto_min,
          operacion: client.operacion,
          ultimaNota: client.notas[0]?.contenido || null,
        }}
      />
    </div>
  )
}
