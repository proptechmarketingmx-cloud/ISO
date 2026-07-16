-- ═══════════════════════════════════════════════════════════════════════════
-- schema.sql — Esquema Completo v2.0
-- ISO Plataforma Inmobiliaria
-- ═══════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS iso_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iso_db;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Asesores
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asesores (
  id_asesor   INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  apellidos   VARCHAR(100) NOT NULL,
  telefono    VARCHAR(20)  NULL,
  correo      VARCHAR(100) NULL,
  status      VARCHAR(20)  DEFAULT 'activo',
  fecha_ingreso TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Clientes (Expediente Único v2)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente  INT AUTO_INCREMENT PRIMARY KEY,

  -- ── Identificación ──────────────────────────────────────────────────────
  nombre              VARCHAR(100)  NOT NULL,
  apellido_paterno    VARCHAR(100)  NOT NULL,
  apellido_materno    VARCHAR(100)  NULL,
  curp                VARCHAR(18)   NULL,
  rfc                 VARCHAR(13)   NULL,
  fecha_nacimiento    VARCHAR(20)   NULL,
  edad                INT           NULL COMMENT 'Calculado automáticamente',
  generacion          VARCHAR(50)   NULL COMMENT 'Calculado automáticamente',
  genero              VARCHAR(50)   NULL,
  estado_civil        VARCHAR(50)   NULL,
  nacionalidad        VARCHAR(100)  NULL,

  -- ── Contacto ────────────────────────────────────────────────────────────
  telefono_principal  VARCHAR(20)   NULL,
  whatsapp            VARCHAR(20)   NULL,
  lada                VARCHAR(10)   NULL COMMENT 'Calculado automáticamente',
  correo              VARCHAR(100)  NULL,

  -- ── Ubicación ───────────────────────────────────────────────────────────
  pais                VARCHAR(100)  DEFAULT 'MX',
  estado              VARCHAR(100)  NULL,
  municipio           VARCHAR(100)  NULL,
  colonia             VARCHAR(100)  NULL,
  codigo_postal       VARCHAR(10)   NULL,
  fraccionamiento     VARCHAR(100)  NULL,
  direccion           TEXT          NULL,

  -- ── Perfil Demográfico ───────────────────────────────────────────────────
  profesion           VARCHAR(100)  NULL,
  puesto              VARCHAR(100)  NULL,
  escolaridad         VARCHAR(50)   NULL,

  -- ── Perfil Familiar ──────────────────────────────────────────────────────
  conyuge             VARCHAR(200)  NULL,
  conyuge_whatsapp    VARCHAR(20)   NULL,
  hijos               INT           NULL,
  mascotas            INT           NULL,
  integrantes_hogar   INT           NULL,
  dependientes_eco    INT           NULL COMMENT 'Dependientes económicos',
  adultos_mayores_cargo INT         NULL,

  -- ── Perfil Financiero ────────────────────────────────────────────────────
  nombre_empresa      VARCHAR(200)  NULL,
  ocupacion           VARCHAR(100)  NULL,
  antiguedad_laboral  VARCHAR(100)  NULL,
  ingreso_mensual     DECIMAL(15,2) NULL,
  tipo_credito        VARCHAR(100)  NULL,
  presupuesto_min     DECIMAL(15,2) NULL,
  presupuesto_max     DECIMAL(15,2) NULL,
  enganche_disponible DECIMAL(15,2) NULL,
  pago_mensual_objetivo DECIMAL(15,2) NULL,
  capacidad_credito_max DECIMAL(15,2) NULL,

  -- ── Preferencias del Inmueble ────────────────────────────────────────────
  operacion               VARCHAR(50)   NULL,
  tipo_propiedad          VARCHAR(100)  NULL,
  estado_busqueda         VARCHAR(100)  NULL COMMENT 'Estado donde busca',
  ciudad_busqueda         VARCHAR(100)  NULL,
  fraccionamiento_colonia VARCHAR(200)  NULL,
  habitaciones_pa         INT           NULL,
  habitaciones_pb         INT           NULL,
  banos                   DECIMAL(3,1)  NULL,
  estacionamiento         INT           NULL,
  m2_terreno_min          DECIMAL(10,2) NULL,
  m2_terreno_max          DECIMAL(10,2) NULL,
  m2_construccion_min     DECIMAL(10,2) NULL,
  m2_construccion_max     DECIMAL(10,2) NULL,
  niveles_max             INT           NULL,
  antiguedad_max          INT           NULL COMMENT 'Antigüedad máxima en años',
  amenidades_deseadas     TEXT          NULL COMMENT 'JSON array de amenidades',

  -- ── Motivación y Temporalidad ────────────────────────────────────────────
  motivacion          VARCHAR(100)  NULL,
  temporalidad        VARCHAR(50)   NULL,

  -- ── Seguimiento Comercial ─────────────────────────────────────────────────
  id_asesor           INT           NULL,
  estado_cliente      VARCHAR(50)   DEFAULT 'nuevo',
  referenciado        VARCHAR(255)  NULL,
  fuente_lead         VARCHAR(100)  NULL,
  campana             VARCHAR(200)  NULL,
  medio_adquisicion   VARCHAR(100)  NULL,
  utm_source          VARCHAR(200)  NULL,
  utm_medium          VARCHAR(100)  NULL,
  utm_campaign        VARCHAR(200)  NULL,
  origen              VARCHAR(100)  NULL,
  canal_captacion     VARCHAR(100)  NULL,

  -- ── Scores (calculados por el sistema) ───────────────────────────────────
  score_cna           DECIMAL(5,2)  NULL,
  score_compatibilidad DECIMAL(5,2) NULL,

  -- ── Sistema ───────────────────────────────────────────────────────────────
  fecha_registro      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- ── Restricciones ────────────────────────────────────────────────────────
  FOREIGN KEY (id_asesor) REFERENCES asesores(id_asesor) ON DELETE SET NULL,
  INDEX idx_cli_correo  (correo),
  INDEX idx_cli_whatsapp(whatsapp),
  INDEX idx_cli_curp    (curp),
  INDEX idx_cli_estado_busqueda (estado_busqueda),
  INDEX idx_cli_municipio (municipio),
  INDEX idx_cli_presupuesto (presupuesto_min, presupuesto_max),
  INDEX idx_cli_tipo_op (tipo_propiedad, operacion)
) ENGINE=InnoDB;

-- Tablas satélite del expediente
CREATE TABLE IF NOT EXISTS clientes_actividades (
  id_actividad INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente   INT NOT NULL,
  tipo         VARCHAR(50)  NOT NULL,
  descripcion  TEXT         NULL,
  fecha        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  id_asesor    INT          NULL,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  FOREIGN KEY (id_asesor)  REFERENCES asesores(id_asesor)  ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_documentos (
  id_documento INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente   INT          NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(100) NULL,
  url          TEXT         NOT NULL,
  fecha_subida TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_notas (
  id_nota    INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT  NOT NULL,
  contenido  TEXT NOT NULL,
  fecha      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente   INT          NOT NULL,
  fecha        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  usuario      VARCHAR(100) NULL,
  accion       VARCHAR(100) NOT NULL,
  descripcion  TEXT         NULL,
  campo        VARCHAR(100) NULL,
  valor_anterior TEXT       NULL,
  valor_nuevo    TEXT       NULL,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Propiedades v2
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS propiedades (
  id_propiedad INT AUTO_INCREMENT PRIMARY KEY,

  -- ── General ──────────────────────────────────────────────────────────────
  titulo          VARCHAR(200)  NOT NULL,
  descripcion     TEXT          NULL,
  tipo            VARCHAR(50)   NOT NULL,
  tipo_operacion  VARCHAR(20)   NOT NULL COMMENT 'venta, renta, preventa',
  status          VARCHAR(20)   DEFAULT 'disponible',
  id_asesor       INT           NULL,

  -- ── Propietario ──────────────────────────────────────────────────────────
  propietario_nombre    VARCHAR(200) NULL,
  propietario_whatsapp  VARCHAR(20)  NULL,

  -- ── Ubicación jerárquica ─────────────────────────────────────────────────
  pais            VARCHAR(100)  DEFAULT 'MX',
  estado          VARCHAR(100)  NULL,
  municipio       VARCHAR(100)  NULL,
  ciudad          VARCHAR(100)  NULL,
  colonia         VARCHAR(100)  NULL,
  fraccionamiento VARCHAR(100)  NULL,
  codigo_postal   VARCHAR(10)   NULL,

  -- ── Comercial ────────────────────────────────────────────────────────────
  precio              DECIMAL(15,2)  NOT NULL,
  precio_negociable   TINYINT(1)     DEFAULT 0,
  creditos_aceptados  TEXT           NULL COMMENT 'JSON array',
  comision            DECIMAL(5,2)   NULL,
  comision_compartida DECIMAL(5,2)   NULL,
  exclusiva           TINYINT(1)     DEFAULT 0,
  fecha_captacion     DATE           NULL,
  fecha_publicacion   DATE           NULL,

  -- ── Física ───────────────────────────────────────────────────────────────
  m2_construccion   DECIMAL(10,2) NULL,
  m2_terreno        DECIMAL(10,2) NULL,
  frente            DECIMAL(8,2)  NULL,
  fondo             DECIMAL(8,2)  NULL,
  recamaras         INT           DEFAULT 0,
  recamaras_pb      INT           DEFAULT 0,
  banos             DECIMAL(3,1)  DEFAULT 0.0,
  niveles           INT           DEFAULT 1,
  estacionamientos  INT           DEFAULT 0,
  antiguedad        INT           NULL COMMENT 'En años',
  orientacion       VARCHAR(50)   NULL,
  estado_conservacion VARCHAR(50) NULL,
  remodelada        TINYINT(1)    DEFAULT 0,
  anio_construccion INT           NULL,

  -- ── Legal ────────────────────────────────────────────────────────────────
  escrituras            TINYINT(1) DEFAULT 0,
  regimen               VARCHAR(100) NULL,
  libre_gravamen        TINYINT(1) DEFAULT 0,
  predial               TINYINT(1) DEFAULT 0,
  adeudos               TINYINT(1) DEFAULT 0,
  hipoteca_vigente      TINYINT(1) DEFAULT 0,
  documentacion_completa TINYINT(1) DEFAULT 0,

  -- ── Perfil ideal (para matching) ─────────────────────────────────────────
  ingreso_recomendado DECIMAL(15,2) NULL,
  tipo_credito_ideal  VARCHAR(100)  NULL,
  estado_civil_ideal  VARCHAR(50)   NULL,
  genero_ideal        VARCHAR(50)   NULL,
  hijos_ideal         INT           NULL,
  mascotas_ideal      INT           NULL,
  integrantes_ideal   INT           NULL,
  ideal_para          TEXT          NULL COMMENT 'JSON array',
  amenidades          TEXT          NULL COMMENT 'JSON array',
  servicios           TEXT          NULL COMMENT 'JSON array',
  uso_suelo           VARCHAR(50)   NULL,

  -- ── Scores ───────────────────────────────────────────────────────────────
  score_atractivo      DECIMAL(5,2) NULL,
  score_compatibilidad DECIMAL(5,2) NULL,

  -- ── Sistema ──────────────────────────────────────────────────────────────
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_asesor) REFERENCES asesores(id_asesor) ON DELETE SET NULL,
  INDEX idx_prop_estado   (estado),
  INDEX idx_prop_municipio(municipio),
  INDEX idx_prop_colonia  (colonia),
  INDEX idx_prop_precio   (precio),
  INDEX idx_prop_tipo     (tipo, tipo_operacion, status)
) ENGINE=InnoDB;

-- Multimedia de propiedades
CREATE TABLE IF NOT EXISTS propiedades_multimedia (
  id_media     INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad INT   NOT NULL,
  tipo         VARCHAR(20)   NOT NULL COMMENT 'foto, video, virtual, plano, documento',
  url          TEXT          NOT NULL,
  nombre       VARCHAR(255)  NULL,
  descripcion  VARCHAR(500)  NULL,
  es_principal TINYINT(1)    DEFAULT 0,
  orden        INT           DEFAULT 0,
  fecha_subida TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Motor de Compatibilidad Cliente ↔ Propiedad
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compatibilidad_cliente_propiedad (
  id_compat      INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente     INT          NOT NULL,
  id_propiedad   INT          NOT NULL,
  score_total    DECIMAL(5,2) NOT NULL,
  score_geo      DECIMAL(5,2) NULL,
  score_economico DECIMAL(5,2) NULL,
  score_fisico   DECIMAL(5,2) NULL,
  score_familiar DECIMAL(5,2) NULL,
  score_demo     DECIMAL(5,2) NULL,
  nivel          VARCHAR(30)  NULL COMMENT 'excelente, alta, media, baja',
  detalle_json   JSON         NULL,
  fecha_calculo  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_compat (id_cliente, id_propiedad),
  FOREIGN KEY (id_cliente)   REFERENCES clientes(id_cliente)      ON DELETE CASCADE,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Auditoría de Cambios
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria_cambios (
  id_auditoria  INT AUTO_INCREMENT PRIMARY KEY,
  tabla         VARCHAR(100) NOT NULL,
  id_registro   INT          NOT NULL,
  campo         VARCHAR(100) NOT NULL,
  valor_anterior TEXT        NULL,
  valor_nuevo    TEXT        NULL,
  usuario       VARCHAR(100) NULL,
  fecha         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auditoria_tabla_id (tabla, id_registro),
  INDEX idx_auditoria_fecha    (fecha)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Relaciones CNA
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relaciones_clientes_cna (
  id_relacion         INT AUTO_INCREMENT PRIMARY KEY,
  cliente_origen_id   INT          NOT NULL,
  cliente_destino_id  INT          NOT NULL,
  tipo_relacion       VARCHAR(50)  NOT NULL,
  fecha_relacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  peso                DECIMAL(3,2) DEFAULT 1.00,
  FOREIGN KEY (cliente_origen_id)  REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  FOREIGN KEY (cliente_destino_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  CONSTRAINT unique_cliente_rel UNIQUE (cliente_origen_id, cliente_destino_id, tipo_relacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS relaciones_asesores_cna (
  id_relacion         INT AUTO_INCREMENT PRIMARY KEY,
  asesor_origen_id    INT          NOT NULL,
  asesor_destino_id   INT          NOT NULL,
  tipo_relacion       VARCHAR(50)  NOT NULL,
  fecha_relacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  peso                DECIMAL(3,2) DEFAULT 1.00,
  FOREIGN KEY (asesor_origen_id)  REFERENCES asesores(id_asesor) ON DELETE CASCADE,
  FOREIGN KEY (asesor_destino_id) REFERENCES asesores(id_asesor) ON DELETE CASCADE,
  CONSTRAINT unique_asesor_rel UNIQUE (asesor_origen_id, asesor_destino_id, tipo_relacion)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Expediente de Propiedades
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS propiedades_actividades (
  id_actividad INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad INT NOT NULL,
  tipo         VARCHAR(50)  NOT NULL,
  descripcion  TEXT         NULL,
  fecha        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  id_asesor    INT          NULL,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE,
  FOREIGN KEY (id_asesor)    REFERENCES asesores(id_asesor)      ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS propiedades_documentos (
  id_documento INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad INT          NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_documento VARCHAR(100) NULL,
  url          TEXT         NOT NULL,
  fecha_subida TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS propiedades_notas (
  id_nota    INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad INT  NOT NULL,
  contenido  TEXT NOT NULL,
  fecha      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS propiedades_historial (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad INT          NOT NULL,
  fecha        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  usuario      VARCHAR(100) NULL,
  accion       VARCHAR(100) NOT NULL,
  descripcion  TEXT         NULL,
  campo        VARCHAR(100) NULL,
  valor_anterior TEXT       NULL,
  valor_nuevo    TEXT       NULL,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

