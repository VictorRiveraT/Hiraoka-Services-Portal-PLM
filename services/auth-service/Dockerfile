FROM node:20-alpine

WORKDIR /app

# Copiar dependencias primero (capa de caché Docker)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/index.js"]