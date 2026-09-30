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
  id_cliente: number
  nombre: string
  apellido_paterno: string
}

interface Props {
  clientes: Cliente[]
}

export function NuevaOportunidadDialog({ clientes }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [idCliente, setIdCliente] = useState<string>("")
  const [state, setState] = useState<PipelineActionState | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState(null)
    const formData = new FormData(e.currentTarget)
    formData.set("id_cliente", idCliente)

    startTransition(async () => {
      const res = await createOportunidad(formData)
      if (res.success) {
        setOpen(false)
        setIdCliente("")
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
            <Label htmlFor="id_cliente">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Select value={idCliente} onValueChange={setIdCliente}>
              <SelectTrigger id="id_cliente" aria-invalid={!!fieldErrors.id_cliente}>
                <SelectValue placeholder="Selecciona un cliente…" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                    {c.nombre}{" "}
                    {c.apellido_paterno && c.apellido_paterno !== "-"
                      ? c.apellido_paterno
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.id_cliente && (
              <p className="text-xs text-destructive">{fieldErrors.id_cliente[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_estimado">Valor Estimado (MXN)</Label>
              <Input
                id="valor_estimado"
                name="valor_estimado"
                type="number"
                step="any"
                placeholder="Ej. 3500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probabilidad">Probabilidad (%)</Label>
              <Input
                id="probabilidad"
                name="probabilidad"
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
            <Button type="submit" disabled={isPending || !idCliente}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creando…" : "Crear Oportunidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
