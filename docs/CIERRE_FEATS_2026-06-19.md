# Cierre funcional FEAT01–FEAT15

Fecha de revisión: 19 de junio de 2026.

## Resultado

Todos los FEATs están implementados y disponibles en el producto, con una única
excepción operativa:

- **FEAT04 (WhatsApp/SMS):** el proveedor Twilio, el enrutamiento por canal y la
  normalización de números peruanos están implementados. La validación real en
  producción queda pendiente hasta contratar/configurar credenciales y disponer
  de un remitente de WhatsApp aprobado por Meta.

## Cierres realizados

- **FEAT03:** SendGrid validado en producción con dominio autenticado, plantillas
  HTML, comprobante PDF y token interno.
- **FEAT05:** registro de equipo, diagnóstico inicial, selección de archivos,
  captura directa con cámara, previsualización y evidencia de recepción.
- **FEAT06:** PWA instalable, caché offline, cola persistente y sincronización.
- **FEAT07:** historial por número de serie visible para Técnico, Agente, Gerente
  y Administrador.
- **FEAT08:** autorización por rol en backend y panel de gestión de usuarios para
  Administrador; el Gerente accede a KPI e historial sin permisos de escritura.
- **FEAT14:** KPI dinámicos, distribución gráfica por estados y gráfico de
  eficiencia de repuestos.
- **FEAT15:** endpoint protegido por DNI, una respuesta por ticket, formulario
  público dedicado y enlace directo desde el correo de entrega.

## Matriz de acceso

| Acción | Técnico | Agente | Gerente | Administrador |
|---|---:|---:|---:|---:|
| Actualizar estado de ticket asignado | Sí | No | No | No |
| Subir evidencia técnica | Sí | No | No | Sí |
| Registrar equipo y evidencia inicial | No | Sí | No | Sí |
| Asignar técnico y registrar entrega | No | Sí | No | Sí |
| Consultar historial por serie | Sí | Sí | Sí | Sí |
| Ver dashboard KPI | No | No | Sí | Sí |
| Gestionar usuarios y roles | No | No | No | Sí |

La aplicación impide que un Administrador desactive su propia cuenta, retire su
propio rol o deje al sistema sin ningún Administrador activo.
