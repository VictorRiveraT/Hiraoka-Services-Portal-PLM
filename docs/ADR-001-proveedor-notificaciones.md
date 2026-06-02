# ADR-001: Seleccion de SendGrid como proveedor de notificaciones por email

## Fecha
2026-06-02

## Estado
Aceptado

## Contexto
El sistema Hiraoka Services requiere enviar notificaciones automaticas por email
al cliente cada vez que el estado de su ticket cambia (FEAT03, FEAT04). Se necesita
un proveedor de email transaccional que cumpla los siguientes criterios:

- Gratuito o de bajo costo para el volumen del proyecto universitario
- Facil integracion con Node.js
- Confiable para entrega de emails
- Accesible para estudiantes sin tarjeta de credito obligatoria

## Opciones evaluadas

### 1. SendGrid
- Plan gratuito: 100 emails/dia, sin vencimiento
- Libreria oficial para Node.js (@sendgrid/mail)
- Disponible en el GitHub Student Pack con creditos adicionales
- Dashboard con metricas de entrega, rebotes y aperturas
- Verificacion de remitente simple via email

### 2. Nodemailer con SMTP de Gmail
- Completamente gratuito usando cuenta Gmail
- Sin limite de emails diarios estricto
- No requiere registro en servicio externo
- Pero: Google bloquea SMTP desde apps no verificadas desde 2023
- Pero: No apto para produccion — Gmail no es email transaccional

### 3. AWS SES (Simple Email Service)
- Muy bajo costo en produccion ($0.10 por 1000 emails)
- Alta reputacion de entrega
- Pero: Requiere tarjeta de credito para activar
- Pero: Proceso de salida del sandbox complejo para nuevos proyectos
- Pero: Curva de aprendizaje alta para el tiempo disponible

## Decision
Se elige **SendGrid** como proveedor de email transaccional para el Sprint 5.

## Justificacion
SendGrid es la opcion mas equilibrada para un proyecto universitario: es gratuito
dentro del volumen necesario, tiene una libreria Node.js oficial que simplifica
la integracion, y esta disponible en el GitHub Student Pack que el equipo ya
utiliza. Nodemailer con Gmail fue descartado por las restricciones de Google
para apps no verificadas. AWS SES fue descartado por requerir tarjeta de credito
y un proceso de activacion que consumiria tiempo del sprint.

## Consecuencias
- El equipo debe crear una cuenta en sendgrid.com con el correo universitario UPCH
- La API Key se almacena en la variable de entorno SENDGRID_API_KEY (nunca en codigo)
- El notification-service implementa el patron Strategy en src/providers/ para que
  en el Sprint 6 se pueda agregar Twilio para WhatsApp sin cambiar la logica central
- En produccion, el dominio hiraokaservices.lat debe verificarse en SendGrid para
  mejorar la reputacion de entrega y evitar que los emails lleguen a spam

## Decision futura
WhatsApp via Twilio se implementara en el Momento 6 (Integracion API). La estructura
de providers/ del notification-service ya esta preparada para agregar whatsappProvider.js
sin modificar el controller ni las rutas existentes.