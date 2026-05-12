# Hiraoka Services Portal PLM

Sistema de gestion post-venta para Importaciones Hiraoka S.A.C.
Desarrollado por el equipo de la Oficina de Proyectos de Informatica - UPCH 2026.

## Requisitos
- Docker Desktop instalado y corriendo
- Git

## Como levantar el proyecto

1. Clona el repositorio
   git clone https://github.com/VictorRiveraT/Hiraoka-Services-Portal-PLM.git

2. Copia el archivo de variables de entorno
   cp .env.example .env

3. Edita .env con las credenciales reales

4. Levanta los contenedores
   docker compose up --build

5. El sistema estara disponible en http://localhost

## Estructura del proyecto

services/auth-service    -> Autenticacion JWT (Node.js)
services/api-gateway     -> Punto de entrada unico
nginx/                   -> Proxy reverso HTTPS
docs/                    -> Documentacion del proyecto

## Equipo

- Victor Rivera Torres   - Lider Scrum
- Jander Huamani Salazar - Analista
- Vanesa Rioja Cruz      - Disenador
- Jesus Morales Alvarado - Desarrollador
- Frank Jauregui Bendezu - Tester
