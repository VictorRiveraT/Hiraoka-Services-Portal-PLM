-- ============================================================
-- HIRAOKA SERVICES — Tabla de auditoría inalterable
-- Cumple con FEAT09 y Ley N° 29733 (Art. 11)
-- ============================================================

CREATE TABLE IF NOT EXISTS log_auditoria (
  id_log            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario        UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  accion            VARCHAR(100) NOT NULL,
  entidad_afectada  VARCHAR(50),
  id_entidad        TEXT,
  detalle           JSONB DEFAULT '{}',
  ip_origen         VARCHAR(45),
  resultado         VARCHAR(20) CHECK (resultado IN ('Exitoso','Fallido')),
  fecha_hora        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE log_auditoria
  ALTER COLUMN id_entidad TYPE TEXT USING id_entidad::TEXT;

-- Índices para consultas del dashboard (FEAT14)
CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON log_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_audit_fecha     ON log_auditoria(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_audit_accion    ON log_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_audit_entidad_historial
  ON log_auditoria(entidad_afectada, id_entidad, fecha_hora);

-- ============================================================
-- POLÍTICA DE INMUTABILIDAD (Ley N° 29733)
-- Ningún microservicio puede modificar o eliminar registros
-- Solo se permiten INSERT y SELECT
-- ============================================================
REVOKE UPDATE ON log_auditoria FROM PUBLIC;
REVOKE DELETE ON log_auditoria FROM PUBLIC;

CREATE OR REPLACE FUNCTION impedir_mutacion_log_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'log_auditoria es inmutable: % no permitido', TG_OP
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_log_auditoria_inmutable ON log_auditoria;
CREATE TRIGGER trg_log_auditoria_inmutable
BEFORE UPDATE OR DELETE OR TRUNCATE ON log_auditoria
FOR EACH STATEMENT
EXECUTE FUNCTION impedir_mutacion_log_auditoria();
