"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Kanban,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",                  label: "Inicio",        icon: LayoutDashboard },
  { href: "/dashboard/properties",       label: "Propiedades",   icon: Building2 },
  { href: "/dashboard/clients",          label: "Clientes",      icon: Users },
  { href: "/dashboard/calendar",         label: "Calendario",    icon: CalendarDays },
  { href: "/dashboard/pipeline",         label: "Pipeline",      icon: Kanban },
  { href: "/dashboard/settings",         label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card px-3 py-6 gap-1">
      {/* Logo */}
      <div className="mb-6 px-3">
        <span className="text-xl font-bold tracking-tight">ISO</span>
        <p className="text-xs text-muted-foreground mt-0.5">Plataforma Inmobiliaria</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
