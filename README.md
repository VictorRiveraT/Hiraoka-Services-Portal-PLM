# Hiraoka Services Portal PLM

![Hiraoka Services](https://img.shields.io/badge/Hiraoka-Services-CC0000?style=for-the-badge&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Portal web de autogestión post-venta para Importaciones Hiraoka S.A.C.

[Jira](https://victor-rivera.atlassian.net/jira/software/projects/HSPP/boards/34) · [Documentación](#documentación)

---

## Descripción

Hiraoka Services es un sistema de gestión post-venta que permite a los clientes de Importaciones Hiraoka consultar el estado de sus equipos en reparación, recibir notificaciones automáticas y al equipo técnico gestionar tickets de servicio desde una PWA en tablets.

Desarrollado como proyecto universitario en la Universidad Peruana Cayetano Heredia — Ingeniería de Software 2026-I.

---

## Funcionalidades (FEAT01 – FEAT15)

| FEAT | Funcionalidad | Estado |
|------|--------------|--------|
| FEAT01 | Consulta de estado del ticket (portal del cliente) | Listo |
| FEAT02 | Visualización del detalle técnico del equipo | En progreso |
| FEAT03 | Notificaciones automáticas por SMS/WhatsApp | Pendiente |
| FEAT04 | Notificaciones automáticas por correo electrónico | Pendiente |
| FEAT05 | Registro de entrada y diagnóstico inicial | Pendiente |
| FEAT06 | Actualización de estado por técnico (PWA offline) | En progreso |
| FEAT07 | Historial de vida del producto por número de serie | Pendiente |
| FEAT08 | Control de acceso granular por roles (RBAC) | Pendiente |
| FEAT09 | Autenticación JWT con log de auditoría inalterable | Listo |
| FEAT10 | Consulta de disponibilidad de repuestos | Pendiente |
| FEAT11 | Gestión de asignación de repuestos al ticket | Pendiente |
| FEAT12 | Verificación de cobertura de garantía | Pendiente |
| FEAT13 | Gestión de flujo de estados del ticket | En progreso |
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
                      +----+----+
                      |   API   |  :3000
                      | Gateway |  JWT · Rate Limiting
                      +--+---+--+
                         |   |
              +----------+   +----------+
         +----+-----+            +------+------+
         |  auth-   |  :3001     |   ticket-   |  :3002
         | service  |            |   service   |
         +----+-----+            +------+------+
              |                         |
              +-----------+-------------+
                     +----+-----+
                     |PostgreSQL|  :5432
                     +----------+
```

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML · CSS · JavaScript (Portal público) · React.js + PWA (Panel técnico) |
| API Gateway | Node.js · Express · http-proxy-middleware · helmet · express-rate-limit |
| Microservicios | Node.js · Express · pg |
| Base de datos | PostgreSQL 16 |
| Proxy | Nginx Alpine |
| Contenedores | Docker · Docker Compose |
| Autenticación | JWT (30 min) · bcrypt |

---

## Inicio rápido

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- [Git](https://git-scm.com/)
- [Node.js v20 LTS](https://nodejs.org/) para desarrollo local

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
DB_USER=hiraoka_admin
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secreto_minimo_32_caracteres
NODE_ENV=development
```

### 3. Levantar el sistema

```bash
docker compose up --build
```

### 4. Verificar

```bash
# Health check del gateway
curl http://localhost/health

# Portal público
open http://localhost
```

> Nota: En desarrollo local, Nginx corre sin certificados SSL. Para producción usar Certbot con el dominio `hiraokaservices.lat`.

---

## Estructura del proyecto

```
Hiraoka-Services-Portal-PLM/
├── services/
│   ├── api-gateway/          # Punto de entrada único
│   │   └── src/index.js      # Proxies, JWT, rate limiting
│   ├── auth-service/         # Autenticacion
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── db/
│   │           ├── init.sql  # Tablas base
│   │           └── audit.sql # Log de auditoria
│   └── ticket-service/       # Gestion de tickets (FEAT01)
│       └── src/
│           ├── controllers/
│           ├── routes/
│           ├── middleware/
│           │   └── validateDni.js
│           ├── config/
│           │   └── database.js
│           ├── public/
│           │   └── index.html # Portal del cliente
│           └── index.js
├── nginx/
│   └── nginx.conf
├── docs/
│   └── GOBIERNO_DE_DATOS.md  # Cumplimiento Ley 29733
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Endpoints disponibles

### Auth Service (`/api/auth`)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesion | No |
| POST | `/api/auth/register` | Registrar usuario | No |
| GET | `/api/auth/verify` | Verificar token | Si |

### Ticket Service (`/api/tickets`)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/api/tickets/:id` | Consultar ticket por ID | No |
| GET | `/api/tickets/dni/:dni` | Consultar tickets por DNI | No |
| POST | `/api/tickets/consulta` | Consulta segura DNI + ticket | No |

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

## Gestion del proyecto

- Tablero Jira: [HSPP Board](https://victor-rivera.atlassian.net/jira/software/projects/HSPP/boards/34)
- Metodologia: Scrum (sprints de 1 semana)
- Docente: Prof. Juan Manuel Hapalla Garcia
- Universidad: Universidad Peruana Cayetano Heredia — 2026-I

---

## Seguridad

- JWT con expiracion de 30 minutos
- Contrasenas con hash bcrypt
- Rate limiting: 200 req / 15 min por IP
- Log de auditoria inalterable (sin DELETE/UPDATE permitidos)
- Cumplimiento Ley N 29733 — Proteccion de Datos Personales del Peru
- Headers de seguridad con Helmet

---

## Documentacion adicional

- [`docs/GOBIERNO_DE_DATOS.md`](docs/GOBIERNO_DE_DATOS.md) — Protocolo de datos personales
- Documento de Vision — Requerimientos del sistema
- Documento de Arquitectura (DAS) — Decisiones tecnicas
- Documento de Planificacion — Sprints y roles

---

## Produccion

- Dominio: hiraokaservices.lat (proximamente)
- SSL: Let's Encrypt / Certbot
- Hosting: VPS con Docker Compose

---

Desarrollado por el equipo Hiraoka Services — UPCH 2026-I
