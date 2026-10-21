import { redirect } from "next/navigation"
import { EstadoLead } from "@prisma/client"
import { Kanban } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KanbanBoard, type OportunidadCard } from "./_components/kanban-board"
import { NuevaOportunidadDialog } from "./_components/nueva-oportunidad-dialog"

export const dynamic = "force-dynamic"

const closedStates: EstadoLead[] = [
  EstadoLead.CERRADO_GANADO,
  EstadoLead.CERRADO_PERDIDO,
  EstadoLead.DESCARTADO,
]

export default async function PipelinePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [opportunities, clients, properties] = await Promise.all([
    prisma.oportunidad.findMany({
      include: {
        cliente: { select: { nombre: true, apellidoPaterno: true } },
        propiedad: { select: { titulo: true } },
      },
      orderBy: { fechaCreacion: "desc" },
    }),
    prisma.cliente.findMany({
      select: { id: true, nombre: true, apellidoPaterno: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.propiedad.findMany({
      select: { id: true, titulo: true },
      orderBy: { titulo: "asc" },
    }),
  ])

  const cardsData: OportunidadCard[] = opportunities.map((opportunity) => ({
    id: opportunity.id,
    estado: opportunity.estado,
    valorEstimado: opportunity.valorEstimado,
    probabilidadCierre: opportunity.probabilidadCierre,
    notas: opportunity.notas,
    cliente: opportunity.cliente,
    propiedad: opportunity.propiedad,
  }))

  const valorGanado = opportunities
    .filter((opportunity) => opportunity.estado === EstadoLead.CERRADO_GANADO)
    .reduce((sum, opportunity) => sum + (opportunity.valorEstimado ?? 0), 0)
  const valorPipeline = opportunities
    .filter(
      (opportunity) =>
        !closedStates.includes(opportunity.estado)
    )
    .reduce((sum, opportunity) => sum + (opportunity.valorEstimado ?? 0), 0)

  const formatMXN = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Kanban className="h-7 w-7" />
            Pipeline de Ventas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Embudo de conversión y seguimiento de oportunidades.
          </p>
        </div>
        <NuevaOportunidadDialog clientes={clients} propiedades={properties} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Total Oportunidades" value={opportunities.length} />
        <Metric
          label="En Activo"
          value={
            opportunities.filter(
              (opportunity) =>
                !closedStates.includes(opportunity.estado)
            ).length
          }
        />
        <Metric label="Valor en Pipeline" value={formatMXN(valorPipeline)} />
        <Metric label="Cerrado Ganado" value={formatMXN(valorGanado)} />
      </div>

      {clients.length === 0 || properties.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Registra al menos un cliente y una propiedad para crear oportunidades.
        </div>
      ) : (
        <KanbanBoard initialOportunidades={cardsData} />
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
