#!/bin/sh

echo "Iniciando aplicación PokéDex..."

# NO EJECUTAR EN BUILD, YA QUE NO HAY CONEXION CON BD
pnpm prisma generate
pnpm prisma db push

# Ejecutar scraper inicial
echo "Ejecutando scraper inicial..."
pnpm scrape

# Configurar cron 
echo "Configurando scraper diario... Expresión cron: $SCRAPER_CRON"
echo "$SCRAPER_CRON cd /app && pnpm scrape >> /var/log/scraper.log 2>&1" | crontab -

pnpm build
# Iniciar cron en background
crond -f -d 8 &

# Iniciar aplicación
echo "Iniciando servidor Next.js..."
pnpm start
