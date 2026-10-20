"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createProperty,
  updateProperty,
  type PropertyActionState,
} from "../actions"

export type PropertyInitialData = {
  id_propiedad: number
  titulo: string
  tipo: string
  tipo_operacion: string
  ciudad: string | null
  precio: number
  recamaras?: number | null
  banos?: number | null
}

interface PropertyFormProps {
  initialData?: PropertyInitialData | null
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  const [tipo, setTipo] = useState<string>(initialData?.tipo || "Casa")
  const [tipoOperacion, setTipoOperacion] = useState<string>(
    initialData?.tipo_operacion || "Venta"
  )
  const [state, setState] = useState<PropertyActionState | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(null)
    const formData = new FormData(event.currentTarget)
    formData.set("tipo", tipo)
    formData.set("tipo_operacion", tipoOperacion)

    startTransition(async () => {
      let response: PropertyActionState
      if (isEditing && initialData) {
        response = await updateProperty(initialData.id_propiedad, formData)
      } else {
        response = await createProperty(formData)
      }

      if (response.success) {
        router.push("/dashboard/propiedades")
        router.refresh()
      } else {
        setState(response)
      }
    })
  }

  const fieldErrors = state?.fieldErrors || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Inmueble" : "Información General"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza los datos del inmueble en el catálogo."
            : "Completa los campos requeridos para publicar el inmueble en el inventario."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20 font-medium">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título de la propiedad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={initialData?.titulo || ""}
              placeholder="Ej. Casa en Juriquilla con alberca"
              aria-invalid={!!fieldErrors.titulo}
            />
            {fieldErrors.titulo && (
              <p className="text-xs text-destructive">{fieldErrors.titulo[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de inmueble <span className="text-destructive">*</span>
              </Label>
              <Select value={tipo} onValueChange={setTipo} name="tipo">
                <SelectTrigger id="tipo" aria-invalid={!!fieldErrors.tipo}>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Departamento">Departamento</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Oficina">Oficina</SelectItem>
                  <SelectItem value="Bodega">Bodega</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.tipo && (
                <p className="text-xs text-destructive">{fieldErrors.tipo[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_operacion">
                Tipo de operación <span className="text-destructive">*</span>
              </Label>
              <Select
                value={tipoOperacion}
                onValueChange={setTipoOperacion}
                name="tipo_operacion"
              >
                <SelectTrigger
                  id="tipo_operacion"
                  aria-invalid={!!fieldErrors.tipo_operacion}
                >
                  <SelectValue placeholder="Selecciona la operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venta">Venta</SelectItem>
                  <SelectItem value="Renta">Renta</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.tipo_operacion && (
                <p className="text-xs text-destructive">
                  {fieldErrors.tipo_operacion[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad">
                Ciudad / Municipio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ciudad"
                name="ciudad"
                defaultValue={initialData?.ciudad || ""}
                placeholder="Ej. Querétaro"
                aria-invalid={!!fieldErrors.ciudad}
              />
              {fieldErrors.ciudad && (
                <p className="text-xs text-destructive">{fieldErrors.ciudad[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">
                Precio (MXN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="any"
                defaultValue={initialData?.precio != null ? initialData.precio : ""}
                placeholder="Ej. 3500000"
                aria-invalid={!!fieldErrors.precio}
              />
              {fieldErrors.precio && (
                <p className="text-xs text-destructive">{fieldErrors.precio[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recamaras">Recámaras</Label>
              <Input
                id="recamaras"
                name="recamaras"
                type="number"
                step="1"
                min="0"
                defaultValue={
                  initialData?.recamaras != null ? initialData.recamaras : 0
                }
                placeholder="Ej. 3"
                aria-invalid={!!fieldErrors.recamaras}
              />
              {fieldErrors.recamaras && (
                <p className="text-xs text-destructive">
                  {fieldErrors.recamaras[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banos">Baños</Label>
              <Input
                id="banos"
                name="banos"
                type="number"
                step="0.5"
                min="0"
                defaultValue={
                  initialData?.banos != null ? initialData.banos : 0
                }
                placeholder="Ej. 2.5"
                aria-invalid={!!fieldErrors.banos}
              />
              {fieldErrors.banos && (
                <p className="text-xs text-destructive">{fieldErrors.banos[0]}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? isEditing
                  ? "Guardando Cambios..."
                  : "Guardando Propiedad..."
                : isEditing
                ? "Actualizar Propiedad"
                : "Guardar Propiedad"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
