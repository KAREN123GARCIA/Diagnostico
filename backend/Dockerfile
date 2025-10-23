# Usa la versión de Node.js v20.19.5
FROM node:20.19.5-alpine 

# 1. Crea el directorio de la aplicación
WORKDIR /app

# 2. **CAMBIO CRÍTICO:** Copia ABSOLUTAMENTE TODO primero. 
# Esto asegura que package.json y todos los archivos estén en /app ANTES de la instalación.
COPY . .

# 3. Instala dependencias dentro del directorio de trabajo (/app)
# Ahora npm puede encontrar el package.json
RUN npm install 

# Expone el puerto por defecto de Strapi
EXPOSE 1337

# Inicia Strapi en modo producción
CMD ["npm", "start"]