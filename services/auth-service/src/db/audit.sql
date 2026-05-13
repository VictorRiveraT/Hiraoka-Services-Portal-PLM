-- ============================================================
-- HIRAOKA SERVICES — Tabla de auditoría inalterable
-- Cumple con FEAT09 y Ley N° 29733 (Art. 11)
-- ============================================================

CREATE TABLE IF NOT EXISTS log_auditoria (
  id_log            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario        UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  accion            VARCHAR(100) NOT NULL,
  entidad_afectada  VARCHAR(50),
  id_entidad        UUID,
  detalle           JSONB DEFAULT '{}',
  ip_origen         VARCHAR(45),
  resultado         VARCHAR(20) CHECK (resultado IN ('Exitoso','Fallido')),
  fecha_hora        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas del dashboard (FEAT14)
CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON log_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_audit_fecha     ON log_auditoria(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_audit_accion    ON log_auditoria(accion);

-- ============================================================
-- POLÍTICA DE INMUTABILIDAD (Ley N° 29733)
-- Ningún microservicio puede modificar o eliminar registros
-- Solo se permiten INSERT y SELECT
-- ============================================================
REVOKE UPDATE ON log_auditoria FROM PUBLIC;
REVOKE DELETE ON log_auditoria FROM PUBLIC;
