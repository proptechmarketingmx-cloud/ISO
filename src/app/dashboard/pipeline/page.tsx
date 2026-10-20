import { Kanban } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KanbanBoard, type OportunidadCard } from "./_components/kanban-board"
import { NuevaOportunidadDialog } from "./_components/nueva-oportunidad-dialog"
import { EstadoOportunidad } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function PipelinePage() {
  const session = await auth()
  const user = session?.user
  if (!user) redirect("/login")
  const tenantId = 1

  type OportunidadRecord = {
    id_oportunidad: number
    titulo: string
    estado: EstadoOportunidad
    valor_estimado: number | null
    probabilidad: number
    notas: string | null
    cliente: { nombre: string; apellido_paterno: string }
    propiedad?: { titulo: string } | null
  }

  let oportunidades: OportunidadRecord[] = []
  const prismaExtended = prisma as unknown as {
    oportunidad?: {
      findMany: (args: unknown) => Promise<OportunidadRecord[]>
    }
  }

  if (prismaExtended.oportunidad && typeof prismaExtended.oportunidad.findMany === "function") {
    try {
      oportunidades = await prismaExtended.oportunidad.findMany({
        where: { id_tenant: tenantId },
        orderBy: { creado_en: "asc" },
        include: {
          cliente: {
            select: { nombre: true, apellido_paterno: true },
          },
          propiedad: {
            select: { titulo: true },
          },
        },
      })
    } catch {
      oportunidades = []
    }
  }

  // Fetch clientes para el diálogo de creación
  const clientes = await prisma.cliente.findMany({
    where: { id_tenant: tenantId, deletedAt: null },
    select: { id_cliente: true, nombre: true, apellido_paterno: true },
    orderBy: { nombre: "asc" },
  })

  // Totales por columna
  const totalPorEstado: Record<EstadoOportunidad, number> = {
    NUEVO: 0,
    CONTACTADO: 0,
    VISITA_PROGRAMADA: 0,
    EN_NEGOCIACION: 0,
    CERRADO_GANADO: 0,
    CERRADO_PERDIDO: 0,
  }
  oportunidades.forEach((o) => {
    totalPorEstado[o.estado] = (totalPorEstado[o.estado] || 0) + 1
  })

  const valorTotal = oportunidades
    .filter((o) => o.estado === "CERRADO_GANADO")
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0)

  const valorPipeline = oportunidades
    .filter((o) => !["CERRADO_GANADO", "CERRADO_PERDIDO"].includes(o.estado))
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0)

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val)

  const cardsData: OportunidadCard[] = oportunidades.map((o) => ({
    id_oportunidad: o.id_oportunidad,
    titulo: o.titulo,
    estado: o.estado,
    valor_estimado: o.valor_estimado,
    probabilidad: o.probabilidad,
    notas: o.notas,
    cliente: o.cliente,
    propiedad: o.propiedad,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Kanban className="h-7 w-7" />
            Pipeline de Ventas
          </h1>
          <p className="text-muted-foreground mt-1">
            Embudo de conversión y seguimiento de oportunidades.
          </p>
        </div>
        <NuevaOportunidadDialog clientes={clientes} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Total Oportunidades
          </p>
          <p className="text-2xl font-bold mt-1">{oportunidades.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            En Activo
          </p>
          <p className="text-2xl font-bold mt-1">
            {oportunidades.filter(
              (o) => !["CERRADO_GANADO", "CERRADO_PERDIDO"].includes(o.estado)
            ).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Valor en Pipeline
          </p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {formatMXN(valorPipeline)}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Cerrado Ganado
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {formatMXN(valorTotal)}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      {clientes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Necesitas al menos un cliente para crear oportunidades de venta.{" "}
            <Link href="/dashboard/clientes/nueva" className="text-primary underline">
              Agrega un cliente
            </Link>
            .
          </p>
        </div>
      ) : (
        <KanbanBoard initialOportunidades={cardsData} />
      )}
    </div>
  )
}
