// src/lib/validations/cliente.ts
import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  curp: z.string().optional(),
  rfc: z.string().optional(),
  pais: z.string().default("MX"),
  estado: z.string().optional(),
  municipio: z.string().optional(),
  ciudad: z.string().optional(),
  colonia: z.string().optional(),
  codigoPostal: z.string().optional(),
  presupuestoMin: z.number().optional(),
  presupuestoMax: z.number().optional(),
  engancheDisponible: z.number().optional(),
  capacidadCreditoMax: z.number().optional(),
  ingresoMensual: z.number().optional(),
  tipoOperacionDeseada: z.string().optional(),
  tipoPropiedadDeseada: z.string().optional(),
  recamarasMin: z.number().optional(),
  banosMin: z.number().optional(),
  m2TerrenoMin: z.number().optional(),
  m2ConstruccionMin: z.number().optional(),
  referidoPorClienteId: z.number().optional(),
  referidoPorAsesorId: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;