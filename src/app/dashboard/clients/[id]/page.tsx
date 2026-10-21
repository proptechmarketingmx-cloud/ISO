import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  params: { id: string }
}

export default async function ClienteDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      oportunidades: {
        include: {
          propiedad: {
            include: { tipoPropiedad: true, tipoOperacion: true },
          },
          asesor: true,
        },
        orderBy: { fechaCreacion: "desc" },
      },
      referidoPorCliente: true,
      referidoPorAsesor: true,
    },
  })

  if (!cliente) notFound()

  const fullName = [cliente.nombre, cliente.apellidoPaterno, cliente.apellidoMaterno]
    .filter(Boolean)
    .join(" ")
  const formatCurrency = (value: number | null) =>
    value === null
      ? "No especificado"
      : new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        }).format(value)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href="/dashboard/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a clientes
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <p className="text-sm text-muted-foreground">
            Cliente #{cliente.id} · Registro{" "}
            {cliente.fechaRegistro.toLocaleDateString("es-MX")}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/clients/${cliente.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar cliente
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Correo" value={cliente.email} />
            <Detail label="Teléfono" value={cliente.telefono} />
            <Detail label="Estado" value={cliente.estado} />
            <Detail label="Ciudad" value={cliente.ciudad} />
            <Detail label="Municipio" value={cliente.municipio} />
            <Detail label="Colonia" value={cliente.colonia} />
            <Detail label="CURP" value={cliente.curp} />
            <Detail label="RFC" value={cliente.rfc} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias de búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Presupuesto"
              value={`${formatCurrency(cliente.presupuestoMin)} – ${formatCurrency(cliente.presupuestoMax)}`}
            />
            <Detail label="Recámaras mínimas" value={cliente.recamarasMin} />
            <Detail label="Baños mínimos" value={cliente.banosMin} />
            <Detail label="Operación" value={cliente.tipoOperacionDeseada} />
            <Detail label="Tipo de propiedad" value={cliente.tipoPropiedadDeseada} />
            <Detail
              label="Referido por"
              value={
                cliente.referidoPorCliente
                  ? cliente.referidoPorCliente.nombre
                  : cliente.referidoPorAsesor?.nombre
              }
            />
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Estado del lead</p>
              <Badge variant="secondary" className="mt-1">
                {cliente.estadoLead.replaceAll("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          {cliente.oportunidades.length ? (
            <div className="space-y-3">
              {cliente.oportunidades.map((oportunidad) => (
                <div
                  key={oportunidad.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium">{oportunidad.propiedad.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {oportunidad.propiedad.tipoPropiedad.nombre} ·{" "}
                      {oportunidad.propiedad.tipoOperacion.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(oportunidad.valorEstimado)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {oportunidad.estado.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este cliente todavía no tiene oportunidades registradas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "No especificado"}</p>
    </div>
  )
}
