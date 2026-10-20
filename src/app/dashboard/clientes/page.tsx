import { prisma } from "@/lib/prisma";
import { ClientesTable, type Cliente } from "@/components/tables/cliente-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { fechaRegistro: "desc" },
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      telefono: true,
      email: true,
      ciudad: true,
      estadoLead: true,
      scoreCna: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="mt-1 text-slate-500">Gestiona tus leads y clientes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clientes/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>
      <ClientesTable data={clientes as Cliente[]} />
    </div>
  );
}
