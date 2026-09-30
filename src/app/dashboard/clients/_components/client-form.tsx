"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  User,
  CreditCard,
  Search,
  FileText,
  Save,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createClient,
  updateClient,
  type CreateClientState,
} from "../actions"

export type ClientFormData = {
  id_cliente?: number
  // Tab 1: Info Básica
  nombre: string
  apellido_paterno?: string | null
  apellido_materno?: string | null
  correo?: string | null
  telefono_principal?: string | null
  whatsapp?: string | null
  lada?: string | null
  fecha_nacimiento?: Date | string | null
  genero?: string | null
  estado_civil?: string | null
  nacionalidad?: string | null
  curp?: string | null
  rfc?: string | null

  // Tab 2: Perfil Financiero
  tipo_credito?: string | null
  capacidad_credito_max?: number | null
  enganche_disponible?: number | null
  presupuesto_min?: number | null
  presupuesto_max?: number | null
  ingreso_mensual?: number | null
  pago_mensual_objetivo?: number | null

  // Tab 3: Búsqueda CNA
  operacion?: string | null
  tipo_propiedad?: string | null
  ciudad_busqueda?: string | null
  estado_busqueda?: string | null
  fraccionamiento_colonia?: string | null
  habitaciones_pa?: number | null
  habitaciones_pb?: number | null
  banos?: number | null
  estacionamiento?: number | null
  m2_terreno_min?: number | null
  m2_terreno_max?: number | null
  m2_construccion_min?: number | null
  m2_construccion_max?: number | null
  niveles_max?: number | null
  antiguedad_max?: number | null
  amenidades_deseadas?: string[] | null
  motivacion?: string | null
  temporalidad?: string | null

  // Tab 4: Datos Adicionales
  profesion?: string | null
  puesto?: string | null
  escolaridad?: string | null
  nombre_empresa?: string | null
  ocupacion?: string | null
  antiguedad_laboral?: string | null
  conyuge?: string | null
  conyuge_whatsapp?: string | null
  hijos?: number | null
  mascotas?: number | null
  integrantes_hogar?: number | null
  dependientes_eco?: number | null
  adultos_mayores_cargo?: number | null
  pais?: string | null
  estado?: string | null
  municipio?: string | null
  colonia?: string | null
  codigo_postal?: string | null
  direccion?: string | null
  fuente_lead?: string | null
  campana?: string | null
  medio_adquisicion?: string | null
  referenciado?: string | null
  ultimaNota?: string | null
}

interface ClientFormProps {
  initialData?: ClientFormData | null
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("basica")
  const isEditing = Boolean(initialData?.id_cliente)

  // Estados controlados para componentes Select
  const [genero, setGenero] = useState<string>(initialData?.genero || "")
  const [estadoCivil, setEstadoCivil] = useState<string>(initialData?.estado_civil || "")
  const [tipoCredito, setTipoCredito] = useState<string>(initialData?.tipo_credito || "")
  const [operacion, setOperacion] = useState<string>(initialData?.operacion || "COMPRA")
  const [tipoPropiedad, setTipoPropiedad] = useState<string>(initialData?.tipo_propiedad || "")
  const [motivacion, setMotivacion] = useState<string>(initialData?.motivacion || "")
  const [temporalidad, setTemporalidad] = useState<string>(initialData?.temporalidad || "")
  const [fuenteLead, setFuenteLead] = useState<string>(initialData?.fuente_lead || "")

  const [state, setState] = useState<CreateClientState | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(null)
    const formData = new FormData(event.currentTarget)

    // Inyectar selects controlados
    formData.set("genero", genero)
    formData.set("estado_civil", estadoCivil)
    formData.set("tipo_credito", tipoCredito)
    formData.set("operacion", operacion)
    formData.set("tipo_propiedad", tipoPropiedad)
    formData.set("motivacion", motivacion)
    formData.set("temporalidad", temporalidad)
    formData.set("fuente_lead", fuenteLead)

    startTransition(async () => {
      let result: CreateClientState
      if (isEditing && initialData?.id_cliente) {
        result = await updateClient(initialData.id_cliente, formData)
      } else {
        result = await createClient(null, formData)
      }

      if (result.success) {
        router.push("/dashboard/clients")
        router.refresh()
      } else {
        setState(result)
        // Si hay errores, identificar qué tab tiene el primer error y cambiar a él
        if (result.fieldErrors) {
          const errorFields = Object.keys(result.fieldErrors)
          const tab1Fields = [
            "nombre", "apellido_paterno", "apellido_materno", "correo",
            "telefono_principal", "whatsapp", "curp", "rfc",
          ]
          const tab2Fields = [
            "presupuesto_min", "presupuesto_max", "capacidad_credito_max",
            "enganche_disponible", "ingreso_mensual", "pago_mensual_objetivo",
          ]
          const tab3Fields = [
            "operacion", "tipo_propiedad", "habitaciones_pa", "habitaciones_pb",
            "banos", "estacionamiento", "m2_terreno_min", "m2_construccion_min",
          ]

          if (errorFields.some((f) => tab1Fields.includes(f))) {
            setActiveTab("basica")
          } else if (errorFields.some((f) => tab2Fields.includes(f))) {
            setActiveTab("financiero")
          } else if (errorFields.some((f) => tab3Fields.includes(f))) {
            setActiveTab("cna")
          } else {
            setActiveTab("adicionales")
          }
        }
      }
    })
  }

  const fieldErrors = state?.fieldErrors || {}

  const formatDateForInput = (d: Date | string | null | undefined): string => {
    if (!d) return ""
    try {
      const dateObj = typeof d === "string" ? new Date(d) : d
      return dateObj.toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state?.error && (
        <div className="p-4 text-sm rounded-lg bg-destructive/15 text-destructive border border-destructive/20 font-medium">
          {state.error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 gap-1 bg-muted/60">
          <TabsTrigger
            value="basica"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background"
          >
            <User className="h-4 w-4" />
            <span className="truncate text-xs sm:text-sm">1. Info Básica</span>
          </TabsTrigger>
          <TabsTrigger
            value="financiero"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background"
          >
            <CreditCard className="h-4 w-4" />
            <span className="truncate text-xs sm:text-sm">2. Financiero</span>
          </TabsTrigger>
          <TabsTrigger
            value="cna"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background"
          >
            <Search className="h-4 w-4" />
            <span className="truncate text-xs sm:text-sm">3. Búsqueda CNA</span>
          </TabsTrigger>
          <TabsTrigger
            value="adicionales"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background"
          >
            <FileText className="h-4 w-4" />
            <span className="truncate text-xs sm:text-sm">4. Adicionales</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: INFORMACIÓN BÁSICA
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="basica" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Información Personal y Contacto</CardTitle>
              <CardDescription>
                Identificación general del cliente, vías de comunicación y datos demográficos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre(s) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    defaultValue={initialData?.nombre || ""}
                    placeholder="Ej. Juan Carlos"
                    aria-invalid={!!fieldErrors.nombre}
                    required
                  />
                  {fieldErrors.nombre && (
                    <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                  <Input
                    id="apellido_paterno"
                    name="apellido_paterno"
                    defaultValue={initialData?.apellido_paterno && initialData.apellido_paterno !== "-" ? initialData.apellido_paterno : ""}
                    placeholder="Ej. Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input
                    id="apellido_materno"
                    name="apellido_materno"
                    defaultValue={initialData?.apellido_materno || ""}
                    placeholder="Ej. Gómez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    defaultValue={initialData?.correo || ""}
                    placeholder="cliente@ejemplo.com"
                    aria-invalid={!!fieldErrors.correo}
                  />
                  {fieldErrors.correo && (
                    <p className="text-xs text-destructive">{fieldErrors.correo[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono_principal">Teléfono Principal</Label>
                  <Input
                    id="telefono_principal"
                    name="telefono_principal"
                    defaultValue={initialData?.telefono_principal || ""}
                    placeholder="Ej. 4421234567"
                    aria-invalid={!!fieldErrors.telefono_principal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    defaultValue={initialData?.whatsapp || ""}
                    placeholder="Ej. 4421234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lada">LADA</Label>
                  <Input
                    id="lada"
                    name="lada"
                    defaultValue={initialData?.lada || "+52"}
                    placeholder="+52"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    defaultValue={formatDateForInput(initialData?.fecha_nacimiento)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger id="genero">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={estadoCivil} onValueChange={setEstadoCivil}>
                    <SelectTrigger id="estado_civil">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero">Soltero</SelectItem>
                      <SelectItem value="Casado">Casado</SelectItem>
                      <SelectItem value="Divorciado">Divorciado</SelectItem>
                      <SelectItem value="Viudo">Viudo</SelectItem>
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    name="nacionalidad"
                    defaultValue={initialData?.nacionalidad || "MX"}
                    placeholder="MX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curp">CURP</Label>
                  <Input
                    id="curp"
                    name="curp"
                    defaultValue={initialData?.curp || ""}
                    placeholder="18 caracteres"
                    maxLength={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    defaultValue={initialData?.rfc || ""}
                    placeholder="13 caracteres"
                    maxLength={13}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: PERFIL FINANCIERO
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="financiero" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Capacidad Financiera y Crédito</CardTitle>
              <CardDescription>
                Créditos aplicables, liquidez disponible, presupuestos de compra y nivel de ingresos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_credito">Tipo de Crédito</Label>
                  <Select value={tipoCredito} onValueChange={setTipoCredito}>
                    <SelectTrigger id="tipo_credito">
                      <SelectValue placeholder="Seleccionar crédito..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infonavit">Infonavit</SelectItem>
                      <SelectItem value="Cofinavit">Cofinavit</SelectItem>
                      <SelectItem value="Fovissste">Fovissste</SelectItem>
                      <SelectItem value="Bancario">Bancario</SelectItem>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="Aliados">Aliados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidad_credito_max">Capacidad de Crédito Máx. (MXN)</Label>
                  <Input
                    id="capacidad_credito_max"
                    name="capacidad_credito_max"
                    type="number"
                    step="any"
                    defaultValue={initialData?.capacidad_credito_max ?? ""}
                    placeholder="Ej. 2500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enganche_disponible">Enganche Disponible (MXN)</Label>
                  <Input
                    id="enganche_disponible"
                    name="enganche_disponible"
                    type="number"
                    step="any"
                    defaultValue={initialData?.enganche_disponible ?? ""}
                    placeholder="Ej. 400000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presupuesto_min">
                    Presupuesto Mínimo (MXN) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="presupuesto_min"
                    name="presupuesto_min"
                    type="number"
                    step="any"
                    defaultValue={initialData?.presupuesto_min ?? ""}
                    placeholder="Ej. 1800000"
                    aria-invalid={!!fieldErrors.presupuesto_min}
                    required
                  />
                  {fieldErrors.presupuesto_min && (
                    <p className="text-xs text-destructive">{fieldErrors.presupuesto_min[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presupuesto_max">Presupuesto Máximo (MXN)</Label>
                  <Input
                    id="presupuesto_max"
                    name="presupuesto_max"
                    type="number"
                    step="any"
                    defaultValue={initialData?.presupuesto_max ?? ""}
                    placeholder="Ej. 3200000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ingreso_mensual">Ingreso Mensual Comprobable (MXN)</Label>
                  <Input
                    id="ingreso_mensual"
                    name="ingreso_mensual"
                    type="number"
                    step="any"
                    defaultValue={initialData?.ingreso_mensual ?? ""}
                    placeholder="Ej. 65000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pago_mensual_objetivo">Pago Mensual Objetivo (MXN)</Label>
                  <Input
                    id="pago_mensual_objetivo"
                    name="pago_mensual_objetivo"
                    type="number"
                    step="any"
                    defaultValue={initialData?.pago_mensual_objetivo ?? ""}
                    placeholder="Ej. 22000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: BÚSQUEDA CNA (CALIFICACIÓN DE NECESIDADES)
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="cna" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Perfil de Búsqueda CNA</CardTitle>
              <CardDescription>
                Parámetros específicos para el algoritmo de matching automático con propiedades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operacion">
                    Operación <span className="text-destructive">*</span>
                  </Label>
                  <Select value={operacion} onValueChange={setOperacion}>
                    <SelectTrigger id="operacion">
                      <SelectValue placeholder="Seleccionar operación..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPRA">COMPRA</SelectItem>
                      <SelectItem value="RENTA">RENTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_propiedad">Tipo de Inmueble</Label>
                  <Select value={tipoPropiedad} onValueChange={setTipoPropiedad}>
                    <SelectTrigger id="tipo_propiedad">
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                      <SelectItem value="Bodega">Bodega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad_busqueda">Ciudad de Búsqueda</Label>
                  <Input
                    id="ciudad_busqueda"
                    name="ciudad_busqueda"
                    defaultValue={initialData?.ciudad_busqueda || ""}
                    placeholder="Ej. Querétaro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_busqueda">Estado de Búsqueda</Label>
                  <Input
                    id="estado_busqueda"
                    name="estado_busqueda"
                    defaultValue={initialData?.estado_busqueda || ""}
                    placeholder="Ej. Querétaro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fraccionamiento_colonia">Colonia / Fraccionamiento</Label>
                  <Input
                    id="fraccionamiento_colonia"
                    name="fraccionamiento_colonia"
                    defaultValue={initialData?.fraccionamiento_colonia || ""}
                    placeholder="Ej. Juriquilla, Zibatá"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="habitaciones_pa">Habitaciones PA</Label>
                  <Input
                    id="habitaciones_pa"
                    name="habitaciones_pa"
                    type="number"
                    min="0"
                    defaultValue={initialData?.habitaciones_pa ?? ""}
                    placeholder="Ej. 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="habitaciones_pb">Habitaciones PB</Label>
                  <Input
                    id="habitaciones_pb"
                    name="habitaciones_pb"
                    type="number"
                    min="0"
                    defaultValue={initialData?.habitaciones_pb ?? ""}
                    placeholder="Ej. 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banos">Baños</Label>
                  <Input
                    id="banos"
                    name="banos"
                    type="number"
                    step="0.5"
                    min="0"
                    defaultValue={initialData?.banos ?? ""}
                    placeholder="Ej. 2.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estacionamiento">Estacionamientos</Label>
                  <Input
                    id="estacionamiento"
                    name="estacionamiento"
                    type="number"
                    min="0"
                    defaultValue={initialData?.estacionamiento ?? ""}
                    placeholder="Ej. 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m2_terreno_min">Terreno Mín. (m²)</Label>
                  <Input
                    id="m2_terreno_min"
                    name="m2_terreno_min"
                    type="number"
                    step="any"
                    defaultValue={initialData?.m2_terreno_min ?? ""}
                    placeholder="Ej. 150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m2_terreno_max">Terreno Máx. (m²)</Label>
                  <Input
                    id="m2_terreno_max"
                    name="m2_terreno_max"
                    type="number"
                    step="any"
                    defaultValue={initialData?.m2_terreno_max ?? ""}
                    placeholder="Ej. 300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m2_construccion_min">Construcción Mín. (m²)</Label>
                  <Input
                    id="m2_construccion_min"
                    name="m2_construccion_min"
                    type="number"
                    step="any"
                    defaultValue={initialData?.m2_construccion_min ?? ""}
                    placeholder="Ej. 120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m2_construccion_max">Construcción Máx. (m²)</Label>
                  <Input
                    id="m2_construccion_max"
                    name="m2_construccion_max"
                    type="number"
                    step="any"
                    defaultValue={initialData?.m2_construccion_max ?? ""}
                    placeholder="Ej. 250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niveles_max">Niveles Máx.</Label>
                  <Input
                    id="niveles_max"
                    name="niveles_max"
                    type="number"
                    min="1"
                    defaultValue={initialData?.niveles_max ?? ""}
                    placeholder="Ej. 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="antiguedad_max">Antigüedad Máx. (Años)</Label>
                  <Input
                    id="antiguedad_max"
                    name="antiguedad_max"
                    type="number"
                    min="0"
                    defaultValue={initialData?.antiguedad_max ?? ""}
                    placeholder="Ej. 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivacion">Motivación</Label>
                  <Select value={motivacion} onValueChange={setMotivacion}>
                    <SelectTrigger id="motivacion">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vivienda">Vivienda</SelectItem>
                      <SelectItem value="Inversión">Inversión</SelectItem>
                      <SelectItem value="Negocio">Negocio</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temporalidad">Temporalidad de Compra</Label>
                  <Select value={temporalidad} onValueChange={setTemporalidad}>
                    <SelectTrigger id="temporalidad">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inmediata">Inmediata</SelectItem>
                      <SelectItem value="1-3 meses">1-3 meses</SelectItem>
                      <SelectItem value="3-6 meses">3-6 meses</SelectItem>
                      <SelectItem value="6+ meses">6+ meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenidades_deseadas">Amenidades Deseadas (separadas por comas)</Label>
                <Textarea
                  id="amenidades_deseadas"
                  name="amenidades_deseadas"
                  rows={2}
                  defaultValue={initialData?.amenidades_deseadas ? initialData.amenidades_deseadas.join(", ") : ""}
                  placeholder="Ej. Alberca, Seguridad privada, Jardín, Casa club, Gimnasio"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: DATOS ADICIONALES (FAMILIA, EMPLEO, DOMICILIO, CAPTACIÓN)
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="adicionales" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Información Laboral, Familiar y Origen</CardTitle>
              <CardDescription>
                Detalles complementarios para análisis de perfil de cliente y seguimiento de marketing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Sección Laboral */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Perfil Laboral
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profesion">Profesión</Label>
                    <Input
                      id="profesion"
                      name="profesion"
                      defaultValue={initialData?.profesion || ""}
                      placeholder="Ej. Ingeniero Civil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puesto">Puesto</Label>
                    <Input
                      id="puesto"
                      name="puesto"
                      defaultValue={initialData?.puesto || ""}
                      placeholder="Ej. Gerente de Operaciones"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escolaridad">Escolaridad</Label>
                    <Input
                      id="escolaridad"
                      name="escolaridad"
                      defaultValue={initialData?.escolaridad || ""}
                      placeholder="Ej. Licenciatura / Maestría"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_empresa">Nombre de la Empresa</Label>
                    <Input
                      id="nombre_empresa"
                      name="nombre_empresa"
                      defaultValue={initialData?.nombre_empresa || ""}
                      placeholder="Ej. Tech Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ocupacion">Ocupación</Label>
                    <Input
                      id="ocupacion"
                      name="ocupacion"
                      defaultValue={initialData?.ocupacion || ""}
                      placeholder="Ej. Asalariado / Independiente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="antiguedad_laboral">Antigüedad Laboral</Label>
                    <Input
                      id="antiguedad_laboral"
                      name="antiguedad_laboral"
                      defaultValue={initialData?.antiguedad_laboral || ""}
                      placeholder="Ej. 4 años"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Familiar */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Composición Familiar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conyuge">Nombre del Cónyuge</Label>
                    <Input
                      id="conyuge"
                      name="conyuge"
                      defaultValue={initialData?.conyuge || ""}
                      placeholder="Ej. María García"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conyuge_whatsapp">WhatsApp del Cónyuge</Label>
                    <Input
                      id="conyuge_whatsapp"
                      name="conyuge_whatsapp"
                      defaultValue={initialData?.conyuge_whatsapp || ""}
                      placeholder="Ej. 4429876543"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hijos">Hijos</Label>
                    <Input
                      id="hijos"
                      name="hijos"
                      type="number"
                      min="0"
                      defaultValue={initialData?.hijos ?? ""}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mascotas">Mascotas</Label>
                    <Input
                      id="mascotas"
                      name="mascotas"
                      type="number"
                      min="0"
                      defaultValue={initialData?.mascotas ?? ""}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integrantes_hogar">Integrantes Hogar</Label>
                    <Input
                      id="integrantes_hogar"
                      name="integrantes_hogar"
                      type="number"
                      min="1"
                      defaultValue={initialData?.integrantes_hogar ?? ""}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dependientes_eco">Dependientes Eco.</Label>
                    <Input
                      id="dependientes_eco"
                      name="dependientes_eco"
                      type="number"
                      min="0"
                      defaultValue={initialData?.dependientes_eco ?? ""}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adultos_mayores_cargo">Adultos Mayores</Label>
                    <Input
                      id="adultos_mayores_cargo"
                      name="adultos_mayores_cargo"
                      type="number"
                      min="0"
                      defaultValue={initialData?.adultos_mayores_cargo ?? ""}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Domicilio Actual */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Domicilio Actual
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input
                      id="pais"
                      name="pais"
                      defaultValue={initialData?.pais || "MX"}
                      placeholder="MX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      name="estado"
                      defaultValue={initialData?.estado || ""}
                      placeholder="Ej. Querétaro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio / Alcaldía</Label>
                    <Input
                      id="municipio"
                      name="municipio"
                      defaultValue={initialData?.municipio || ""}
                      placeholder="Ej. Querétaro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colonia">Colonia</Label>
                    <Input
                      id="colonia"
                      name="colonia"
                      defaultValue={initialData?.colonia || ""}
                      placeholder="Ej. Cimatario"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_postal">Código Postal</Label>
                    <Input
                      id="codigo_postal"
                      name="codigo_postal"
                      defaultValue={initialData?.codigo_postal || ""}
                      placeholder="Ej. 76030"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion">Dirección Completa (Calle y Número)</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      defaultValue={initialData?.direccion || ""}
                      placeholder="Ej. Av. Constituyentes 123 Int 4B"
                    />
                  </div>
                </div>
              </div>

              {/* Captación y Marketing */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Origen y Captación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuente_lead">Fuente del Lead</Label>
                    <Select value={fuenteLead} onValueChange={setFuenteLead}>
                      <SelectTrigger id="fuente_lead">
                        <SelectValue placeholder="Seleccionar origen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Referido">Referido</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Portal Inmobiliario">Portal Inmobiliario</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenciado">Referenciado Por</Label>
                    <Input
                      id="referenciado"
                      name="referenciado"
                      defaultValue={initialData?.referenciado || ""}
                      placeholder="Nombre de quien lo refirió"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campana">Campaña</Label>
                    <Input
                      id="campana"
                      name="campana"
                      defaultValue={initialData?.campana || ""}
                      placeholder="Ej. Promo Verano 2026"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas Generales / Comentarios</Label>
                  <Textarea
                    id="notas"
                    name="notas"
                    rows={3}
                    defaultValue={initialData?.ultimaNota || ""}
                    placeholder="Anotaciones clave sobre necesidades, urgencia de compra o particularidades del cliente..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción flotantes / fijos */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <Button type="submit" disabled={isPending} className="min-w-[160px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Guardar Cambios" : "Registrar Cliente"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
