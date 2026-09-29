import Link from "next/link"
import { Plus } from "lucide-react"
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

// Datos de ejemplo — reemplazar con query Prisma cuando haya BD
const propiedades = [
  { id: 1, titulo: "Casa en Juriquilla", tipo: "Casa", operacion: "Venta", precio: 3500000, status: "disponible", ciudad: "Querétaro" },
  { id: 2, titulo: "Departamento Santa Fe", tipo: "Departamento", operacion: "Renta", precio: 18000, status: "disponible", ciudad: "CDMX" },
  { id: 3, titulo: "Local Comercial Centro", tipo: "Local", operacion: "Venta", precio: 1200000, status: "vendida", ciudad: "Guadalajara" },
]

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  disponible: "default",
  apartada: "secondary",
  vendida: "outline",
  rentada: "outline",
}

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground mt-1">Gestión del inventario inmobiliario</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/nueva">
            <Plus className="h-4 w-4" />
            Nueva Propiedad
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Operación</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propiedades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No hay propiedades registradas
                </TableCell>
              </TableRow>
            ) : (
              propiedades.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.titulo}</TableCell>
                  <TableCell>{p.tipo}</TableCell>
                  <TableCell>{p.operacion}</TableCell>
                  <TableCell>{p.ciudad}</TableCell>
                  <TableCell className="text-right">
                    {p.precio.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[p.status] ?? "outline"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
