import Link from "next/link"
import { Plus, Pencil, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  disponible: "default",
  apartada: "secondary",
  vendida: "outline",
  rentada: "outline",
}

export default async function PropertiesPage() {
  const session = await auth()
  const user = session?.user
  if (!user) redirect("/login")
  const tenantId = 1

  const properties = await prisma.propiedad.findMany({
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
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground mt-1">Gestión del inventario inmobiliario</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/propiedades/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Propiedad
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No hay propiedades</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm">
              Aún no has dado de alta ninguna propiedad en el catálogo. Publica tu primer inmueble.
            </p>
            <Button asChild>
              <Link href="/dashboard/propiedades/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Propiedad
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id_propiedad}>
                  <TableCell className="font-medium">{p.titulo}</TableCell>
                  <TableCell>{p.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={p.tipo_operacion === "Venta" ? "default" : "secondary"}>
                      {p.tipo_operacion}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.ciudad || "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {p.precio.toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[p.status] ?? "outline"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/propiedades/${p.id_propiedad}/editar`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
