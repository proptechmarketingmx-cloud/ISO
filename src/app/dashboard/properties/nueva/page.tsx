import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyForm } from "../_components/property-form"

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

      <PropertyForm />
    </div>
  )
}
