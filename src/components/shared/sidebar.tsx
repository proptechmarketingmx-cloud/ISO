// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Home,
  Target,
  UserCog,
  BarChart3,
  Network,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard/clientes", label: "Clientes", icon: Users, roles: ["ADMIN", "GERENTE", "ASESOR"] },
  { href: "/dashboard/propiedades", label: "Propiedades", icon: Home, roles: ["ADMIN", "GERENTE", "ASESOR"] },
  { href: "/dashboard/pipeline", label: "Oportunidades", icon: Target, roles: ["ADMIN", "GERENTE", "ASESOR"] },
  { href: "/dashboard/asesores", label: "Asesores", icon: UserCog, roles: ["ADMIN", "GERENTE"] },
  { href: "/dashboard/matching", label: "Matching", icon: Network, roles: ["ADMIN", "GERENTE", "ASESOR"] },
  { href: "/dashboard/cna", label: "CNA", icon: BarChart3, roles: ["ADMIN", "GERENTE"] },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMIN", "GERENTE"] },
  { href: "/dashboard/admin", label: "Administración", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();

  const itemsFiltrados = menuItems.filter((item) =>
    item.roles.includes(rol)
  );

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold">CRM PropTech</h1>
        <p className="text-xs text-slate-500 mt-1">{rol}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {itemsFiltrados.map((item) => {
          const Icon = item.icon;
          const activo = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                activo
                  ? "bg-slate-100 dark:bg-slate-800 font-medium"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}