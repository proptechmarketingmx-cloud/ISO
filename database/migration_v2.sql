-- ═══════════════════════════════════════════════════════════════════════════
-- migration_v2.sql — Migración Incremental (solo ALTER TABLE / CREATE TABLE)
-- ISO Plataforma Inmobiliaria — Versión 2.0
-- Aplica sin pérdida de datos. Ejecutar sobre BD existente.
-- ═══════════════════════════════════════════════════════════════════════════

USE iso_db;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CLIENTES — nuevas columnas
-- ─────────────────────────────────────────────────────────────────────────────

-- Identificación geográfica
ALTER TABLE clientes
  ADD COLUMN pais              VARCHAR(100)    DEFAULT 'MX'  AFTER direccion,
  ADD COLUMN estado            VARCHAR(100)    NULL          AFTER pais,
  ADD COLUMN municipio         VARCHAR(100)    NULL          AFTER estado,
  ADD COLUMN colonia           VARCHAR(100)    NULL          AFTER municipio,
  ADD COLUMN codigo_postal     VARCHAR(10)     NULL          AFTER colonia,
  ADD COLUMN fraccionamiento   VARCHAR(100)    NULL          AFTER codigo_postal;

-- Perfil demográfico
ALTER TABLE clientes
  ADD COLUMN nacionalidad      VARCHAR(100)    NULL          AFTER rfc,
  ADD COLUMN profesion         VARCHAR(100)    NULL          AFTER ocupacion,
  ADD COLUMN puesto            VARCHAR(100)    NULL          AFTER profesion,
  ADD COLUMN escolaridad       VARCHAR(50)     NULL          AFTER puesto,
  ADD COLUMN generacion        VARCHAR(50)     NULL          COMMENT 'Calculado automáticamente',
  ADD COLUMN lada              VARCHAR(10)     NULL          COMMENT 'Calculado automáticamente';

-- Perfil familiar
ALTER TABLE clientes
  ADD COLUMN conyuge               VARCHAR(200)    NULL,
  ADD COLUMN conyuge_whatsapp      VARCHAR(20)     NULL,
  ADD COLUMN dependientes_eco      INT             NULL         COMMENT 'Dependientes económicos',
  ADD COLUMN adultos_mayores_cargo INT             NULL         COMMENT 'Adultos mayores a cargo';

-- Perfil financiero
ALTER TABLE clientes
  ADD COLUMN ingreso_mensual       DECIMAL(15,2)   NULL,
  ADD COLUMN presupuesto_min       DECIMAL(15,2)   NULL,
  ADD COLUMN presupuesto_max       DECIMAL(15,2)   NULL,
  ADD COLUMN enganche_disponible   DECIMAL(15,2)   NULL,
  ADD COLUMN pago_mensual_objetivo DECIMAL(15,2)   NULL,
  ADD COLUMN capacidad_credito_max DECIMAL(15,2)   NULL,
  ADD COLUMN antiguedad_laboral    VARCHAR(100)    NULL,
  ADD COLUMN nombre_empresa        VARCHAR(200)    NULL,
  ADD COLUMN tipo_credito          VARCHAR(100)    NULL;

-- Preferencias de inmueble
ALTER TABLE clientes
  ADD COLUMN operacion             VARCHAR(50)     NULL,
  ADD COLUMN tipo_propiedad        VARCHAR(100)    NULL,
  ADD COLUMN estado_busqueda       VARCHAR(100)    NULL         COMMENT 'Estado donde busca',
  ADD COLUMN ciudad_busqueda       VARCHAR(100)    NULL,
  ADD COLUMN fraccionamiento_colonia VARCHAR(200)  NULL,
  ADD COLUMN habitaciones_pa       INT             NULL,
  ADD COLUMN habitaciones_pb       INT             NULL,
  ADD COLUMN banos                 DECIMAL(3,1)    NULL,
  ADD COLUMN estacionamiento       INT             NULL,
  ADD COLUMN m2_terreno_min        DECIMAL(10,2)   NULL,
  ADD COLUMN m2_terreno_max        DECIMAL(10,2)   NULL,
  ADD COLUMN m2_construccion_min   DECIMAL(10,2)   NULL,
  ADD COLUMN m2_construccion_max   DECIMAL(10,2)   NULL,
  ADD COLUMN niveles_max           INT             NULL,
  ADD COLUMN antiguedad_max        INT             NULL         COMMENT 'Antigüedad máxima en años',
  ADD COLUMN amenidades_deseadas   TEXT            NULL         COMMENT 'JSON array de amenidades';

-- Motivación y temporalidad
ALTER TABLE clientes
  ADD COLUMN motivacion            VARCHAR(100)    NULL,
  ADD COLUMN temporalidad          VARCHAR(50)     NULL;

-- Seguimiento comercial
ALTER TABLE clientes
  ADD COLUMN referenciado          VARCHAR(255)    NULL,
  ADD COLUMN fuente_lead           VARCHAR(100)    NULL,
  ADD COLUMN campana               VARCHAR(200)    NULL,
  ADD COLUMN medio_adquisicion     VARCHAR(100)    NULL,
  ADD COLUMN utm_source            VARCHAR(200)    NULL,
  ADD COLUMN utm_medium            VARCHAR(100)    NULL,
  ADD COLUMN utm_campaign          VARCHAR(200)    NULL;

-- Scores CNA (calculados por el sistema)
ALTER TABLE clientes
  ADD COLUMN score_cna             DECIMAL(5,2)    NULL         COMMENT 'Customer Network Analysis score',
  ADD COLUMN score_compatibilidad  DECIMAL(5,2)    NULL         COMMENT 'Score promedio de compatibilidad';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PROPIEDADES — nuevas columnas
-- ─────────────────────────────────────────────────────────────────────────────

-- Ubicación jerárquica
ALTER TABLE propiedades
  ADD COLUMN pais              VARCHAR(100)    DEFAULT 'MX'  AFTER status,
  ADD COLUMN estado            VARCHAR(100)    NULL          AFTER pais,
  ADD COLUMN municipio         VARCHAR(100)    NULL          AFTER estado,
  ADD COLUMN fraccionamiento   VARCHAR(100)    NULL          AFTER municipio,
  ADD COLUMN codigo_postal     VARCHAR(10)     NULL          AFTER colonia;

-- Información comercial
ALTER TABLE propiedades
  ADD COLUMN comision              DECIMAL(5,2)    NULL         COMMENT '% de comisión',
  ADD COLUMN comision_compartida   DECIMAL(5,2)    NULL         COMMENT '% comisión compartida',
  ADD COLUMN exclusiva             TINYINT(1)      DEFAULT 0,
  ADD COLUMN fecha_captacion       DATE            NULL,
  ADD COLUMN fecha_publicacion     DATE            NULL,
  ADD COLUMN creditos_aceptados    TEXT            NULL         COMMENT 'JSON array de tipos de crédito',
  ADD COLUMN precio_negociable     TINYINT(1)      DEFAULT 0,
  ADD COLUMN propietario_nombre    VARCHAR(200)    NULL,
  ADD COLUMN propietario_whatsapp  VARCHAR(20)     NULL;

-- Physical details that did not exist
ALTER TABLE propiedades
  ADD COLUMN recamaras_pb          INT             DEFAULT 0,
  ADD COLUMN niveles               INT             DEFAULT 1,
  ADD COLUMN estacionamientos      INT             DEFAULT 0,
  ADD COLUMN frente                DECIMAL(8,2)    NULL,
  ADD COLUMN fondo                 DECIMAL(8,2)    NULL,
  ADD COLUMN antiguedad            INT             NULL         COMMENT 'Antigüedad en años',
  ADD COLUMN orientacion           VARCHAR(50)     NULL,
  ADD COLUMN estado_conservacion   VARCHAR(50)     NULL,
  ADD COLUMN remodelada            TINYINT(1)      DEFAULT 0,
  ADD COLUMN anio_construccion     INT             NULL;

-- Información legal
ALTER TABLE propiedades
  ADD COLUMN escrituras            TINYINT(1)      DEFAULT 0,
  ADD COLUMN regimen               VARCHAR(100)    NULL,
  ADD COLUMN libre_gravamen        TINYINT(1)      DEFAULT 0,
  ADD COLUMN predial               TINYINT(1)      DEFAULT 0,
  ADD COLUMN adeudos               TINYINT(1)      DEFAULT 0,
  ADD COLUMN hipoteca_vigente      TINYINT(1)      DEFAULT 0,
  ADD COLUMN documentacion_completa TINYINT(1)     DEFAULT 0;

-- Perfil ideal del comprador (para matching)
ALTER TABLE propiedades
  ADD COLUMN ingreso_recomendado   DECIMAL(15,2)   NULL,
  ADD COLUMN tipo_credito_ideal    VARCHAR(100)    NULL,
  ADD COLUMN estado_civil_ideal    VARCHAR(50)     NULL,
  ADD COLUMN genero_ideal          VARCHAR(50)     NULL,
  ADD COLUMN hijos_ideal           INT             NULL,
  ADD COLUMN mascotas_ideal        INT             NULL,
  ADD COLUMN integrantes_ideal     INT             NULL,
  ADD COLUMN ideal_para            TEXT            NULL         COMMENT 'JSON array',
  ADD COLUMN amenidades            TEXT            NULL         COMMENT 'JSON array',
  ADD COLUMN servicios             TEXT            NULL         COMMENT 'JSON array',
  ADD COLUMN uso_suelo             VARCHAR(50)     NULL;

-- Scores (calculados por el sistema)
ALTER TABLE propiedades
  ADD COLUMN score_atractivo       DECIMAL(5,2)    NULL,
  ADD COLUMN score_compatibilidad  DECIMAL(5,2)    NULL         COMMENT 'Score promedio con clientes';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. NUEVAS TABLAS
-- ─────────────────────────────────────────────────────────────────────────────

-- Multimedia de propiedades
CREATE TABLE IF NOT EXISTS propiedades_multimedia (
  id_media      INT AUTO_INCREMENT PRIMARY KEY,
  id_propiedad  INT NOT NULL,
  tipo          VARCHAR(20) NOT NULL COMMENT 'foto, video, virtual, plano, documento',
  url           TEXT NOT NULL,
  nombre        VARCHAR(255) NULL,
  descripcion   VARCHAR(500) NULL,
  es_principal  TINYINT(1) DEFAULT 0,
  orden         INT DEFAULT 0,
  fecha_subida  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Motor de compatibilidad Cliente ↔ Propiedad
CREATE TABLE IF NOT EXISTS compatibilidad_cliente_propiedad (
  id_compat     INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente    INT NOT NULL,
  id_propiedad  INT NOT NULL,
  score_total   DECIMAL(5,2)  NOT NULL COMMENT 'Score 0-100',
  score_geo     DECIMAL(5,2)  NULL     COMMENT 'Score geográfico',
  score_economico DECIMAL(5,2) NULL    COMMENT 'Score económico',
  score_fisico  DECIMAL(5,2)  NULL     COMMENT 'Score físico',
  score_familiar DECIMAL(5,2) NULL    COMMENT 'Score familiar',
  score_demo    DECIMAL(5,2)  NULL     COMMENT 'Score demográfico',
  nivel         VARCHAR(30)   NULL     COMMENT 'excelente, alta, media, baja',
  detalle_json  JSON          NULL,
  fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_compat (id_cliente, id_propiedad),
  FOREIGN KEY (id_cliente)   REFERENCES clientes(id_cliente)      ON DELETE CASCADE,
  FOREIGN KEY (id_propiedad) REFERENCES propiedades(id_propiedad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Auditoría de cambios (campo por campo)
CREATE TABLE IF NOT EXISTS auditoria_cambios (
  id_auditoria  INT AUTO_INCREMENT PRIMARY KEY,
  tabla         VARCHAR(100) NOT NULL,
  id_registro   INT          NOT NULL,
  campo         VARCHAR(100) NOT NULL,
  valor_anterior TEXT        NULL,
  valor_nuevo    TEXT        NULL,
  usuario       VARCHAR(100) NULL,
  fecha         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auditoria_tabla_id (tabla, id_registro),
  INDEX idx_auditoria_fecha (fecha)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ÍNDICES DE BÚSQUEDA Y MATCHING
-- ─────────────────────────────────────────────────────────────────────────────

-- Índices clientes para matching geográfico
ALTER TABLE clientes
  ADD INDEX idx_cli_estado    (estado_busqueda),
  ADD INDEX idx_cli_municipio (municipio),
  ADD INDEX idx_cli_colonia   (colonia),
  ADD INDEX idx_cli_presupuesto (presupuesto_min, presupuesto_max),
  ADD INDEX idx_cli_tipo_op   (tipo_propiedad, operacion);

-- Índices propiedades para matching
ALTER TABLE propiedades
  ADD INDEX idx_prop_estado   (estado),
  ADD INDEX idx_prop_municipio(municipio),
  ADD INDEX idx_prop_colonia  (colonia),
  ADD INDEX idx_prop_precio   (precio),
  ADD INDEX idx_prop_tipo     (tipo, tipo_operacion, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. EXPEDIENTE DE PROPIEDADES (Nuevas Tablas Satélite)
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MULTI-TENANCY & RBAC (Roles y Permisos)
-- ─────────────────────────────────────────────────────────────────────────────

-- Columna id_tenant en tablas principales
ALTER TABLE asesores    ADD COLUMN id_tenant INT NULL AFTER id_asesor;
ALTER TABLE clientes    ADD COLUMN id_tenant INT NULL AFTER id_cliente;
ALTER TABLE propiedades ADD COLUMN id_tenant INT NULL AFTER id_propiedad;

-- Tabla Tenants (Agencias)
CREATE TABLE IF NOT EXISTS tenants (
  id_tenant   INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  plan        VARCHAR(50)  DEFAULT 'pro',
  activo      BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
  id_tenant     INT NULL,
  id_asesor     INT NULL,
  id_manager    INT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre        VARCHAR(100) NULL,
  activo        BOOLEAN      DEFAULT TRUE,
  ultimo_acceso TIMESTAMP    NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tenant)  REFERENCES tenants(id_tenant) ON DELETE CASCADE,
  FOREIGN KEY (id_asesor)  REFERENCES asesores(id_asesor) ON DELETE SET NULL,
  FOREIGN KEY (id_manager) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Columna id_manager para migraciones sobre tablas existentes
ALTER TABLE usuarios ADD COLUMN id_manager INT NULL AFTER id_asesor;


-- Tabla Roles
CREATE TABLE IF NOT EXISTS roles (
  id_rol      INT AUTO_INCREMENT PRIMARY KEY,
  id_tenant   INT NULL COMMENT 'NULL indica Rol Global de Sistema',
  nombre      VARCHAR(50)  NOT NULL,
  slug        VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255) NULL,
  es_sistema  BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tenant_slug (id_tenant, slug)
) ENGINE=InnoDB;

-- Tabla Permisos
CREATE TABLE IF NOT EXISTS permisos (
  id_permiso    INT AUTO_INCREMENT PRIMARY KEY,
  id_rol        INT         NOT NULL,
  modulo        VARCHAR(50) NOT NULL,
  puede_crear   BOOLEAN     DEFAULT FALSE,
  puede_leer    BOOLEAN     DEFAULT FALSE,
  puede_editar  BOOLEAN     DEFAULT FALSE,
  puede_eliminar BOOLEAN    DEFAULT FALSE,
  restricciones JSON        NULL COMMENT 'eg: {"solo_propios": true}',
  updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by    INT         NULL,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
  UNIQUE KEY unique_rol_modulo (id_rol, modulo)
) ENGINE=InnoDB;

-- Tabla Usuario-Roles (M:N)
CREATE TABLE IF NOT EXISTS usuario_roles (
  id_usuario  INT NOT NULL,
  id_rol      INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT NULL,
  PRIMARY KEY (id_usuario, id_rol),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_rol)     REFERENCES roles(id_rol)     ON DELETE CASCADE
) ENGINE=InnoDB;

-- Auditoría de Roles y Permisos
CREATE TABLE IF NOT EXISTS auditoria_roles (
  id_audit         INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NULL,
  id_tenant        INT NULL,
  entidad          VARCHAR(50)  NOT NULL,
  id_entidad       INT          NOT NULL,
  accion           VARCHAR(50)  NOT NULL,
  snapshot_antes   JSON         NULL,
  snapshot_despues JSON         NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data Inicial para RBAC (2 roles: admin, asesor)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO tenants (id_tenant, nombre, slug, plan, activo) VALUES (1, 'Agencia Demo', 'demo', 'enterprise', 1);

-- Solo 2 roles de sistema
INSERT IGNORE INTO roles (id_rol, id_tenant, nombre, slug, descripcion, es_sistema) VALUES
(1, 1, 'Admin', 'admin', 'Control total de la agencia', 1),
(2, 1, 'Asesor', 'asesor', 'Gestión de propios leads y propiedades asignadas', 1);

-- Permisos para Admin (CRUD completo en todos los módulos)
INSERT IGNORE INTO permisos (id_rol, modulo, puede_crear, puede_leer, puede_editar, puede_eliminar) VALUES
(1, 'clientes',        1, 1, 1, 1),
(1, 'clientes_ajenos', 1, 1, 1, 1),
(1, 'propiedades',     1, 1, 1, 1),
(1, 'cna',             1, 1, 1, 1),
(1, 'red_contactos',   1, 1, 1, 1),
(1, 'kpis',            1, 1, 1, 1),
(1, 'asesores',        1, 1, 1, 1),
(1, 'usuarios',        1, 1, 1, 1),
(1, 'facturacion',     1, 1, 1, 1),
(1, 'config_tenant',   1, 1, 1, 1);

-- Permisos para Asesor (solo sus propios registros; sin acceso a admin, facturación, config)
INSERT IGNORE INTO permisos (id_rol, modulo, puede_crear, puede_leer, puede_editar, puede_eliminar, restricciones) VALUES
(2, 'clientes',        1, 1, 1, 0, '{"solo_propios": true}'),
(2, 'clientes_ajenos', 0, 0, 0, 0, NULL),
(2, 'propiedades',     0, 1, 1, 0, '{"solo_asignadas": true}'),
(2, 'cna',             0, 1, 0, 0, NULL),
(2, 'red_contactos',   0, 1, 0, 0, NULL),
(2, 'kpis',            0, 1, 0, 0, '{"solo_propios": true}'),
(2, 'asesores',        0, 1, 0, 0, NULL),
(2, 'usuarios',        0, 0, 0, 0, NULL),
(2, 'facturacion',     0, 0, 0, 0, NULL),
(2, 'config_tenant',   0, 0, 0, 0, NULL);

-- Usuario Administrador por defecto (password: admin123 → bcrypt 4.x)
INSERT IGNORE INTO usuarios (id_usuario, id_tenant, email, password_hash, nombre, activo) VALUES
(1, 1, 'admin@demo.com', '$2b$12$TDiHqgGTmb0UrbtkIa0VkuEzt0H/y9bqp0n2o9ymQdz3gN6A8e6gG', 'Admin Demo', 1);

INSERT IGNORE INTO usuario_roles (id_usuario, id_rol) VALUES (1, 1);



