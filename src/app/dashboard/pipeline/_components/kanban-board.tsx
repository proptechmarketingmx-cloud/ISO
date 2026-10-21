"use client"

import { useState, useTransition } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { EstadoLead } from "@prisma/client"
import { Loader2, Trash2, GripVertical, DollarSign, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { updateOportunidadEstado, deleteOportunidad } from "../actions"

// ─── Column config ────────────────────────────────────────────────────────────
const COLUMNAS: {
  id: EstadoLead
  label: string
  color: string
  headerColor: string
}[] = [
  {
    id: "NUEVO",
    label: "Nuevo",
    color: "bg-slate-100 dark:bg-slate-900/50",
    headerColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  },
  {
    id: "CONTACTADO",
    label: "Contactado",
    color: "bg-blue-50 dark:bg-blue-950/30",
    headerColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  },
  {
    id: "CALIFICADO",
    label: "Calificado",
    color: "bg-cyan-50 dark:bg-cyan-950/30",
    headerColor: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
  },
  {
    id: "VISITA_AGENDADA",
    label: "Visita Programada",
    color: "bg-violet-50 dark:bg-violet-950/30",
    headerColor: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  },
  {
    id: "PROPUESTA_ENVIADA",
    label: "Propuesta Enviada",
    color: "bg-indigo-50 dark:bg-indigo-950/30",
    headerColor: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
  },
  {
    id: "NEGOCIACION",
    label: "En Negociación",
    color: "bg-amber-50 dark:bg-amber-950/30",
    headerColor: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
  {
    id: "CERRADO_GANADO",
    label: "Cerrado ✓",
    color: "bg-emerald-50 dark:bg-emerald-950/30",
    headerColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "CERRADO_PERDIDO",
    label: "Perdido ✕",
    color: "bg-red-50 dark:bg-red-950/30",
    headerColor: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  },
  {
    id: "DESCARTADO",
    label: "Descartado",
    color: "bg-zinc-50 dark:bg-zinc-950/30",
    headerColor: "bg-zinc-100 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300",
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OportunidadCard {
  id: number
  estado: EstadoLead
  valorEstimado: number | null
  probabilidadCierre: number
  notas: string | null
  cliente: { nombre: string; apellidoPaterno: string | null }
  propiedad: { titulo: string }
}

interface Props {
  initialOportunidades: OportunidadCard[]
}

// ─── Component ────────────────────────────────────────────────────────────────
export function KanbanBoard({ initialOportunidades }: Props) {
  // Estado local: mapa de EstadoLead → tarjetas
  const [columns, setColumns] = useState<Record<EstadoLead, OportunidadCard[]>>(
    () => {
      const map = {} as Record<EstadoLead, OportunidadCard[]>
      COLUMNAS.forEach((col) => {
        map[col.id] = initialOportunidades.filter((o) => o.estado === col.id)
      })
      return map
    }
  )

  const [pendingId, setPendingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  // ── Drag end handler ──────────────────────────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return

    const srcCol = source.droppableId as EstadoLead
    const dstCol = destination.droppableId as EstadoLead
    const id = parseInt(draggableId, 10)

    // Optimistic update
    setColumns((prev) => {
      const srcItems = [...prev[srcCol]]
      const [moved] = srcItems.splice(source.index, 1)
      const dstItems = srcCol === dstCol ? srcItems : [...prev[dstCol]]
      if (srcCol !== dstCol) moved.estado = dstCol
      dstItems.splice(destination.index, 0, moved)
      return {
        ...prev,
        [srcCol]: srcCol === dstCol ? dstItems : srcItems,
        [dstCol]: dstItems,
      }
    })

    if (srcCol !== dstCol) {
      setPendingId(id)
      startTransition(async () => {
        const res = await updateOportunidadEstado(id, dstCol)
        if (!res.success) {
          // Rollback
          setColumns((prev) => {
            const dstItems = [...prev[dstCol]]
            const idx = dstItems.findIndex((o) => o.id === id)
            const [moved] = dstItems.splice(idx, 1)
            moved.estado = srcCol
            const srcItems = [...prev[srcCol]]
            srcItems.splice(source.index, 0, moved)
            return { ...prev, [srcCol]: srcItems, [dstCol]: dstItems }
          })
        }
        setPendingId(null)
      })
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = (id: number, estado: EstadoLead) => {
    if (!confirm("¿Eliminar esta oportunidad?")) return
    // Optimistic remove
    setColumns((prev) => ({
      ...prev,
      [estado]: prev[estado].filter((o) => o.id !== id),
    }))
    startTransition(async () => {
      const res = await deleteOportunidad(id)
      if (!res.success) {
        // On error, Next revalidation will restore from DB
        console.error("Error al eliminar:", res.error)
      }
    })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {COLUMNAS.map((col) => (
          <div
            key={col.id}
            className={cn(
              "flex flex-col rounded-xl flex-shrink-0 w-[280px]",
              col.color
            )}
          >
            {/* Column header */}
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-t-xl font-semibold text-sm",
                col.headerColor
              )}
            >
              <span>{col.label}</span>
              <span className="rounded-full bg-white/50 dark:bg-black/20 px-2 py-0.5 text-xs font-bold">
                {columns[col.id].length}
              </span>
            </div>

            {/* Droppable area */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex flex-col gap-2 p-2 flex-1 min-h-[100px] rounded-b-xl transition-colors",
                    snapshot.isDraggingOver && "bg-black/5 dark:bg-white/5"
                  )}
                >
                  {columns[col.id].map((op, index) => (
                    <Draggable
                      key={op.id}
                      draggableId={String(op.id)}
                      index={index}
                    >
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={cn(
                            "bg-card rounded-lg border shadow-sm p-3 text-sm select-none group",
                            snap.isDragging && "shadow-lg ring-2 ring-primary/30 rotate-1",
                            pendingId === op.id && "opacity-60"
                          )}
                        >
                          {/* Drag handle + delete */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div
                              {...prov.dragHandleProps}
                              className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <button
                              onClick={() => handleDelete(op.id, op.estado)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Title */}
                          <p className="font-semibold leading-tight mb-1 line-clamp-2">
                            {op.propiedad.titulo}
                          </p>

                          {/* Cliente */}
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            👤{" "}
                            {op.cliente.nombre} {op.cliente.apellidoPaterno || ""}
                          </p>

                          {/* Propiedad */}
                          {/* Valor + Probabilidad */}
                          <div className="flex items-center justify-between gap-2 mt-2">
                            {op.valorEstimado != null ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="h-3 w-3" />
                                {new Intl.NumberFormat("es-MX", {
                                  style: "currency",
                                  currency: "MXN",
                                  maximumFractionDigits: 0,
                                }).format(op.valorEstimado)}
                              </span>
                            ) : (
                              <span />
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {op.probabilidadCierre}%
                            </span>
                          </div>

                          {/* Loading indicator */}
                          {pendingId === op.id && (
                            <div className="flex justify-center mt-2">
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Empty state */}
                  {columns[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-center text-xs text-muted-foreground/50 py-6 italic">
                      Sin oportunidades
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
