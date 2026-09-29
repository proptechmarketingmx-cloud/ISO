import { Building2, Users, CalendarCheck, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Propiedades Activas",
    value: "128",
    description: "+4 esta semana",
    icon: Building2,
  },
  {
    title: "Clientes Nuevos",
    value: "34",
    description: "+12% vs mes anterior",
    icon: Users,
  },
  {
    title: "Visitas Hoy",
    value: "8",
    description: "3 confirmadas",
    icon: CalendarCheck,
  },
  {
    title: "Ventas Cerradas",
    value: "6",
    description: "Este mes",
    icon: TrendingUp,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de actividad de tu equipo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
