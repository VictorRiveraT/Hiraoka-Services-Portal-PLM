# Protocolo de Gobierno de Datos - Hiraoka Services
## Cumplimiento Ley N 29733 - Proteccion de Datos Personales

### 1. Datos personales que maneja el sistema
- DNI del cliente
- Numero de telefono y correo electronico
- Historial de equipos y tickets de servicio

### 2. Principios aplicados
- Consentimiento: El cliente acepta el tratamiento al usar el portal (flujo ARCO en FEAT01).
- Finalidad: Los datos se usan exclusivamente para gestion del servicio post-venta.
- Seguridad: Toda comunicacion bajo TLS 1.3. Contrasenas con hash bcrypt.
- Minimo privilegio: Acceso por roles (FEAT08).

### 3. Log de Auditoria (FEAT09)
- Toda accion critica queda registrada de forma inalterable.
- Los registros incluyen: usuario, accion, timestamp, IP de origen.
- No se permite DELETE sobre la tabla de auditoria.

### 4. Notificaciones (FEAT03, FEAT04)
- Los mensajes SMS/email no exponen datos sensibles.
- Solo se incluye el numero de ticket y el enlace al portal.

### 5. Encuestas NPS (FEAT15)
- Los resultados se almacenan pseudonimizados.
