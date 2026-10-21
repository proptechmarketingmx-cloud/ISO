// src/components/forms/cliente-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, type ClienteFormData } from "@/lib/cliente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ClienteFormProps {
  cliente?: any; // Para modo edición
  onSuccess?: () => void;
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {},
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      const url = cliente ? `/api/clientes/${cliente.id}` : "/api/clientes";
      const method = cliente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al guardar");

      toast.success(cliente ? "Cliente actualizado" : "Cliente creado");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al guardar el cliente");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos Básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Básicos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
            <Input id="apellidoPaterno" {...register("apellidoPaterno")} />
          </div>
          <div>
            <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
            <Input id="apellidoMaterno" {...register("apellidoMaterno")} />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" {...register("telefono")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Perfil Financiero */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil Financiero</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="presupuestoMin">Presupuesto Mínimo</Label>
            <Input
              id="presupuestoMin"
              type="number"
              {...register("presupuestoMin", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="presupuestoMax">Presupuesto Máximo</Label>
            <Input
              id="presupuestoMax"
              type="number"
              {...register("presupuestoMax", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="engancheDisponible">Enganche Disponible</Label>
            <Input
              id="engancheDisponible"
              type="number"
              {...register("engancheDisponible", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="ingresoMensual">Ingreso Mensual</Label>
            <Input
              id="ingresoMensual"
              type="number"
              {...register("ingresoMensual", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recamarasMin">Recámaras Mínimas</Label>
            <Input
              id="recamarasMin"
              type="number"
              {...register("recamarasMin", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="banosMin">Baños Mínimos</Label>
            <Input
              id="banosMin"
              type="number"
              step="0.5"
              {...register("banosMin", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="m2ConstruccionMin">m² Construcción Mínimos</Label>
            <Input
              id="m2ConstruccionMin"
              type="number"
              {...register("m2ConstruccionMin", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : cliente ? "Actualizar" : "Crear Cliente"}
        </Button>
      </div>
    </form>
  );
}