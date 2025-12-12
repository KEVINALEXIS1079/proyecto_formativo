# Proyecto Formativo Agrotech 2025

Sistema integral de gestión agrícola basado en IoT, desarrollado para optimizar la producción, monitorear cultivos en tiempo real y administrar recursos eficientemente.

## Módulos del Sistema

El proyecto está dividido en varios micro-componentes:

| Módulo | Ruta | Tecnologías | Descripción |
| :--- | :--- | :--- | :--- |
| **Backend** | `./backend-agrotech` | NestJS 11, TypeORM, PostgreSQL | API RESTful, Websockets, Lógica de negocio. |
| **Web** | `./agrotech-web` | React 19, Vite, Tailwind 4 | Panel de administración web para escritorio/tablet. |
| **Móvil** | `./agrotech-movil` | React Native | Aplicación móvil para trabajo en campo. |
| **Documentación** | `./documentacion-agrotech` | Astro Starlight | Guías de usuario y Referencia de API. |
| **IoT** | `./archivos-extras` | C++, ESP32 | Código para sensores y dispositivos de campo. |

## Requisitos Globales

-   **Node.js**: v22.12.0
-   **NPM**: v10.2.0    
-   **PostgreSQL**: v16.1
-   **Docker** (Recomendado para Base de Datos)
-   **Git**

## Inicio Rápido

1.  **Clonar Repositorio**:
    ```bash
    git clone https://github.com/KEVINALEXIS1079/proyecto_formativo.git
    cd proyecto_formativo
    ```

2.  **Configurar Backend**:
    Entra a `backend-agrotech` y sigue su [README](./backend-agrotech/README.md) para configurar el `.env` y levantar la BD.

3.  **Iniciar Web**:
    Entra a `agrotech-web` e inicia el servidor con `npm run dev`.

4.  **Ver Documentación**:
    Entra a `documentacion-agrotech` e inicia con `npm run dev` para ver las guías completas en `http://localhost:4321`.

## Credenciales por Defecto (Desarrollo)

-   **Admin Email**: `agrotechsena2025@gmail.com`
-   **Password**: `Agrotech2025`

## Licencia

Propiedad del SENA / Proyecto Formativo 2025.
