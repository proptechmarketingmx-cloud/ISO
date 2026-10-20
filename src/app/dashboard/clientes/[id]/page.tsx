import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  User,
  CreditCard,
  Search,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Briefcase,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { calcularCompatibilidad } from "@/../lib/services/matchingService"
import { ClienteEstadoSelect } from "./_components/cliente-estado-select"
import { AsesorAssignment } from "./_components/asesor-assignment"
import { VincularPropiedadBtn } from "./_components/vincular-propiedad-btn"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  params: {
    id: string
  }
}

export default async function ClienteDetailPage({ params }: Props) {
  const idNumber = parseInt(params.id, 10)
  if (isNaN(idNumber)) {
    notFound()
  }

  const session = await auth()
  const user = session?.user
  if (!user) redirect("/login")
  const tenantId = 1

  // Fetch cliente con relaciones
  const cliente = await prisma.cliente.findFirst({
    where: {
      id_cliente: idNumber,
      id_tenant: tenantId,
      deletedAt: null,
    },
    include: {
      asesor: true,
      notas: {
        orderBy: { fecha: "desc" },
        take: 5,
      },
    },
  })

  if (!cliente) {
    notFound()
  }

  // Fetch oportunidades de forma desacoplada
  type OportunidadItem = {
    id_oportunidad: number
    titulo: string
    estado: string
    valor_estimado: number | null
    probabilidad: number
    propiedad?: {
      id_propiedad: number
      titulo: string
      precio: number | null
      recamaras: number | null
      banos: number | null
    } | null
  }

  let oportunidades: OportunidadItem[] = []
  const prismaExtended = prisma as unknown as {
    oportunidad?: {
      findMany: (args: unknown) => Promise<OportunidadItem[]>
    }
  }

  if (prismaExtended.oportunidad && typeof prismaExtended.oportunidad.findMany === "function") {
    try {
      oportunidades = await prismaExtended.oportunidad.findMany({
        where: { id_cliente: idNumber, id_tenant: tenantId },
        orderBy: { creado_en: "desc" },
        include: {
          propiedad: {
            select: { id_propiedad: true, titulo: true, precio: true, recamaras: true, banos: true },
          },
        },
      })
    } catch {
      oportunidades = []
    }
  }

  // Fetch asesores del tenant
  const asesores = await prisma.asesor.findMany({
    where: { id_tenant: tenantId, status: "activo" },
    select: { id_asesor: true, nombre: true, apellidos: true },
    orderBy: { nombre: "asc" },
  })

  // Fetch propiedades disponibles para matching CNA
  const propiedades = await prisma.propiedad.findMany({
    where: {
      id_tenant: tenantId,
      status: "disponible",
      deletedAt: null,
    },
    take: 50,
  })

  // Calcular score CNA para cada propiedad
  const matchResults = propiedades
    .map((prop) => {
      const match = calcularCompatibilidad(cliente, prop)
      return {
        propiedad: prop,
        match,
      }
    })
    .sort((a, b) => b.match.score_total - a.match.score_total)

  const topMatches = matchResults.slice(0, 6)

  // Oportunidades activas en trámite
  const oportunidadesActivas = oportunidades.filter(
    (o) => !["CERRADO_GANADO", "CERRADO_PERDIDO"].includes(o.estado)
  )

  const propiedadesEnTramite = oportunidades.filter(
    (o) =>
      ["VISITA_PROGRAMADA", "EN_NEGOCIACION"].includes(o.estado) &&
      o.propiedad !== null &&
      o.propiedad !== undefined
  )

  // Formateadores
  const formatMXN = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "No especificado"
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const nombreCompleto = [cliente.nombre, cliente.apellido_paterno]
    .filter((n) => n && n !== "-")
    .join(" ")

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {nombreCompleto || cliente.nombre}
              </h1>
              <Badge variant="outline" className="text-xs">
                ID #{cliente.id_cliente}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Registrado el{" "}
              {new Intl.DateTimeFormat("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(new Date(cliente.fecha_registro))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector rápido de Estado Macro */}
          <ClienteEstadoSelect
            idCliente={cliente.id_cliente}
            estadoActual={cliente.estado_cliente || "nuevo"}
          />

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clientes/${cliente.id_cliente}/editar`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar Ficha
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── ALERTA: Lead Huérfano (Pregunta 5) ─── */}
      {!cliente.id_asesor && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Lead Huérfano — Sin Asesor Asignado</p>
              <p className="text-xs opacity-90">
                Este cliente no tiene un asesor asignado actualmente. Selecciona un asesor para darle seguimiento.
              </p>
            </div>
          </div>
          <AsesorAssignment
            idCliente={cliente.id_cliente}
            idAsesorActual={null}
            asesores={asesores}
          />
        </div>
      )}

      {/* ─── Grid de las 5 Preguntas Clave ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── COLUMNA 1: PREGUNTA 1 (Etapas) & PREGUNTA 5 (Asesor) ── */}
        <div className="space-y-6">

          {/* PREGUNTA 1: ¿Cómo se diferencia en qué etapa se encuentra cada cliente? */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  1. Etapa del Cliente
                </CardTitle>
                <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                  Doble Nivel
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Macro: Estado del contacto • Micro: Oportunidades en embudo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nivel Macro */}
              <div className="p-3 rounded-md bg-muted/50 border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Estado Macro
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm capitalize">
                    {cliente.estado_cliente || "nuevo"}
                  </span>
                  <ClienteEstadoSelect
                    idCliente={cliente.id_cliente}
                    estadoActual={cliente.estado_cliente || "nuevo"}
                  />
                </div>
              </div>

              {/* Nivel Micro: Oportunidades en Pipeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Oportunidades en Pipeline ({oportunidades.length})
                  </p>
                  <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                    <Link href="/dashboard/pipeline">Ver Kanban →</Link>
                  </Button>
                </div>

                {oportunidades.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">
                    Sin oportunidades registradas en el pipeline de ventas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {oportunidades.map((op) => (
                      <div
                        key={op.id_oportunidad}
                        className="p-2.5 rounded-md border bg-card text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate pr-2">{op.titulo}</span>
                          <Badge
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              op.estado === "CERRADO_GANADO" && "bg-emerald-600 text-white",
                              op.estado === "CERRADO_PERDIDO" && "bg-red-600 text-white",
                              op.estado === "EN_NEGOCIACION" && "bg-amber-600 text-white",
                              op.estado === "VISITA_PROGRAMADA" && "bg-purple-600 text-white",
                              op.estado === "CONTACTADO" && "bg-blue-600 text-white",
                              op.estado === "NUEVO" && "bg-slate-600 text-white"
                            )}
                          >
                            {op.estado.replace("_", " ")}
                          </Badge>
                        </div>
                        {op.propiedad && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            🏠 {op.propiedad.titulo}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-muted-foreground pt-1">
                          <span>
                            Valor:{" "}
                            <strong className="text-foreground">
                              {formatMXN(op.valor_estimado)}
                            </strong>
                          </span>
                          <span>Probabilidad: {op.probabilidad}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PREGUNTA 5: ¿Cómo identificar qué asesor está asignado? */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                5. Asesor Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.asesor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {cliente.asesor.nombre[0]}
                      {cliente.asesor.apellidos[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {cliente.asesor.nombre} {cliente.asesor.apellidos}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {cliente.asesor.status || "Activo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                    {cliente.asesor.telefono && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {cliente.asesor.telefono}
                      </p>
                    )}
                    {cliente.asesor.correo && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        {cliente.asesor.correo}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-[11px] text-muted-foreground mb-1.5">Reasignar asesor:</p>
                    <AsesorAssignment
                      idCliente={cliente.id_cliente}
                      idAsesorActual={cliente.id_asesor}
                      asesores={asesores}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Este cliente está huérfano. Asígnalo a un asesor para dar seguimiento:
                  </p>
                  <AsesorAssignment
                    idCliente={cliente.id_cliente}
                    idAsesorActual={null}
                    asesores={asesores}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Contacto Directo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Datos de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Correo:</span>
                <span className="font-medium truncate max-w-[180px]">{cliente.correo || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-medium">{cliente.telefono_principal || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">WhatsApp:</span>
                <span className="font-medium">{cliente.whatsapp || cliente.telefono_principal || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Origen:</span>
                <span className="font-medium">{cliente.origen || cliente.fuente_lead || "Directo"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── COLUMNA 2: PREGUNTA 2 (Ficha Financiera) & PREGUNTA 3 (Perfil CNA) ── */}
        <div className="space-y-6">

          {/* PREGUNTA 2: ¿Cómo identificar qué crédito usa el cliente? */}
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  2. Ficha Financiera & Crédito
                </CardTitle>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {cliente.tipo_credito || "Sin Crédito Especificado"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Capacidad de compra, liquidez y tipo de financiamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/40 border">
                  <p className="text-[11px] text-muted-foreground font-medium">Tipo de Crédito</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {cliente.tipo_credito || "No definido"}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border">
                  <p className="text-[11px] text-muted-foreground font-medium">Crédito Máx.</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatMXN(cliente.capacidad_credito_max)}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border">
                  <p className="text-[11px] text-muted-foreground font-medium">Enganche Disp.</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {formatMXN(cliente.enganche_disponible)}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border">
                  <p className="text-[11px] text-muted-foreground font-medium">Ingreso Mensual</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {formatMXN(cliente.ingreso_mensual)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-md border bg-card space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rango de Presupuesto:</span>
                  <span className="font-semibold">
                    {cliente.presupuesto_min || cliente.presupuesto_max
                      ? `${formatMXN(cliente.presupuesto_min)} – ${formatMXN(cliente.presupuesto_max)}`
                      : "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago Mensual Objetivo:</span>
                  <span className="font-semibold">{formatMXN(cliente.pago_mensual_objetivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocupación / Empresa:</span>
                  <span className="font-semibold">
                    {[cliente.ocupacion, cliente.nombre_empresa].filter(Boolean).join(" en ") || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PREGUNTA 3: ¿Cómo identificar qué busca cada cliente o en qué trámite se encuentra? */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  3. Perfil de Búsqueda (CNA)
                </CardTitle>
                <Badge
                  variant={cliente.operacion === "COMPRA" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {cliente.operacion || "COMPRA"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Necesidades físicas, zonas de interés y trámite actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Características del inmueble */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Tipo Inmueble:</span>
                  <span className="font-semibold">{cliente.tipo_propiedad || "Cualquiera"}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Recámaras PA/PB:</span>
                  <span className="font-semibold">
                    {cliente.habitaciones_pa ?? "—"} PA / {cliente.habitaciones_pb ?? "—"} PB
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Baños:</span>
                  <span className="font-semibold">{cliente.banos ?? "No especificado"}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Estacionamiento:</span>
                  <span className="font-semibold">{cliente.estacionamiento ?? "—"} autos</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Construcción Mín:</span>
                  <span className="font-semibold">
                    {cliente.m2_construccion_min ? `${cliente.m2_construccion_min} m²` : "—"}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/40">
                  <span className="text-muted-foreground">Terreno Mín:</span>
                  <span className="font-semibold">
                    {cliente.m2_terreno_min ? `${cliente.m2_terreno_min} m²` : "—"}
                  </span>
                </div>
              </div>

              {/* Ubicación de Búsqueda */}
              <div className="p-2.5 rounded border bg-card text-xs space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Zona de Búsqueda
                </p>
                <p className="font-medium text-foreground">
                  {[
                    cliente.fraccionamiento_colonia,
                    cliente.ciudad_busqueda,
                    cliente.estado_busqueda,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No especificada"}
                </p>
              </div>

              {/* ¿En qué trámite se encuentra? */}
              <div className="p-3 rounded-md border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-xs space-y-1.5">
                <p className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  Trámites en Curso
                </p>
                {oportunidadesActivas.length > 0 ? (
                  <ul className="space-y-1">
                    {oportunidadesActivas.map((op) => (
                      <li key={op.id_oportunidad} className="text-muted-foreground">
                        • <strong>{op.titulo}</strong> — Etapa:{" "}
                        <span className="font-semibold text-foreground">
                          {op.estado.replace("_", " ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    Sin trámites activos en este momento.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── COLUMNA 3: PREGUNTA 4 (Matching Automático CNA y Propiedad en Trámite) ── */}
        <div className="space-y-6">

          {/* PREGUNTA 4: ¿Cómo identificar qué propiedad está buscando o comprando? */}
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  4. Matching CNA & Propiedades
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {matchResults.length} Catálogo
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Propiedades con mayor compatibilidad calculadas automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Propiedad en Trámite Activo (si existe en pipeline) */}
              {propiedadesEnTramite.length > 0 && (
                <div className="p-3 rounded-lg border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Propiedad en Trámite Activo
                  </div>
                  {propiedadesEnTramite.map((op) => (
                    <div key={op.id_oportunidad} className="text-xs space-y-0.5">
                      <p className="font-bold text-foreground">
                        {op.propiedad?.titulo}
                      </p>
                      <p className="text-muted-foreground">
                        {formatMXN(op.propiedad?.precio)} • Etapa: {op.estado.replace("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Matches Automáticos */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Propiedades Compatibles
                </p>

                {topMatches.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">
                    No hay propiedades disponibles registradas en el catálogo.
                  </p>
                ) : (
                  topMatches.map(({ propiedad, match }) => {
                    const score = Math.round(match.score_total)
                    const nivel = match.nivel

                    return (
                      <div
                        key={propiedad.id_propiedad}
                        className="p-3 rounded-lg border bg-card text-xs space-y-2 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold line-clamp-1">{propiedad.titulo}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {[propiedad.tipo, propiedad.ciudad].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs font-bold shrink-0",
                              nivel === "excelente" && "bg-emerald-600 text-white",
                              nivel === "alta" && "bg-blue-600 text-white",
                              nivel === "media" && "bg-amber-600 text-white",
                              nivel === "baja" && "bg-slate-500 text-white"
                            )}
                          >
                            {score}% Match
                          </Badge>
                        </div>

                        {/* Desglose de Score */}
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground pt-1 border-t">
                          <span>Geo: {Math.round(match.score_geo)}%</span>
                          <span>Eco: {Math.round(match.score_economico)}%</span>
                          <span>Físico: {Math.round(match.score_fisico)}%</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-foreground">
                            {formatMXN(propiedad.precio)}
                          </span>

                          <VincularPropiedadBtn
                            idCliente={cliente.id_cliente}
                            idPropiedad={propiedad.id_propiedad}
                            propiedadTitulo={propiedad.titulo}
                            propiedadPrecio={propiedad.precio}
                            clienteNombre={nombreCompleto || cliente.nombre}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
