# Hiraoka Services Portal PLM

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![SendGrid](https://img.shields.io/badge/SendGrid-Email-00B2FF?style=for-the-badge&logo=sendgrid&logoColor=white)

Portal web de autogestión post-venta para Importaciones Hiraoka S.A.C.

[Jira](https://victor-rivera.atlassian.net/jira/software/projects/HSPP/boards/34) · [Documentación](#documentación-adicional)

---

## Descripción

Hiraoka Services es un sistema de gestión post-venta que permite a los clientes de Importaciones Hiraoka consultar el estado de sus equipos en reparación, recibir notificaciones automáticas por email, y al equipo técnico gestionar tickets de servicio con control de roles y auditoría inalterable.

Desarrollado como proyecto universitario en la Universidad Peruana Cayetano Heredia — Ingeniería de Software 2026-I.

---

## Funcionalidades (FEAT01 – FEAT15)

| FEAT | Funcionalidad | Estado |
|------|--------------|--------|
| FEAT01 | Consulta de estado del ticket (portal del cliente) | Listo |
| FEAT02 | Visualización del detalle técnico del equipo | Listo |
| FEAT03 | Notificaciones automáticas por email (SendGrid) | En progreso |
| FEAT04 | Notificaciones automáticas por WhatsApp/SMS | Pendiente |
| FEAT05 | Registro de entrada y diagnóstico inicial | Pendiente |
| FEAT06 | Actualización de estado por técnico (PWA offline) | En progreso |
| FEAT07 | Historial de vida del producto por número de serie | Pendiente |
| FEAT08 | Control de acceso granular por roles (RBAC) | En progreso |
| FEAT09 | Autenticación JWT con log de auditoría inalterable | Listo |
| FEAT10 | Consulta de disponibilidad de repuestos (inventario) | Listo |
| FEAT11 | Gestión de asignación de repuestos al ticket | Listo |
| FEAT12 | Verificación de cobertura de garantía | Listo |
| FEAT13 | Gestión de flujo de estados del ticket | Listo |
| FEAT14 | Dashboard gerencial con métricas KPI | Pendiente |
| FEAT15 | Encuesta de satisfacción NPS post-servicio | Pendiente |

---

## Arquitectura

```
                        Internet
                           |
                      +---------+
                      |  Nginx  |  :80 / :443
                      |  Proxy  |
                      +----+----+
                           |
                      +----+-----+
                      |   API    |  :3000
                      | Gateway  |  JWT · Rate Limiting · CSP · Helmet
                      +--+--+--+-+--+--+
                         |  |  |  |  |  |
            +------------+  |  |  |  |  +------------+
       +----+-----+    +----+--+-+ | +--+----------+ +----+------+
       |  auth-   |    | ticket-  | | |notification| |  legacy-  |
       | service  |    | service  | | |  service   | |  service  |
       |  :3001   |    |  :3002   | | |   :3004    | |   :3005   |
       +----------+    +----------+ | +------------+ +-----------+
                                    |
                              +-----+------+
                              |  taller-   |
                              |  service   |
                              |   :3003    |
                              +-----+------+
                                    |
                              +-----+------+
                              | PostgreSQL |
                              |   :5432    |
                              +------------+
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML · CSS · JavaScript (Portal público) |
| API Gateway | Node.js · Express · Helmet · CSP · Rate Limiting |
| Microservicios | Node.js · Express · pg |
| Base de datos | PostgreSQL 16 |
| Email | SendGrid (@sendgrid/mail) |
| Proxy | Nginx Alpine |
| Contenedores | Docker · Docker Compose |
| Autenticación | JWT (30 min) · bcrypt |

---

## Microservicios

| Servicio | Puerto | Descripción |
|---------|--------|-------------|
| api-gateway | 3000 | Punto de entrada único — JWT, rate limiting, CSP |
| auth-service | 3001 | Autenticación y registro de usuarios |
| ticket-service | 3002 | Gestión de tickets y portal público |
| taller-service | 3003 | Panel PWA para técnicos de taller |
| notification-service | 3004 | Notificaciones por email via SendGrid |
| legacy-service | 3005 | Mock de APIs legadas de Hiraoka (inventario, garantías) |
| postgres | 5432 | Base de datos principal |

---

## Inicio rápido

### Requisitos

- Docker Desktop instalado y corriendo
- Git
- Node.js v20 LTS (para desarrollo local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/VictorRiveraT/Hiraoka-Services-Portal-PLM.git
cd Hiraoka-Services-Portal-PLM
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con las credenciales del equipo:

```env
DB_NAME=hiraoka_services
DB_USER=hiraoka_user
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secreto_minimo_32_caracteres
NODE_ENV=development
SENDGRID_API_KEY=tu_api_key_de_sendgrid
SENDGRID_FROM_EMAIL=noreply@hiraokaservices.lat
```

### 3. Levantar el sistema

```bash
docker compose up --build
```

### 4. Verificar

```bash
# Health check del gateway
curl http://localhost/health

# Portal público del cliente
open http://localhost

# Probar consulta de ticket
curl http://localhost/api/tickets/dni/74521836
```

> Nota: En desarrollo local Nginx corre sin SSL. Para producción usar Certbot con el dominio hiraokaservices.lat.

---

## Estructura del proyecto

```
Hiraoka-Services-Portal-PLM/
├── services/
│   ├── api-gateway/            # Punto de entrada único
│   ├── auth-service/           # Autenticación JWT
│   │   └── src/db/
│   │       ├── init.sql        # Tablas base
│   │       ├── audit.sql       # Log de auditoría inalterable
│   │       └── seed.sql        # Datos de prueba
│   ├── ticket-service/         # Gestión de tickets (FEAT01, FEAT13)
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── middleware/
│   │       │   ├── validateDni.js
│   │       │   └── verifyToken.js
│   │       └── public/
│   │           └── index.html  # Portal del cliente
│   ├── taller-service/         # Panel técnico (FEAT06)
│   ├── notification-service/   # Notificaciones SendGrid (FEAT03)
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       └── providers/
│   │           └── emailProvider.js
│   └── legacy-service/         # Mock APIs Hiraoka (FEAT10-12)
│       └── src/
│           ├── controllers/
│           └── routes/
├── nginx/
│   └── nginx.conf
├── docs/
│   ├── GOBIERNO_DE_DATOS.md
│   └── ADR-001-proveedor-notificaciones.md
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Endpoints disponibles

### Auth Service (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/register` | Registrar usuario | No |
| GET | `/api/auth/verify` | Verificar token | Si |

### Ticket Service (`/api/tickets`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/tickets/:id` | Consultar ticket por ID | No |
| GET | `/api/tickets/dni/:dni` | Consultar tickets por DNI | No |
| POST | `/api/tickets/consulta` | Consulta segura DNI + ticket | No |
| GET | `/api/tickets/tecnico/mis-tickets` | Tickets asignados al técnico | Si |
| PUT | `/api/tickets/:id/estado` | Actualizar estado del ticket | Si |
| POST | `/api/tickets/:id/asignar` | Asignar técnico al ticket | Si |
| GET | `/api/tickets/:id/repuestos` | Consultar repuestos compatibles/asignados y disponibilidad | No |
| POST | `/api/tickets/:id/repuestos` | Asignar repuestos al ticket y descontar stock legacy | Si (Tecnico/Agente) |
| GET | `/api/tickets/:id/garantia` | Verificar cobertura de garantía del producto | No |

### Notification Service (`/api/notifications`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/notifications/send` | Enviar notificación por email | No |

Tipos disponibles: `ticket_recibido`, `en_diagnostico`, `en_reparacion`, `listo_retiro`, `entregado`.

### Legacy Service (`/api/legacy`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/legacy/inventory/:codigo` | Consultar stock de repuesto | No |
| GET | `/api/legacy/warranty/:numero_serie` | Verificar garantía por número de serie | No |
| GET | `/api/legacy/spare-parts/:id_ticket` | Repuestos asignados al ticket | Si |
| POST | `/api/legacy/spare-parts/:id_ticket` | Asignar repuesto al ticket | Si |

---

## Datos de prueba

El seed se carga automáticamente al levantar el proyecto por primera vez:

| Dato | Cantidad |
|------|---------|
| Clientes | 3 |
| Técnicos | 1 |
| Productos | 5 |
| Tickets | 8 (en distintos estados) |

DNI de prueba: `74521836` (Ana Torres Ríos — 3 tickets)

---

## Seguridad

- JWT con expiración de 30 minutos
- Contraseñas con hash bcrypt
- Rate limiting: 200 req / 15 min por IP
- Log de auditoría inalterable (REVOKE DELETE/UPDATE en PostgreSQL)
- CORS restringido por variable de entorno (no wildcard)
- Headers de seguridad con Helmet (CSP configurado, X-Powered-By desactivado)
- Cumplimiento Ley N 29733 — Protección de Datos Personales del Perú

---

## Documentación adicional

- `docs/GOBIERNO_DE_DATOS.md` — Protocolo de datos personales (Ley 29733)
- `docs/ADR-001-proveedor-notificaciones.md` — Decisión de SendGrid vs alternativas evaluadas

---

## Git Flow

```
main            # Código en producción
develop         # Integración de features
feature/*       # Desarrollo de funcionalidades por FEAT
```

Ramas activas:

- `feature/FEAT03-notificaciones`
- `feature/FEAT06-panel-tecnico`
- `feature/FEAT10-integracion-api`

---

## Equipo

| Integrante | Rol | GitHub |
|-----------|-----|--------|
| Victor Daniel Rivera Torres | Scrum Master / Desarrollador | [@VictorRiveraT](https://github.com/VictorRiveraT) |
| Vanesa Doris Rioja Cruz | Disenadora / Arquitecta | [@vanesarioja29](https://github.com/vanesarioja29) |
| Jander Huamani Salazar | Analista | [@Jander03](https://github.com/Jander03) |
| Jesus Anselmo Morales Alvarado | Desarrollador Backend | [@jessusmorales](https://github.com/jessusmorales) |
| Frank Kevin Jauregui Bendezu | Tester / QA | [@FRANKEVIN25](https://github.com/FRANKEVIN25) |

---

## Gestión del proyecto

- Tablero Jira: [HSPP Board](https://victor-rivera.atlassian.net/jira/software/projects/HSPP/boards/34)
- Metodología: Scrum (sprints de 1 semana)
- Docente: Prof. Juan Manuel Hapalla García
- Universidad: Universidad Peruana Cayetano Heredia — 2026-I
- Dominio: hiraokaservices.lat (próximamente)

---

Desarrollado por el equipo Hiraoka Services — UPCH 2026-I
