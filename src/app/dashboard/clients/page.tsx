import Link from "next/link"
import { Plus, Users, Mail, Phone, Pencil, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const session = await verifySession()
  const tenantId = session?.tenantId || 1

  const clients = await prisma.cliente.findMany({
    where: {
      id_tenant: tenantId,
      deletedAt: null,
    },
    orderBy: {
      fecha_registro: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de prospectos y compradores.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No hay clientes</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm">
              Aún no has registrado ningún cliente o prospecto. Agrega el primero para comenzar su seguimiento.
            </p>
            <Button asChild>
              <Link href="/dashboard/clients/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Crear Cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Presupuesto Mín.</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((cliente) => {
                const nombreCompleto = [cliente.nombre, cliente.apellido_paterno]
                  .filter((p) => p && p !== "-")
                  .join(" ")

                const presupuestoFormateado =
                  cliente.presupuesto_min != null
                    ? new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 0,
                      }).format(cliente.presupuesto_min)
                    : "—"

                return (
                  <TableRow key={cliente.id_cliente}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/clients/${cliente.id_cliente}`}
                        className="hover:underline font-semibold text-primary"
                      >
                        {nombreCompleto || cliente.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {cliente.operacion ? (
                        <Badge
                          variant={
                            cliente.operacion === "COMPRA" ? "default" : "secondary"
                          }
                        >
                          {cliente.operacion}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{presupuestoFormateado}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {cliente.correo && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.correo}
                          </span>
                        )}
                        {cliente.telefono_principal && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefono_principal}
                          </span>
                        )}
                        {!cliente.correo && !cliente.telefono_principal && "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                        {cliente.estado_cliente || "nuevo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(cliente.fecha_registro))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/clients/${cliente.id_cliente}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Ficha
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/clients/${cliente.id_cliente}/editar`}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
