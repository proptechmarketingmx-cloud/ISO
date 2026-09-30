"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User, CreditCard, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient, updateClient, type CreateClientState } from "../actions"

export type ClientInitialData = {
  id_cliente: number
  nombre: string
  apellido_paterno?: string | null
  correo?: string | null
  telefono_principal?: string | null
  whatsapp?: string | null
  fuente_lead?: string | null
  tipo_credito?: string | null
  capacidad_credito_max?: number | null
  enganche_disponible?: number | null
  ingreso_mensual?: number | null
  presupuesto_min?: number | null
  presupuesto_max?: number | null
  pago_mensual_objetivo?: number | null
  ocupacion?: string | null
  nombre_empresa?: string | null
  operacion?: string | null
  tipo_propiedad?: string | null
  ciudad_busqueda?: string | null
  estado_busqueda?: string | null
  fraccionamiento_colonia?: string | null
  habitaciones_pa?: number | null
  habitaciones_pb?: number | null
  banos?: number | null
  estacionamiento?: number | null
  m2_construccion_min?: number | null
  m2_terreno_min?: number | null
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
    ? [initialData.nombre, initialData.apellido_paterno].filter((p) => p && p !== "-").join(" ")
    : ""

  const [operacion, setOperacion] = useState<string>(initialData?.operacion || "COMPRA")
  const [tipoCredito, setTipoCredito] = useState<string>(initialData?.tipo_credito || "Contado")
  const [tipoPropiedad, setTipoPropiedad] = useState<string>(initialData?.tipo_propiedad || "Casa")
  const [fuenteLead, setFuenteLead] = useState<string>(initialData?.fuente_lead || "Referido")
  
  const [state, setState] = useState<CreateClientState | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(null)
    const formData = new FormData(event.currentTarget)
    formData.set("operacion", operacion)
    formData.set("tipo_credito", tipoCredito)
    formData.set("tipo_propiedad", tipoPropiedad)
    formData.set("fuente_lead", fuenteLead)
    
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
        <CardTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
        <CardDescription>
          {isEditing ? "Actualiza los datos del prospecto." : "Ingresa la información del prospecto."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basico" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Básico
              </TabsTrigger>
              <TabsTrigger value="financiero" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Financiero
              </TabsTrigger>
              <TabsTrigger value="cna" className="flex items-center gap-2">
                <Search className="h-4 w-4" /> Búsqueda CNA
              </TabsTrigger>
            </TabsList>

            {state?.error && (
              <div className="mb-4 p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20 font-medium">
                {state.error}
              </div>
            )}

            {/* TAB 1: INFORMACIÓN BÁSICA */}
            <TabsContent value="basico" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo <span className="text-destructive">*</span></Label>
                <Input id="nombre" name="nombre" defaultValue={defaultNombre} placeholder="Ej. Roberto Morales Sánchez" aria-invalid={!!fieldErrors.nombre} required />
                {fieldErrors.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input id="correo" name="correo" type="email" defaultValue={initialData?.correo || ""} placeholder="ejemplo@correo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono_principal">Teléfono Principal</Label>
                  <Input id="telefono_principal" name="telefono_principal" type="tel" defaultValue={initialData?.telefono_principal || ""} placeholder="55 1234 5678" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={initialData?.whatsapp || ""} placeholder="55 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuente_lead">Fuente del Lead</Label>
                  <Select value={fuenteLead} onValueChange={setFuenteLead} name="fuente_lead">
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Referido">Referido</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Portal Inmobiliario">Portal Inmobiliario</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Directo">Directo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas Iniciales</Label>
                <Textarea id="notas" name="notas" rows={3} defaultValue={initialData?.ultimaNota || ""} placeholder="Detalles sobre preferencias, urgencia o particularidades..." />
              </div>
            </TabsContent>

            {/* TAB 2: PERFIL FINANCIERO */}
            <TabsContent value="financiero" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_credito">Tipo de Crédito</Label>
                  <Select value={tipoCredito} onValueChange={setTipoCredito} name="tipo_credito">
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="Infonavit">Infonavit</SelectItem>
                      <SelectItem value="Cofinavit">Cofinavit</SelectItem>
                      <SelectItem value="Fovissste">Fovissste</SelectItem>
                      <SelectItem value="Bancario">Bancario</SelectItem>
                      <SelectItem value="Aliados">Aliados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingreso_mensual">Ingreso Mensual Comprobable</Label>
                  <Input id="ingreso_mensual" name="ingreso_mensual" type="number" defaultValue={initialData?.ingreso_mensual || ""} placeholder="Ej. 45000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacidad_credito_max">Crédito Máximo</Label>
                  <Input id="capacidad_credito_max" name="capacidad_credito_max" type="number" defaultValue={initialData?.capacidad_credito_max || ""} placeholder="Ej. 3500000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enganche_disponible">Enganche Disponible</Label>
                  <Input id="enganche_disponible" name="enganche_disponible" type="number" defaultValue={initialData?.enganche_disponible || ""} placeholder="Ej. 500000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pago_mensual_objetivo">Pago Mensual Objetivo</Label>
                  <Input id="pago_mensual_objetivo" name="pago_mensual_objetivo" type="number" defaultValue={initialData?.pago_mensual_objetivo || ""} placeholder="Ej. 18000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presupuesto_min">Presupuesto Mínimo (MXN) <span className="text-destructive">*</span></Label>
                  <Input id="presupuesto_min" name="presupuesto_min" type="number" defaultValue={initialData?.presupuesto_min || ""} placeholder="Ej. 2000000" required />
                  {fieldErrors.presupuesto_min && <p className="text-xs text-destructive">{fieldErrors.presupuesto_min[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presupuesto_max">Presupuesto Máximo (MXN)</Label>
                  <Input id="presupuesto_max" name="presupuesto_max" type="number" defaultValue={initialData?.presupuesto_max || ""} placeholder="Ej. 4000000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ocupacion">Ocupación / Profesión</Label>
                  <Input id="ocupacion" name="ocupacion" defaultValue={initialData?.ocupacion || ""} placeholder="Ej. Ingeniero de Software" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre_empresa">Empresa</Label>
                  <Input id="nombre_empresa" name="nombre_empresa" defaultValue={initialData?.nombre_empresa || ""} placeholder="Ej. Tech Corp" />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: BÚSQUEDA CNA */}
            <TabsContent value="cna" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operacion">Tipo de Operación <span className="text-destructive">*</span></Label>
                  <Select value={operacion} onValueChange={setOperacion} name="operacion">
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPRA">COMPRA</SelectItem>
                      <SelectItem value="RENTA">RENTA</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.operacion && <p className="text-xs text-destructive">{fieldErrors.operacion[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_propiedad">Tipo de Propiedad</Label>
                  <Select value={tipoPropiedad} onValueChange={setTipoPropiedad} name="tipo_propiedad">
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado_busqueda">Estado</Label>
                  <Input id="estado_busqueda" name="estado_busqueda" defaultValue={initialData?.estado_busqueda || ""} placeholder="Ej. Querétaro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad_busqueda">Ciudad / Municipio</Label>
                  <Input id="ciudad_busqueda" name="ciudad_busqueda" defaultValue={initialData?.ciudad_busqueda || ""} placeholder="Ej. Querétaro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fraccionamiento_colonia">Colonia / Fraccionamiento</Label>
                  <Input id="fraccionamiento_colonia" name="fraccionamiento_colonia" defaultValue={initialData?.fraccionamiento_colonia || ""} placeholder="Ej. Juriquilla" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="habitaciones_pa">Recámaras PA</Label>
                  <Input id="habitaciones_pa" name="habitaciones_pa" type="number" min="0" defaultValue={initialData?.habitaciones_pa ?? ""} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="habitaciones_pb">Recámaras PB</Label>
                  <Input id="habitaciones_pb" name="habitaciones_pb" type="number" min="0" defaultValue={initialData?.habitaciones_pb ?? ""} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banos">Baños</Label>
                  <Input id="banos" name="banos" type="number" step="0.5" min="0" defaultValue={initialData?.banos ?? ""} placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estacionamiento">Estacionamiento</Label>
                  <Input id="estacionamiento" name="estacionamiento" type="number" min="0" defaultValue={initialData?.estacionamiento ?? ""} placeholder="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m2_construccion_min">M² Construcción Mínimos</Label>
                  <Input id="m2_construccion_min" name="m2_construccion_min" type="number" defaultValue={initialData?.m2_construccion_min ?? ""} placeholder="Ej. 120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m2_terreno_min">M² Terreno Mínimos</Label>
                  <Input id="m2_terreno_min" name="m2_terreno_min" type="number" defaultValue={initialData?.m2_terreno_min ?? ""} placeholder="Ej. 150" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? (isEditing ? "Guardando Cambios..." : "Guardando Cliente...") : (isEditing ? "Actualizar Cliente" : "Guardar Cliente")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
