# Guía de activación de SendGrid en producción

## 1. Autenticar el dominio

1. Ingresar a SendGrid y abrir **Settings > Sender Authentication**.
2. En **Domain Authentication**, seleccionar **Authenticate Your Domain**.
3. Elegir el proveedor DNS y registrar el dominio `hiraokaservices.lat`.
4. Copiar en el proveedor DNS los registros CNAME entregados por SendGrid, sin modificar nombres ni destinos.
5. Si se usa Cloudflare, dejar esos CNAME en modo **DNS only**, sin proxy.
6. Esperar la propagación, volver a SendGrid y pulsar **Verify**.

El proceso termina correctamente cuando SendGrid muestra el dominio como verificado. No se debe usar una dirección `@hiraokaservices.lat` antes de completar esta verificación.

## 2. Crear una API Key restringida

1. Abrir **Settings > API Keys**.
2. Crear una clave nueva con permisos restringidos.
3. Habilitar únicamente **Mail Send**.
4. Copiar la clave una sola vez y almacenarla en el gestor de secretos del servidor.

La API Key nunca debe guardarse en Git, Dockerfile, código fuente ni capturas.

## 3. Configurar el servidor

Definir estas variables en el `.env` real del host:

```dotenv
SENDGRID_API_KEY=SG.valor_secreto
SENDGRID_FROM_EMAIL=notificaciones@hiraokaservices.lat
PORTAL_URL=https://hiraokaservices.lat
NOTIFICATION_INTERNAL_TOKEN=valor_aleatorio_de_32_o_mas_caracteres
```

Después reconstruir únicamente los servicios involucrados:

```powershell
docker compose up -d --build notification-service ticket-service
```

Para desplegar todo el stack con HTTPS y certificados ya instalados:

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 4. Ejecutar la prueba de extremo a extremo

1. Iniciar sesión como Agente.
2. Seleccionar un ticket en estado `Listo`.
3. Registrar el medio de pago y confirmar la entrega.
4. Verificar que el ticket cambie automáticamente a `Entregado`.
5. Confirmar que el destinatario reciba el correo y el comprobante PDF adjunto.
6. Revisar SPAM y validar que el remitente sea `notificaciones@hiraokaservices.lat`.
7. Revisar logs:

```powershell
docker compose logs --since=10m notification-service ticket-service
```

La ruta interna de notificaciones exige `X-Internal-Token`; no debe exponerse ni probarse públicamente sin ese encabezado.

## 5. Criterios de aceptación

- El dominio figura verificado en SendGrid.
- El mensaje no muestra advertencias de suplantación.
- El correo llega con el PDF legible.
- El cambio de estado no se revierte si SendGrid falla.
- El fallo de correo queda registrado en auditoría y logs.
- `.env` y la API Key no aparecen en el commit.
