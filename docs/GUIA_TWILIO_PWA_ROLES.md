# WhatsApp/SMS, PWA offline y control de roles

## Activar WhatsApp o SMS

El `notification-service` acepta los canales `email`, `whatsapp` y `sms`.
El `ticket-service` dispara los canales indicados en `NOTIFICATION_CHANNELS`.

Ejemplo:

```env
NOTIFICATION_CHANNELS=email,whatsapp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=+14155238886
TWILIO_SMS_FROM=+1xxxxxxxxxx
```

Para pruebas con WhatsApp Sandbox, cada destinatario debe unirse al sandbox de
Twilio. En producción se requiere un remitente de WhatsApp aprobado y las
plantillas exigidas por Meta para conversaciones iniciadas por la empresa.

Los números peruanos almacenados con nueve dígitos se normalizan automáticamente
con el prefijo `+51`.

## PWA offline

El portal de taller incluye:

- `manifest.json` para instalación.
- Service worker para almacenar el shell de la aplicación.
- Caché local de la última lista de tickets.
- Cola persistente para cambios de estado realizados sin conexión.
- Sincronización automática cuando el navegador recupera conectividad.

Las evidencias fotográficas, repuestos y consultas externas requieren conexión.
La cola offline no almacena el JWT; usa la sesión activa al sincronizar.

## Roles

Las rutas sensibles aplican autenticación y autorización antes del controlador:

- Actualizar estado y subir evidencias: `Tecnico`.
- Asignar técnico y registrar entrega: `Agente` o `Administrador`.
- Asignar repuestos: `Tecnico`, `Agente` o `Administrador`.

Los controladores conservan sus validaciones contra base de datos como segunda
capa, incluyendo usuario activo, técnico asignado y reglas del estado.
