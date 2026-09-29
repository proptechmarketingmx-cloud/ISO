import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { crearPropiedad } from "../actions"

export default function NuevaPropiedadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Propiedad</h1>
          <p className="text-muted-foreground mt-1">
            Ingresa los detalles básicos para dar de alta la propiedad en el inventario.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Completa los campos requeridos para publicar el inmueble.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={crearPropiedad} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título de la propiedad</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej. Casa en Juriquilla con alberca"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de inmueble</Label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  defaultValue="Casa"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Local">Local</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Bodega">Bodega</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_operacion">Tipo de operación</Label>
                <select
                  id="tipo_operacion"
                  name="tipo_operacion"
                  defaultValue="Venta"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Venta">Venta</option>
                  <option value="Renta">Renta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad / Municipio</Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  placeholder="Ej. Querétaro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio (MXN)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="any"
                  placeholder="Ej. 3500000"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" asChild>
                <Link href="/dashboard/properties">Cancelar</Link>
              </Button>
              <Button type="submit">Guardar Propiedad</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
