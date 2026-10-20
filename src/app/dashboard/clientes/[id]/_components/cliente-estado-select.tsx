"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateClientEstado } from "../../actions"

const ESTADOS_CLIENTE: { value: string; label: string; badgeClass: string }[] = [
  { value: "nuevo", label: "Nuevo", badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
  { value: "contactado", label: "Contactado", badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" },
  { value: "calificado", label: "Calificado (CNA)", badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200" },
  { value: "en_proceso", label: "En Proceso", badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
  { value: "cerrado", label: "Cerrado ✓", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" },
  { value: "inactivo", label: "Inactivo", badgeClass: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" },
  { value: "descartado", label: "Descartado", badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
]

interface Props {
  idCliente: number
  estadoActual: string
}

export function ClienteEstadoSelect({ idCliente, estadoActual }: Props) {
  const [estado, setEstado] = useState(estadoActual.toLowerCase())
  const [isPending, startTransition] = useTransition()

  const handleChange = (nuevo: string) => {
    setEstado(nuevo)
    startTransition(async () => {
      const res = await updateClientEstado(idCliente, nuevo)
      if (res.error) {
        // Rollback
        setEstado(estadoActual.toLowerCase())
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={estado} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-[170px] h-9">
          <SelectValue placeholder="Estado..." />
        </SelectTrigger>
        <SelectContent>
          {ESTADOS_CLIENTE.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.badgeClass.split(" ")[0]}`} />
                {item.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}
