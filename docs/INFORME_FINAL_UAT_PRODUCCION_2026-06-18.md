# Informe final UAT y preparación para producción

Fecha de revisión: 18 de junio de 2026

Base revisada: `main` en `28eebbe`
Informe UAT de referencia: versión evaluada en `8f417b5`

## Estado general

- Listo para producción: **No**
- Nivel de riesgo residual: **Medio**
- Motivo: el código y los flujos críticos locales quedan operativos, pero falta validar envío real con SendGrid y certificados SSL públicos válidos en el host de producción.

El documento UAT contiene una discrepancia: declara 4 bugs críticos y 6 altos, pero solo identifica por código HSPP-86, HSPP-105, HSPP-106, HSPP-138, HSPP-139 y HSPP-104. La clasificación de este informe se limita a esos issues trazables.

## Bugs corregidos durante esta revisión

### HSPP-104 - Rate limiting bajo carga y bloqueo multirol

- Causa: existían dos limitadores acumulados para login, uno en el gateway y otro en auth-service. El límite efectivo era 5 intentos por IP, lo que bloqueaba pruebas multirol y usuarios detrás de una NAT.
- Solución: se dejó un único limitador central en el gateway, configurable mediante variables de entorno. Se añadieron logs del evento `rate_limit_exceeded`.
- Archivos modificados:
  - `services/api-gateway/src/index.js`
  - `services/auth-service/src/routes/auth.routes.js`
  - `services/auth-service/package.json`
  - `services/auth-service/package-lock.json`
  - `.env.example`
  - `docker-compose.yml`

### Exposición de tickets por DNI o ID

- Causa: `GET /tickets/dni/:dni` y `GET /tickets/:id` eran públicos. El portal permitía consultar solo con DNI, facilitando enumeración de datos personales.
- Solución: ambos endpoints requieren JWT; la consulta pública exige la combinación DNI + ticket mediante `POST /tickets/consulta`. El frontend ahora exige el ticket y el panel de agente envía autenticación.
- Archivos modificados:
  - `services/ticket-service/src/routes/ticket.routes.js`
  - `services/ticket-service/src/controllers/ticket.controller.js`
  - `services/ticket-service/src/public/index.html`
  - `services/ticket-service/src/public/app.js`
  - `services/ticket-service/src/public/agente/app.js`

### Encuesta NPS sin validación de titular

- Causa: una encuesta podía enviarse conociendo únicamente el identificador del ticket.
- Solución: el endpoint NPS valida también el DNI asociado al ticket.
- Archivos modificados:
  - `services/ticket-service/src/controllers/ticket.controller.js`
  - `services/ticket-service/src/public/app.js`

### Log de auditoría modificable por el propietario

- Causa: `REVOKE UPDATE/DELETE FROM PUBLIC` no retiraba privilegios al propietario de la tabla.
- Solución: trigger de PostgreSQL que bloquea `UPDATE`, `DELETE` y `TRUNCATE`; se añadió índice compuesto para consultas de historial.
- Evidencia: un `UPDATE` de prueba fue rechazado con `log_auditoria es inmutable`.
- Archivos modificados:
  - `services/auth-service/src/db/audit.sql`

### Endpoint de notificaciones expuesto

- Causa: cualquier cliente podía invocar `/api/notifications/send`.
- Solución: token interno con comparación segura; en producción se exige un secreto de 32 o más caracteres. Ticket-service lo transmite en llamadas internas.
- Archivos modificados:
  - `services/notification-service/src/index.js`
  - `services/notification-service/src/routes/notification.routes.js`
  - `services/ticket-service/src/controllers/ticket.controller.js`
  - `.env.example`
  - `docker-compose.yml`

### Dependencias con vulnerabilidades altas

- Causa: versiones vulnerables de `http-proxy-middleware` y `multer`.
- Solución:
  - `http-proxy-middleware` actualizado a `^4.1.1`.
  - `multer` actualizado a `^2.2.0`.
  - ticket-service actualizado a Node 20 y `npm ci --omit=dev`.
- Evidencia: `npm audit --omit=dev` devuelve 0 vulnerabilidades en los siete servicios.

## Bugs UAT ya corregidos previamente

### HSPP-86

- Bug: error 500 al actualizar estado por conflicto UUID/text en `log_auditoria`.
- Evidencia: `id_entidad` es `TEXT`, las inserciones convierten el ID explícitamente y la actualización real devolvió HTTP 200.

### HSPP-105

- Bug: `POST /api/auth/login` devolvía 404.
- Evidencia: el gateway reescribe `/api/auth` y los logins de Agente, Técnico y Administrador devolvieron HTTP 200.

### HSPP-106

- Bug: `JWT_SECRET` faltante en ticket-service.
- Evidencia: está presente en Compose y los endpoints protegidos aceptan JWT válido y rechazan solicitudes sin token.

### HSPP-138

- Bug: `crearTicket` no definido y `POST /tickets` deshabilitado.
- Evidencia: la función existe, está exportada y la ruta está activa. Se creó un ticket temporal con HTTP 201 y luego se eliminó.

### HSPP-139

- Bug: columna `observaciones_tecnicas` inexistente.
- Evidencia: la migración agrega la columna idempotentemente y `GET /tickets/tecnico/mis-tickets` devolvió HTTP 200.

## Bugs o condiciones no reproducibles

### SendGrid

- Resultado: la integración llega al notification-service y registra el fallo, pero no puede comprobarse envío real porque faltan `SENDGRID_API_KEY` y `SENDGRID_FROM_EMAIL`.

### SSL público

- Resultado: la configuración Nginx es sintácticamente válida, redirige HTTP a HTTPS y define TLS 1.2/1.3 y HSTS. No se validó el certificado real ni la cadena pública porque no están disponibles en el entorno local.

## Seguridad y producción

- `.env` no está versionado.
- No se detectaron claves privadas, tokens SendGrid ni credenciales reales en archivos rastreados.
- JWT y token interno se validan al iniciar en producción.
- CORS no usa wildcard y el origen no autorizado probado no recibió `Access-Control-Allow-Origin`.
- Se añadieron límites de cuerpo JSON y manejo JSON de errores de subida.
- Se reforzaron las validaciones de cliente, email, teléfono, equipo, técnico y montos.
- Docker usa rotación `json-file` de 10 MB, 5 archivos.
- RLS no está habilitado. El sistema no es multi-tenant y usa autorización en servicios; si se comparte la base con otros consumidores, deben crearse roles DB separados y políticas RLS.

## Base de datos y performance

- Integridad comprobada: 10 tickets, ninguno sin código ni relaciones requeridas.
- Restricciones PK, FK, UNIQUE y CHECK presentes.
- Se añadió `idx_audit_entidad_historial(entidad_afectada, id_entidad, fecha_hora)`.
- Las consultas medidas son rápidas con el volumen actual; se recomienda activar `pg_stat_statements` en producción y alertar por consultas mayores a 500 ms.
- Persisten índices redundantes en DNI, username y número de serie; no se eliminaron para evitar cambios de esquema innecesarios antes del despliegue.

## Logging y monitoreo

Eventos registrados:

- Todas las solicitudes HTTP del gateway: método, ruta sanitizada, estado, duración, IP, user-agent y `request_id`.
- Límites de tasa excedidos.
- Logins exitosos/fallidos y logout.
- Creación de tickets, cambios de estado, asignaciones, pagos, evidencias y notificaciones.
- Errores de conexión a base de datos y servicios.
- Access/error logs de Nginx y logs nativos de PostgreSQL.

Almacenamiento:

- Operaciones críticas: tabla inmutable `log_auditoria`.
- Logs técnicos: stdout/stderr de Docker con rotación.
- Nginx y PostgreSQL: salida de contenedores y rutas internas estándar.

Estos logs ayudan a detectar fuerza bruta, errores 5xx, latencia, caídas de upstream, fallos de email, cambios no autorizados y degradación de base de datos.

## SSL y contenido mixto

- El frontend no contiene recursos HTTP externos.
- Las URLs HTTP encontradas son internas de la red Docker o valores locales de desarrollo.
- Nginx de producción redirige puerto 80 a HTTPS, usa TLS 1.2/1.3, HSTS y timeouts de proxy.
- La configuración SSL está aislada en `docker-compose.prod.yml` y `nginx/nginx.prod.conf`; desarrollo no exige certificados inexistentes.
- `PORTAL_URL` y `CORS_ORIGIN` deben configurarse con `https://hiraokaservices.lat` en producción.

## Pruebas finales

| Caso | Resultado |
|---|---|
| Login Agente | PASÓ |
| Login Técnico | PASÓ |
| Login Administrador | PASÓ |
| Verificación JWT | PASÓ |
| Consulta pública DNI + ticket | PASÓ |
| Consulta pública solo DNI | Rechazada con 401 |
| Consulta ticket directa sin JWT | Rechazada con 401 |
| Crear ticket como Agente | PASÓ, HTTP 201 |
| BUG-009: servicio inicia y `crearTicket` responde | PASÓ, HTTP 201 |
| Crear ticket sin JWT | Rechazada con 401 |
| Email inválido | Rechazado con 400 |
| Listar tickets del técnico | PASÓ |
| BUG-010: consulta con `observaciones_tecnicas` | PASÓ, HTTP 200 |
| Agente intentando lista técnica | Rechazado con 403 |
| Cambio de estado válido | PASÓ, HTTP 200 |
| Salto de estado inválido | Rechazado con 400 |
| Dashboard Administrador | PASÓ |
| Notificación pública sin token interno | Rechazada con 401 |
| NPS con DNI incorrecto | Rechazado con 404 |
| Inmutabilidad de auditoría | PASÓ |
| Nginx `nginx -t` | PASÓ |
| Sintaxis de 32 archivos JS | PASÓ |
| Docker Compose config | PASÓ |
| Responsive 390x844: público, agente, técnico y admin | PASÓ, sin overflow horizontal |
| Consola navegador | Sin errores |
| BUG-011: garantía inexistente | Backend 404 controlado y frontend muestra “Sin garantia registrada” |
| Flujo Recibido → Diagnosticando → Reparando → Listo → Entregado | PASÓ |
| Comprobante de pago PDF | PASÓ, archivo válido con cabecera `%PDF` |
| Fallo de SendGrid sin credenciales | Controlado; entrega confirmada y fallo auditado |

No existe un rol `Cliente` autenticado; el cliente usa el portal público seguro. Tampoco existe un flujo de registro de clientes con cuenta, por lo que “Registro” se validó como registro de entrada de equipo por Agente.

## Riesgos pendientes

1. Configurar y probar SendGrid real.
2. Instalar y validar certificados Let's Encrypt en el host final.
3. Las evidencias se sirven mediante URLs estáticas después de una consulta válida. Se recomienda migrarlas a almacenamiento privado con URLs firmadas antes de manejar evidencia sensible real.
4. No hay suite automatizada del proyecto; las pruebas ejecutadas fueron estáticas, API, base de datos y navegador.
5. Falta observabilidad centralizada. Para producción se recomienda Loki/ELK, alertas de 5xx y latencia, y `pg_stat_statements`.
6. No se ejecutó carga k6 de 200 usuarios porque el script UAT no está incluido en el repositorio.

## Recomendaciones antes del despliegue

1. Definir `NODE_ENV=production`, secretos seguros, `PORTAL_URL=https://hiraokaservices.lat` y `CORS_ORIGIN=https://hiraokaservices.lat,https://www.hiraokaservices.lat`.
2. Verificar correo real de cambio de estado, listo para retiro y entregado.
3. Ejecutar prueba TLS externa y comprobar renovación automática de Certbot.
4. Ejecutar backup/restore de PostgreSQL y prueba de rollback.
5. Añadir smoke tests automatizados para login, consulta segura, creación y transición de ticket.
6. Repetir carga con IPs distribuidas y ajustar `RATE_LIMIT_MAX` con métricas reales.

## Archivos modificados

- `.env.example`
- `docker-compose.yml`
- `nginx/nginx.conf`
- `services/api-gateway/package.json`
- `services/api-gateway/package-lock.json`
- `services/api-gateway/src/index.js`
- `services/auth-service/package.json`
- `services/auth-service/package-lock.json`
- `services/auth-service/src/controllers/auth.controller.js`
- `services/auth-service/src/db/audit.sql`
- `services/auth-service/src/index.js`
- `services/auth-service/src/routes/auth.routes.js`
- `services/notification-service/src/index.js`
- `services/notification-service/src/routes/notification.routes.js`
- `services/ticket-service/Dockerfile`
- `services/ticket-service/package.json`
- `services/ticket-service/package-lock.json`
- `services/ticket-service/src/controllers/ticket.controller.js`
- `services/ticket-service/src/index.js`
- `services/ticket-service/src/public/agente/app.js`
- `services/ticket-service/src/public/app.js`
- `services/ticket-service/src/public/index.html`
- `services/ticket-service/src/routes/ticket.routes.js`
- `docs/INFORME_FINAL_UAT_PRODUCCION_2026-06-18.md`

## Commits recomendados

1. `fix(uat): habilita y valida flujo seguro de tickets`
2. `fix(security): protege datos públicos, NPS y notificaciones internas`
3. `fix(db): hace inmutable la auditoria y optimiza historial`
4. `chore(deps): actualiza proxy, multer y runtime de ticket-service`
5. `feat(observability): agrega logs correlacionados y rotacion Docker`
6. `docs(release): agrega informe final UAT y go-no-go`

## Cierre de auditoría visual y bugs adicionales

### Bugs corregidos

- Bug: `BUG-009`, ticket-service no iniciaba por referencia a `crearTicket`.
  - Causa: la ruta `POST /tickets` no tenía una implementación exportada consistente.
  - Solución: se implementó y exportó `crearTicket`, con validaciones, transacción, auditoría y respuesta HTTP 201.
- Bug: `BUG-010`, listado técnico devolvía 500 por `observaciones_tecnicas`.
  - Causa: discrepancia entre la consulta y el esquema desplegado.
  - Solución: migración idempotente `ADD COLUMN IF NOT EXISTS` y conservación del campo en las consultas.
- Bug: `BUG-011`, garantía permanecía en “Verificando...” ante HTTP 404.
  - Causa: el frontend transformaba cualquier respuesta no exitosa en `null`, pero `null` volvía a representarse como carga.
  - Solución: estado terminal `sin_registro`, texto “Sin garantia registrada” y estilo propio. También se eliminó el estilo inline de evidencias que infringía CSP.

### Mejoras de auditoría visual

- Colores de la línea de tiempo según estado y eliminación del icono flotante de herramienta.
- Texto “Disponible para retiro desde” en estado `Listo`.
- Alineación del botón de retorno.
- Historial técnico en modo solo lectura y filtro por técnico.
- Confirmación explícita para notificar al cliente al marcar `Listo`.
- Navegación administrativa simplificada, UUID compactos copiables y gráfico de estados más legible.
- Centrado del acceso de Agente y ajustes responsive.
- Flujo de liquidación simulado, transición automática a `Entregado` y comprobante PDF adjunto al correo.

### Archivos visuales y de cierre adicionales

- `services/admin-service/src/public/app.js`
- `services/admin-service/src/public/index.html`
- `services/admin-service/src/public/styles.css`
- `services/taller-service/src/public/app.js`
- `services/taller-service/src/public/index.html`
- `services/taller-service/src/public/styles.css`
- `services/ticket-service/src/public/agente/styles.css`
- `services/ticket-service/src/public/styles.css`
- `services/notification-service/package.json`
- `services/notification-service/package-lock.json`
- `services/notification-service/src/providers/emailProvider.js`
- `services/notification-service/src/templates/entregado.html`
- `docs/GUIA_SENDGRID_PRODUCCION.md`
