-- ============================================================
-- HIRAOKA SERVICES — Script de inicialización de base de datos
-- Cumple con DAS Sección 8.1 y Ley N° 29733
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: roles
-- Gestiona los perfiles de acceso (FEAT08)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id_rol        SERIAL PRIMARY KEY,
  nombre        VARCHAR(20) UNIQUE NOT NULL
                CHECK (nombre IN ('Tecnico','Agente','Gerente','Administrador')),
  descripcion   TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar roles base
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Tecnico',       'Registro de diagnósticos y gestión de tickets'),
  ('Agente',        'Consulta de tickets y atención al cliente'),
  ('Gerente',       'Acceso a analítica y reportes gerenciales')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- TABLA: usuarios
-- Usuarios internos del sistema (FEAT08, FEAT09)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  username        VARCHAR(60)  UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  id_rol          INTEGER REFERENCES roles(id_rol) ON DELETE RESTRICT,
  activo          BOOLEAN DEFAULT TRUE,
  fecha_creacion  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol      ON usuarios(id_rol);

-- ============================================================
-- TABLA: clientes
-- Clientes finales que traen equipos al taller (FEAT01, FEAT05)
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(150) NOT NULL,
  dni             VARCHAR(8)   UNIQUE NOT NULL,
  telefono        VARCHAR(15),
  email           VARCHAR(100),
  fecha_registro  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_dni   ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- ============================================================
-- TABLA: productos
-- Equipos registrados en el sistema (FEAT05, FEAT07)
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id_producto     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(150) NOT NULL,
  marca           VARCHAR(80),
  modelo          VARCHAR(80),
  numero_serie    VARCHAR(100) UNIQUE NOT NULL,
  descripcion     TEXT,
  fotos_entrada   JSONB DEFAULT '[]',
  fecha_registro  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_serie ON productos(numero_serie);

-- ============================================================
-- TABLA: tickets
-- Órdenes de servicio técnico — entidad central del sistema
-- (FEAT01, FEAT02, FEAT05, FEAT06, FEAT07)
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id_ticket               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente              UUID NOT NULL REFERENCES clientes(id_cliente)  ON DELETE RESTRICT,
  id_producto             UUID NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
  id_tecnico              UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  estado                  VARCHAR(20) NOT NULL DEFAULT 'Recibido'
                          CHECK (estado IN (
                            'Recibido',
                            'Diagnosticando',
                            'Reparando',
                            'Listo',
                            'Entregado'
                          )),
  descripcion_problema    TEXT,
  fecha_ingreso           TIMESTAMPTZ DEFAULT NOW(),
  fecha_estimada_entrega  TIMESTAMPTZ,
  fecha_entrega_real      TIMESTAMPTZ,
  creado_por              UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_cliente  ON tickets(id_cliente);
CREATE INDEX IF NOT EXISTS idx_tickets_estado   ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico  ON tickets(id_tecnico);
CREATE INDEX IF NOT EXISTS idx_tickets_ingreso  ON tickets(fecha_ingreso DESC);
