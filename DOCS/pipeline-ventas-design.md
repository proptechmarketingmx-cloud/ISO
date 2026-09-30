# Diseño del Pipeline de Ventas Inmobiliarias (Kanban) — CRM ISO

Este documento define la estructura de datos, el flujo de estados y el diseño de interfaz de usuario para el módulo de Pipeline de Ventas en formato Kanban interactivo para Next.js 14 y Prisma ORM.

---

## 1. Modelo de Datos Prisma: `Oportunidad`

A continuación se define el esquema de Prisma para el modelo `Oportunidad` y su respectivo `enum EstadoOportunidad`, garantizando compatibilidad con el esquema actual de multi-tenancy (`id_tenant`) y claves foráneas a `Cliente`, `Asesor` y `Propiedad`:

```prisma
// Enum de estados del embudo de ventas inmobiliario
enum EstadoOportunidad {
  NUEVO
  CONTACTADO
  VISITA_PROGRAMADA
  EN_NEGOCIACION
  CERRADO_GANADO
  CERRADO_PERDIDO
}

model Oportunidad {
  id_oportunidad  Int               @id @default(autoincrement())
  id_tenant       Int
  id_cliente      Int
  id_asesor       Int
  id_propiedad    Int?

  titulo          String            // Ej. "Compra Casa Juriquilla - Cliente Juan Pérez"
  estado          EstadoOportunidad @default(NUEVO)
  valor_estimado  Float?            // Monto de la operación o valor proyectado
  notas           String?           @db.Text
  probabilidad    Int?              @default(20) // Porcentaje 0 - 100%

  created_at      DateTime          @default(now())
  updated_at      DateTime          @default(now()) @updatedAt
  deletedAt       DateTime?

  // Relaciones
  tenant          Tenant            @relation(fields: [id_tenant], references: [id_tenant], onDelete: Cascade)
  cliente         Cliente           @relation(fields: [id_cliente], references: [id_cliente], onDelete: Cascade)
  asesor          Asesor            @relation(fields: [id_asesor], references: [id_asesor], onDelete: Cascade)
  propiedad       Propiedad?        @relation(fields: [id_propiedad], references: [id_propiedad], onDelete: SetNull)

  @@index([id_tenant])
  @@index([estado])
  @@index([id_asesor])
  @@map("oportunidades")
}
```

---

## 2. Descripción de la Interfaz de Usuario (Kanban con `@hello-pangea/dnd`)

### A. Estructura y Componentes
La vista residirá en `src/app/dashboard/pipeline/page.tsx` y utilizará `@hello-pangea/dnd` (el reemplazo moderno y mantenido de `react-beautiful-dnd` compatible con React 18):

```
Dashboard Pipeline Page
├── KanbanHeader (Filtros por Asesor, Búsqueda, Botón "+ Nueva Oportunidad")
└── DragDropContext (Manejo de eventos onDragEnd)
    └── Contenedor de Columnas (Horizontal scroll / Grid responsivo)
        ├── KanbanColumn [NUEVO] (Droppable droppableId="NUEVO")
        ├── KanbanColumn [CONTACTADO] (Droppable droppableId="CONTACTADO")
        ├── KanbanColumn [VISITA_PROGRAMADA] (Droppable droppableId="VISITA_PROGRAMADA")
        ├── KanbanColumn [EN_NEGOCIACION] (Droppable droppableId="EN_NEGOCIACION")
        ├── KanbanColumn [CERRADO_GANADO] (Droppable droppableId="CERRADO_GANADO")
        └── KanbanColumn [CERRADO_PERDIDO] (Droppable droppableId="CERRADO_PERDIDO")
```

### B. Elementos de cada Tarjeta (`DraggableCard`)
Cada tarjeta de oportunidad en el tablero contiene:
- **Título de la oportunidad**: Resumen claro del negocio.
- **Badge de Cliente**: Nombre completo y enlace rápido a su expediente.
- **Inmueble de interés**: Tag de la propiedad vinculada (si aplica).
- **Monto estimado**: Formateado en MXN (ej. `$3,500,000 MXN`).
- **Avatar del Asesor**: Asignado responsable del seguimiento.
- **Indicador de Antigüedad**: Días en la etapa actual.

### C. Flujo de Interacción y Optimistic Updates
1. **Arrastre y Soltado (`onDragEnd`):**
   - Cuando el usuario arrastra una tarjeta entre columnas, el estado de React se actualiza **optimistamente** de inmediato para dar respuesta visual fluida de 60fps sin latencia.
2. **Disparo de la Server Action:**
   - Se ejecuta en background `updateOportunidadEstado(idOportunidad, nuevoEstado)`.
3. **Manejo de Errores (Rollback):**
   - Si la acción en el servidor falla o la red se desconecta, se revierte la tarjeta a su columna original y se despliega un mensaje de error tipo toast.

---

## 3. Especificación de la Server Action: `updateOportunidadEstado`

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { EstadoOportunidad } from "@prisma/client"

export async function updateOportunidadEstado(
  idOportunidad: number,
  nuevoEstado: EstadoOportunidad
) {
  try {
    const session = await verifySession()
    const tenantId = session?.tenantId || 1

    // 1. Validar que la oportunidad existe y pertenece al tenant
    const oportunidad = await prisma.oportunidad.findFirst({
      where: {
        id_oportunidad: idOportunidad,
        id_tenant: tenantId,
        deletedAt: null,
      },
    })

    if (!oportunidad) {
      return { error: "Oportunidad no encontrada o no autorizada" }
    }

    // 2. Actualizar el estado en base de datos
    const updated = await prisma.oportunidad.update({
      where: {
        id_oportunidad: idOportunidad,
      },
      data: {
        estado: nuevoEstado,
      },
    })

    // 3. Revalidar vistas afectadas
    revalidatePath("/dashboard/pipeline")

    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    console.error("Error al actualizar estado de oportunidad:", error)
    return {
      error: error instanceof Error ? error.message : "Error al actualizar estado",
    }
  }
}
```

---

## 4. Ventajas de la Arquitectura
- **Aislamiento Multi-Tenancy:** Ninguna oportunidad puede ser consultada ni modificada fuera del `id_tenant: 1` del usuario autenticado.
- **Performance:** Carga inicial desde Server Component con hidratación ligera en el cliente solo para el wrapper de Drag and Drop.
- **Integración con Historial:** Cada cambio de estado puede emitir automáticamente un registro de auditoría en `AuditoriaCambios` o en las notas de actividad del cliente.
