---
title: Guía de Despliegue
description: Cómo desplegar y configurar Agrotech en tu propio servidor.
---

## Requisitos Previos

-   Node.js v18+
-   PostgreSQL 14+
-   Broker MQTT (ej. Mosquitto) para IoT.

## Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/KEVINALEXIS1079/proyecto_formativo.git
    ```

2.  **Configurar Backend**:
    -   Navegar a `backend-agrotech`.
    -   Copiar `.env.example` a `.env` y configurar base de datos.
    -   Ejecutar `npm install` y `npm run start:dev`.

3.  **Configurar Frontend Web**:
    -   Navegar a `agrotech-web`.
    -   Ejecutar `npm install` y `npm run dev`.

4.  **Configurar IoT**:
    -   Flashear los dispositivos ESP32 con el código en `archivos-extras/configuracion-IoT`.

## Producción

Para producción, recomendamos usar Docker. Consulta el archivo `docker-compose.yml` en la raíz del proyecto (si está disponible) o construye las imágenes manualmente.
