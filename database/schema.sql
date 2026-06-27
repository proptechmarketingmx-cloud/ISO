-- Schema para la base de datos ISO
CREATE DATABASE IF NOT EXISTS iso_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iso_db;

-- 1. Tabla de Asesores
CREATE TABLE IF NOT EXISTS asesores (
  id_asesor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  correo VARCHAR(100),
  status VARCHAR(20) DEFAULT 'activo', -- 'activo', 'inactivo'
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información Básica
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  genero VARCHAR(50),
  estado_civil VARCHAR(50),
  fecha_nacimiento VARCHAR(20),
  edad INT,
  curp VARCHAR(18),
  rfc VARCHAR(13),
  
  -- Información de Contacto
  telefono_principal VARCHAR(20),
  whatsapp VARCHAR(20),
  correo VARCHAR(100),
  direccion TEXT,
  
  -- Información Comercial
  id_asesor INT,
  estado_cliente VARCHAR(50) DEFAULT 'nuevo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origen VARCHAR(100),
  canal_captacion VARCHAR(100),
  
  -- Información Familiar & Laboral
  hijos VARCHAR(255),
  ocupacion VARCHAR(100),
  empresa VARCHAR(200),
  ingresos DECIMAL(15, 2),
  
  FOREIGN KEY (id_asesor) REFERENCES asesores(id_asesor) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tablas del Expediente
CREATE TABLE IF NOT EXISTS clientes_actividades (
  id_actividad INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_asesor INT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  FOREIGN KEY (id_asesor) REFERENCES asesores(id_asesor) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_documentos (
  id_documento INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(100),
  url TEXT NOT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_notas (
  id_nota INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  contenido TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario VARCHAR(100),
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla de Propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id_propiedad INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'casa', 'departamento', 'terreno', 'local', 'oficina', 'bodega'
  tipo_operacion VARCHAR(20) NOT NULL, -- 'venta', 'renta'
  precio DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'disponible', -- 'disponible', 'reservada', 'vendida', 'rentada'
  ciudad VARCHAR(100),
  colonia VARCHAR(100),
  m2_construccion DECIMAL(10, 2),
  m2_terreno DECIMAL(10, 2),
  recamaras INT DEFAULT 0,
  banos DECIMAL(3, 1) DEFAULT 0.0,
  id_asesor INT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_asesor) REFERENCES asesores(id_asesor) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Relaciones CNA entre Clientes
CREATE TABLE IF NOT EXISTS relaciones_clientes_cna (
  id_relacion INT AUTO_INCREMENT PRIMARY KEY,
  cliente_origen_id INT NOT NULL,
  cliente_destino_id INT NOT NULL,
  tipo_relacion VARCHAR(50) NOT NULL, -- 'FAMILIAR', 'REFERENCIA', 'PROFESIONAL', 'GEOGRAFICA'
  fecha_relacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  peso DECIMAL(3, 2) DEFAULT 1.00,
  FOREIGN KEY (cliente_origen_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  FOREIGN KEY (cliente_destino_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  CONSTRAINT unique_cliente_rel UNIQUE (cliente_origen_id, cliente_destino_id, tipo_relacion)
) ENGINE=InnoDB;

-- 4. Relaciones CNA entre Asesores
CREATE TABLE IF NOT EXISTS relaciones_asesores_cna (
  id_relacion INT AUTO_INCREMENT PRIMARY KEY,
  asesor_origen_id INT NOT NULL,
  asesor_destino_id INT NOT NULL,
  tipo_relacion VARCHAR(50) NOT NULL, -- 'FAMILIAR', 'REFERENCIA', 'PROFESIONAL', 'GEOGRAFICA'
  fecha_relacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  peso DECIMAL(3, 2) DEFAULT 1.00,
  FOREIGN KEY (asesor_origen_id) REFERENCES asesores(id_asesor) ON DELETE CASCADE,
  FOREIGN KEY (asesor_destino_id) REFERENCES asesores(id_asesor) ON DELETE CASCADE,
  CONSTRAINT unique_asesor_rel UNIQUE (asesor_origen_id, asesor_destino_id, tipo_relacion)
) ENGINE=InnoDB;
