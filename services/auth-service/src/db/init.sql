CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  username      VARCHAR(60) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol           VARCHAR(20) NOT NULL
                CHECK (rol IN ('Tecnico','Agente','Gerente','Administrador')),
  activo        BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_auditoria (
  id_log        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario    UUID REFERENCES usuarios(id_usuario),
  accion        VARCHAR(100) NOT NULL,
  entidad_afectada VARCHAR(50),
  id_entidad    UUID,
  fecha_hora    TIMESTAMPTZ DEFAULT NOW(),
  ip_origen     VARCHAR(45),
  resultado     VARCHAR(20) CHECK (resultado IN ('Exitoso','Fallido'))
);

-- Log de auditoría: solo INSERT, nunca UPDATE ni DELETE (Ley 29733)
REVOKE UPDATE, DELETE ON log_auditoria FROM PUBLIC;