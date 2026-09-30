"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  createClient,
  updateClient,
  type CreateClientState,
} from "../actions"

export type ClientInitialData = {
  id_cliente: number
  nombre: string
  apellido_paterno?: string | null
  correo?: string | null
  telefono_principal?: string | null
  presupuesto_min?: number | null
  operacion?: string | null
  ultimaNota?: string | null
}

interface ClientFormProps {
  initialData?: ClientInitialData | null
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  const defaultNombre = initialData
    ? [initialData.nombre, initialData.apellido_paterno]
        .filter((p) => p && p !== "-")
        .join(" ")
    : ""

  const [operacion, setOperacion] = useState<string>(
    initialData?.operacion || "COMPRA"
  )
  const [state, setState] = useState<CreateClientState | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(null)
    const formData = new FormData(event.currentTarget)
    formData.set("operacion", operacion)

    startTransition(async () => {
      let response: CreateClientState
      if (isEditing && initialData) {
        response = await updateClient(initialData.id_cliente, formData)
      } else {
        response = await createClient(formData)
      }

      if (response.success) {
        router.push("/dashboard/clients")
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
          {isEditing ? "Editar Cliente" : "Información del Cliente"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza los datos y requerimientos de búsqueda del prospecto."
            : "Ingresa la información básica y los requerimientos de búsqueda del prospecto."}
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
            <Label htmlFor="nombre">
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={defaultNombre}
              placeholder="Ej. Roberto Morales Sánchez"
              aria-invalid={!!fieldErrors.nombre}
            />
            {fieldErrors.nombre && (
              <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                defaultValue={initialData?.correo || ""}
                placeholder="ejemplo@correo.com"
                aria-invalid={!!fieldErrors.correo}
              />
              {fieldErrors.correo && (
                <p className="text-xs text-destructive">{fieldErrors.correo[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono_principal">Teléfono Principal</Label>
              <Input
                id="telefono_principal"
                name="telefono_principal"
                type="tel"
                defaultValue={initialData?.telefono_principal || ""}
                placeholder="Ej. 4421234567"
                aria-invalid={!!fieldErrors.telefono_principal}
              />
              {fieldErrors.telefono_principal && (
                <p className="text-xs text-destructive">
                  {fieldErrors.telefono_principal[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operacion">
                Tipo de Operación <span className="text-destructive">*</span>
              </Label>
              <Select value={operacion} onValueChange={setOperacion} name="operacion">
                <SelectTrigger id="operacion" aria-invalid={!!fieldErrors.operacion}>
                  <SelectValue placeholder="Selecciona operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRA">COMPRA</SelectItem>
                  <SelectItem value="RENTA">RENTA</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.operacion && (
                <p className="text-xs text-destructive">{fieldErrors.operacion[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="presupuesto_min">Presupuesto Estimado (MXN)</Label>
              <Input
                id="presupuesto_min"
                name="presupuesto_min"
                type="number"
                step="any"
                defaultValue={
                  initialData?.presupuesto_min != null
                    ? initialData.presupuesto_min
                    : ""
                }
                placeholder="Ej. 2500000"
                aria-invalid={!!fieldErrors.presupuesto_min}
              />
              {fieldErrors.presupuesto_min && (
                <p className="text-xs text-destructive">
                  {fieldErrors.presupuesto_min[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">
              {isEditing ? "Agregar Nueva Nota" : "Notas Iniciales"}
            </Label>
            <Textarea
              id="notas"
              name="notas"
              rows={3}
              defaultValue=""
              placeholder="Detalles sobre preferencias de zona, urgencia de compra o particularidades..."
              aria-invalid={!!fieldErrors.notas}
            />
            {fieldErrors.notas && (
              <p className="text-xs text-destructive">{fieldErrors.notas[0]}</p>
            )}
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
                  : "Guardando Cliente..."
                : isEditing
                ? "Actualizar Cliente"
                : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
