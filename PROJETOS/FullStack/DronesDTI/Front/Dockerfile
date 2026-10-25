# ==========================================================================
# ETAPA 1 - BUILD: gera os arquivos estáticos (dist/)
# ==========================================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# O endereço da API entra no build (o Vite troca import.meta.env.VITE_API_URL pelo valor)
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ==========================================================================
# ETAPA 2 - SERVIDOR: nginx servindo o dist/
# ==========================================================================
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
