import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClientForm } from "../_components/client-form"

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-muted-foreground mt-1">
            Registra los datos de un nuevo cliente o prospecto interesado.
          </p>
        </div>
      </div>

      <ClientForm />
    </div>
  )
}
