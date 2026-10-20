"use client"

import { useState, useTransition } from "react"
import { PlusCircle, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createOportunidad } from "@/app/dashboard/pipeline/actions"

interface Props {
  idCliente: number
  idPropiedad: number
  propiedadTitulo: string
  propiedadPrecio: number | null
  clienteNombre: string
}

export function VincularPropiedadBtn({
  idCliente,
  idPropiedad,
  propiedadTitulo,
  propiedadPrecio,
  clienteNombre,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const defaultTitulo = `Interés en ${propiedadTitulo} – ${clienteNombre}`

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("id_cliente", String(idCliente))
    formData.set("id_propiedad", String(idPropiedad))

    startTransition(async () => {
      const res = await createOportunidad(formData)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 1200)
      } else {
        setError(res.error || "Error al crear la oportunidad")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
          <PlusCircle className="h-3.5 w-3.5" />
          Iniciar Oportunidad
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Vincular Propiedad a Pipeline</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">¡Oportunidad creada en el Pipeline!</p>
            <p className="text-xs text-muted-foreground">
              Se ha agregado en la columna &quot;Nuevo&quot; vinculando esta propiedad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-md bg-destructive/15 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título de la Oportunidad</Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={defaultTitulo}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="valor_estimado">Valor Estimado (MXN)</Label>
                <Input
                  id="valor_estimado"
                  name="valor_estimado"
                  type="number"
                  defaultValue={propiedadPrecio || ""}
                  placeholder="Ej. 2500000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="probabilidad">Probabilidad Inicial (%)</Label>
                <Input
                  id="probabilidad"
                  name="probabilidad"
                  type="number"
                  defaultValue="20"
                  min="0"
                  max="100"
                  step="5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notas">Notas / Comentarios CNA</Label>
              <Textarea
                id="notas"
                name="notas"
                placeholder="Observaciones de por qué esta propiedad se ajusta a lo que busca..."
                rows={2}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Agregar a Pipeline"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
