"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createOportunidad, type PipelineActionState } from "../actions"

interface Cliente {
  id: number
  nombre: string
  apellidoPaterno: string | null
}

interface Propiedad {
  id: number
  titulo: string
}

interface Props {
  clientes: Cliente[]
  propiedades: Propiedad[]
}

export function NuevaOportunidadDialog({ clientes, propiedades }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [idCliente, setIdCliente] = useState<string>("")
  const [idPropiedad, setIdPropiedad] = useState<string>("")
  const [state, setState] = useState<PipelineActionState | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState(null)
    const formData = new FormData(e.currentTarget)
    formData.set("clienteId", idCliente)
    formData.set("propiedadId", idPropiedad)

    startTransition(async () => {
      const res = await createOportunidad(formData)
      if (res.success) {
        setOpen(false)
        setIdCliente("")
        setIdPropiedad("")
      } else {
        setState(res)
      }
    })
  }

  const fieldErrors = state?.fieldErrors || {}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Oportunidad
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Oportunidad de Venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ej. Compra Casa Juriquilla – Juan Pérez"
              aria-invalid={!!fieldErrors.titulo}
            />
            {fieldErrors.titulo && (
              <p className="text-xs text-destructive">{fieldErrors.titulo[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clienteId">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Select value={idCliente} onValueChange={setIdCliente}>
              <SelectTrigger id="clienteId" aria-invalid={!!fieldErrors.clienteId}>
                <SelectValue placeholder="Selecciona un cliente…" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}{" "}
                    {c.apellidoPaterno || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.clienteId && (
              <p className="text-xs text-destructive">{fieldErrors.clienteId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propiedadId">
              Propiedad <span className="text-destructive">*</span>
            </Label>
            <Select value={idPropiedad} onValueChange={setIdPropiedad}>
              <SelectTrigger id="propiedadId" aria-invalid={!!fieldErrors.propiedadId}>
                <SelectValue placeholder="Selecciona una propiedad…" />
              </SelectTrigger>
              <SelectContent>
                {propiedades.map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.propiedadId && (
              <p className="text-xs text-destructive">{fieldErrors.propiedadId[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorEstimado">Valor Estimado (MXN)</Label>
              <Input
                id="valorEstimado"
                name="valorEstimado"
                type="number"
                step="any"
                placeholder="Ej. 3500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probabilidadCierre">Probabilidad (%)</Label>
              <Input
                id="probabilidadCierre"
                name="probabilidadCierre"
                type="number"
                step="5"
                min="0"
                max="100"
                defaultValue={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              rows={2}
              placeholder="Contexto del negocio, urgencia, etc."
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !idCliente || !idPropiedad}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creando…" : "Crear Oportunidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
