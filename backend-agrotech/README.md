# Backend Agrotech

Backend desarrollado en **NestJS v11** con **TypeORM** y **PostgreSQL** para la gestión integral de la plataforma Agrotech.

## Requisitos

- **Node.js**: v18+
- **PostgreSQL**: 14+
- **Redis**: v6 o superior (opcional, para caché y sockets)

## Configuración de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# JWT
JWT_SECRET=mi_super_clave_secreta_muy_segura
JWT_EXPIRES_IN=3600s
JWT_EXPIRATION=3600s

# CORREO
EMAIL_USER=agrotechsena2025@gmail.com
EMAIL_PASSWORD=pqkm mruj rocz lphf
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# BASE DE DATOS
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=agrotech
DB_PASSWORD=123
DB_NAME=agrotech

# REDIS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1

# ENTORNO
NODE_ENV=development

# ADMIN
ADMIN_EMAIL=agrotechsena2025@gmail.com
ADMIN_PASSWORD=Agrotech2025
```

## Instalación y Ejecución

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Levantar Base de Datos (Docker - Opcional)**:
    Si tienes un `docker-compose.yml`:
    ```bash
    docker-compose up -d db redis
    ```

3.  **Ejecutar Migraciones**:
    ```bash
    npm run migration:run
    ```

4.  **Cargar Semillas (Datos Iniciales)**:
    ```bash
    npm run seed
    ```

5.  **Iniciar Servidor (Desarrollo)**:
    ```bash
    npm run start:dev
    ```
    El servidor correrá en `http://localhost:4000` (o el puerto configurado).

## Comandos de Base de Datos

-   **Generar Migración**: `npm run migration:generate -- -n NombreCambio`
-   **Ejecutar Migraciones**: `npm run migration:run`
-   **Revertir Migración**: `npm run migration:revert`
-   **Sincronizar Schema (Dev)**: `npm run schema:sync`


