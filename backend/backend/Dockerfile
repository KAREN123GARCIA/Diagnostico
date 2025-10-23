# Usa la versión de Node.js v20.19.5 que instalaste
FROM node:20.19.5-alpine 

# Crea el directorio de la aplicación
WORKDIR /app

# Copia e instala dependencias primero para aprovechar el caché de Docker
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código de Strapi
COPY . .

# Expone el puerto de Strapi
EXPOSE 1337

# Inicia Strapi en modo producción
CMD ["npm", "start"]