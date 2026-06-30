# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente del proyecto
COPY . .

# Construir la aplicación para producción (esto generará la carpeta 'dist')
RUN npm run build

# Etapa 2: Servidor Web (Nginx) para servir los archivos estáticos
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos de la etapa anterior al directorio que Nginx expone
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
