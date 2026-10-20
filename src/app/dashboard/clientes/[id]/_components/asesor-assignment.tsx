"use client"

import { useState, useTransition } from "react"
import { UserCheck, UserX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assignClientAsesor } from "../../actions"

interface AsesorOption {
  id_asesor: number
  nombre: string
  apellidos: string
}

interface Props {
  idCliente: number
  idAsesorActual: number | null
  asesores: AsesorOption[]
}

export function AsesorAssignment({ idCliente, idAsesorActual, asesores }: Props) {
  const [selectedAsesor, setSelectedAsesor] = useState<string>(
    idAsesorActual ? String(idAsesorActual) : "ninguno"
  )
  const [isPending, startTransition] = useTransition()

  const handleAssign = (val: string) => {
    setSelectedAsesor(val)
    const newId = val === "ninguno" ? null : parseInt(val, 10)
    startTransition(async () => {
      const res = await assignClientAsesor(idCliente, newId)
      if (res.error) {
        setSelectedAsesor(idAsesorActual ? String(idAsesorActual) : "ninguno")
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedAsesor} onValueChange={handleAssign} disabled={isPending}>
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Asignar asesor..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ninguno">
            <span className="flex items-center gap-2 text-muted-foreground">
              <UserX className="h-3.5 w-3.5" />
              Sin Asignar (Huérfano)
            </span>
          </SelectItem>
          {asesores.map((a) => (
            <SelectItem key={a.id_asesor} value={String(a.id_asesor)}>
              <span className="flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                {a.nombre} {a.apellidos}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}
