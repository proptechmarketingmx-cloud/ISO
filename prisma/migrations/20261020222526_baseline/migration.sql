-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('NUEVO', 'CONTACTADO', 'CALIFICADO', 'VISITA_AGENDADA', 'PROPUESTA_ENVIADA', 'NEGOCIACION', 'CERRADO_GANADO', 'CERRADO_PERDIDO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'GERENTE', 'ASESOR');

-- CreateTable
CREATE TABLE "tipos_propiedad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_operacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_operacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "curp" TEXT,
    "rfc" TEXT,
    "pais" TEXT DEFAULT 'MX',
    "estado" TEXT,
    "municipio" TEXT,
    "ciudad" TEXT,
    "colonia" TEXT,
    "codigoPostal" TEXT,
    "presupuestoMin" DOUBLE PRECISION,
    "presupuestoMax" DOUBLE PRECISION,
    "engancheDisponible" DOUBLE PRECISION,
    "capacidadCreditoMax" DOUBLE PRECISION,
    "ingresoMensual" DOUBLE PRECISION,
    "tipoOperacionDeseada" TEXT,
    "tipoPropiedadDeseada" TEXT,
    "recamarasMin" INTEGER,
    "banosMin" DOUBLE PRECISION,
    "m2TerrenoMin" DOUBLE PRECISION,
    "m2ConstruccionMin" DOUBLE PRECISION,
    "ubicacionesPreferidas" JSONB,
    "referidoPorClienteId" INTEGER,
    "referidoPorAsesorId" TEXT,
    "esReferidoObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "scoreCna" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferidosGenerados" INTEGER NOT NULL DEFAULT 0,
    "valorVentasReferidos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estadoLead" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asesores" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "scoreCna" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferidosGenerados" INTEGER NOT NULL DEFAULT 0,
    "valorVentasReferidos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propiedades" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoPropiedadId" INTEGER NOT NULL,
    "tipoOperacionId" INTEGER NOT NULL,
    "pais" TEXT DEFAULT 'MX',
    "estado" TEXT,
    "municipio" TEXT,
    "ciudad" TEXT,
    "colonia" TEXT,
    "codigoPostal" TEXT,
    "direccion" TEXT,
    "m2Terreno" DOUBLE PRECISION,
    "m2Construccion" DOUBLE PRECISION,
    "recamaras" INTEGER,
    "banos" DOUBLE PRECISION,
    "estacionamientos" INTEGER,
    "niveles" INTEGER,
    "antiguedad" INTEGER,
    "caracteristicasEspec" JSONB,
    "amenidades" JSONB,
    "precio" DOUBLE PRECISION NOT NULL,
    "esNegociable" BOOLEAN NOT NULL DEFAULT false,
    "comision" DOUBLE PRECISION,
    "escriturasListas" BOOLEAN NOT NULL DEFAULT false,
    "libreGravamen" BOOLEAN NOT NULL DEFAULT false,
    "asesorId" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propiedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oportunidades" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "asesorId" TEXT,
    "estado" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "valorEstimado" DOUBLE PRECISION,
    "probabilidadCierre" INTEGER NOT NULL DEFAULT 10,
    "notas" TEXT,
    "fechaCierreEstimada" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oportunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibilidad_cliente_propiedad" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "scoreTotal" DOUBLE PRECISION NOT NULL,
    "scorePrecio" DOUBLE PRECISION,
    "scoreUbicacion" DOUBLE PRECISION,
    "scoreCaracteristicas" DOUBLE PRECISION,
    "scoreAmenidades" DOUBLE PRECISION,
    "fechaCalculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compatibilidad_cliente_propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ASESOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_propiedad_nombre_key" ON "tipos_propiedad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_operacion_nombre_key" ON "tipos_operacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_curp_key" ON "clientes"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_rfc_key" ON "clientes"("rfc");

-- CreateIndex
CREATE INDEX "clientes_estadoLead_idx" ON "clientes"("estadoLead");

-- CreateIndex
CREATE INDEX "clientes_scoreCna_idx" ON "clientes"("scoreCna");

-- CreateIndex
CREATE UNIQUE INDEX "asesores_email_key" ON "asesores"("email");

-- CreateIndex
CREATE INDEX "propiedades_tipoPropiedadId_idx" ON "propiedades"("tipoPropiedadId");

-- CreateIndex
CREATE INDEX "propiedades_tipoOperacionId_idx" ON "propiedades"("tipoOperacionId");

-- CreateIndex
CREATE INDEX "propiedades_precio_idx" ON "propiedades"("precio");

-- CreateIndex
CREATE INDEX "oportunidades_clienteId_idx" ON "oportunidades"("clienteId");

-- CreateIndex
CREATE INDEX "oportunidades_propiedadId_idx" ON "oportunidades"("propiedadId");

-- CreateIndex
CREATE INDEX "oportunidades_estado_idx" ON "oportunidades"("estado");

-- CreateIndex
CREATE INDEX "compatibilidad_cliente_propiedad_scoreTotal_idx" ON "compatibilidad_cliente_propiedad"("scoreTotal");

-- CreateIndex
CREATE UNIQUE INDEX "compatibilidad_cliente_propiedad_clienteId_propiedadId_key" ON "compatibilidad_cliente_propiedad"("clienteId", "propiedadId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_referidoPorClienteId_fkey" FOREIGN KEY ("referidoPorClienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_referidoPorAsesorId_fkey" FOREIGN KEY ("referidoPorAsesorId") REFERENCES "asesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedades" ADD CONSTRAINT "propiedades_tipoPropiedadId_fkey" FOREIGN KEY ("tipoPropiedadId") REFERENCES "tipos_propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedades" ADD CONSTRAINT "propiedades_tipoOperacionId_fkey" FOREIGN KEY ("tipoOperacionId") REFERENCES "tipos_operacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedades" ADD CONSTRAINT "propiedades_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "asesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "asesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibilidad_cliente_propiedad" ADD CONSTRAINT "compatibilidad_cliente_propiedad_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibilidad_cliente_propiedad" ADD CONSTRAINT "compatibilidad_cliente_propiedad_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
