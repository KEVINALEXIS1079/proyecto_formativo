---
title: Introducción
description: Guía de inicio rápido para el ecosistema Agrotech
---

# Introducción a Agrotech

Agrotech es una plataforma integral para la gestión agrícola que combina administración de cultivos, inventario, finanzas y monitoreo IoT en tiempo real.

## Componentes del Sistema

El ecosistema está compuesto por tres aplicaciones principales:

1.  **Backend (NestJS)**: API RESTful y Gateway WebSocket que centraliza la lógica de negocio y comunicación con dispositivos.
2.  **Web (React)**: Panel de administración completo para gestores y administradores.
3.  **Móvil (React Native)**: Aplicación para operarios de campo, permitiendo registro offline-first y monitoreo in-situ.

## Requisitos Previos

Para ejecutar el proyecto necesitas:

-   Node.js v22.x
-   MySQL 8.x
-   Broker MQTT (Mosquitto o similar) para IoT
-   NPM v10.x

## Instalación Rápida

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/KEVINALEXIS1079/proyecto_formativo.git
    ```

2.  Configura las variables de entorno.
    
    **Backend (`backend-agrotech/.env`):**
    ```env
    # Copia estos valores reales para desarrollo
    PORT=4000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=agrotech
    DB_PASSWORD=123
    DB_NAME=agrotech
    
    JWT_SECRET=mi_super_clave_secreta_muy_segura
    EMAIL_USER=agrotechsena2025@gmail.com
    EMAIL_PASSWORD=pqkm mruj rocz lphf
    ADMIN_EMAIL=agrotechsena2025@gmail.com
    ADMIN_PASSWORD=Agrotech2025
    ```

3.  Inicia los servicios:
    ```bash
    # Backend
    cd backend-agrotech && npm install && npm run start:dev

    # Web
    cd agrotech-web && npm install && npm run dev
    ```

## Credenciales de Acceso

Para ingresar al sistema como administrador:
- **Usuario**: `agrotechsena2025@gmail.com`
- **Contraseña**: `Agrotech2025`

## Suguientes Pasos

-   Revisa la [Guía de Despliegue](/guides/deployment) para puesta en producción.
-   Explora la [Documentación de API](/api/auth) para integración.
