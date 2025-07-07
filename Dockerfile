FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm && apk add --no-cache curl

# Copiar package files
COPY package.json pnpm-lock.yaml ./

COPY . .

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]
