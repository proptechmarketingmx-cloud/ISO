-- ISO Platform — Script de inicialización de la base de datos
-- Reglas de Negocio Aplicadas: NO generar registros inventados ni datos simulados.
-- Los datos de la plataforma se registrarán directamente por el usuario a través de la interfaz.

-- Asegurar codificación utf8mb4
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Creación e inicialización del esquema
SOURCE schema.sql;

SET FOREIGN_KEY_CHECKS = 1;
