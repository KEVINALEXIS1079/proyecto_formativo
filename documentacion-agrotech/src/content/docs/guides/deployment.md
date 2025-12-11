---
title: Despliegue
description: Guía de configuración y despliegue para producción
---

# Guía de Despliegue

Instrucciones para desplegar Agrotech en un entorno de producción (VPS, AWS, DigitalOcean).

## Backend (Docker)

El backend está contenerizado para facilitar su despliegue.

1.  **Construir imagen**:
    ```bash
    docker build -t agrotech-backend ./backend-agrotech
    ```

2.  **Ejecutar contenedor**:
    ```bash
    docker run -d -p 4000:4000 --env-file .env agrotech-backend
    ```

### Variables de Entorno (.env)

Asegúrate de configurar:
-   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
-   `JWT_SECRET`
-   `MQTT_BROKER_URL`

## Web App (Vercel / Netlify / Nginx)

La aplicación web es estática (SPA).

1.  **Build**:
    ```bash
    npm run build
    ```

2.  **Servir**:
    Sube la carpeta `dist` a tu hosting preferido o sírvela con Nginx:

    ```nginx
    server {
        listen 80;
        server_name agrotech.tudominio.com;
        root /var/www/agrotech/dist;
        index index.html;
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

## Móvil (APK/IPA)

Para generar los ejecutables móviles:

```bash
cd agrotech-movil
npm install -g eas-cli
eas build --platform android --profile production
```
