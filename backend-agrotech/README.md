# 🔧 Backend AgroTech - API REST

## 📋 Descripción

API REST desarrollada con NestJS que proporciona todos los servicios backend para el sistema AgroTech. Incluye gestión de cultivos, monitoreo IoT, reportes, autenticación y más.

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11.0.1
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: PostgreSQL 15+ con PostGIS 3.x
- **ORM**: TypeORM 0.3.27
- **Autenticación**: JWT (passport-jwt 4.0.1) + Bcrypt 6.0.0
- **Validación**: Class Validator 0.14.2 + Class Transformer 0.5.1
- **Documentación**: Swagger/OpenAPI (swagger-ui-express 5.0.1)
- **WebSockets**: Socket.IO 4.8.1
- **Testing**: Jest
- **Puerto**: 4000

## 📦 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 22.x
- **npm** 10.x
- **PostgreSQL** 15.x
- **PostGIS** 3.x (extensión de PostgreSQL)
- **Git**
- **Docker** (opcional, para desarrollo con contenedores)
- **Docker Compose** (opcional, para desarrollo con contenedores)

### Verificar versiones

```bash
node --version  # Debe ser v22.x
npm --version   # Debe ser 10.x
psql --version  # Debe ser 15.x
docker --version  # (opcional)
docker-compose --version  # (opcional)
```

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd proyecto_formativo/backend-agrotech
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

#### Opción A: PostgreSQL Local

##### Crear base de datos

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE agrotech_db;

-- Conectarse a la base de datos
\c agrotech_db

-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar instalación
SELECT PostGIS_version();

-- Salir de psql
\q
```

##### Crear usuario (opcional pero recomendado)

```sql
-- Conectarse como postgres
psql -U postgres

-- Crear usuario
CREATE USER agrotech_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE agrotech_db TO agrotech_user;
GRANT ALL ON SCHEMA public TO agrotech_user;

-- Salir
\q
```

#### Opción B: PostgreSQL con Docker

Si prefieres usar Docker, puedes crear un archivo `docker-compose.yml` en la raíz del proyecto:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.4
    container_name: agrotech-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: agrotech_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Luego ejecutar:

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d

# Verificar que esté corriendo
docker-compose ps

# Ver logs
docker-compose logs -f postgres

# Detener
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra todos los datos)
docker-compose down -v
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Copiar plantilla (si existe)
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Aplicación
NODE_ENV=development
PORT=4000
API_PREFIX=api

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=agrotech_db
DB_SYNCHRONIZE=false  # IMPORTANTE: false en producción
DB_LOGGING=true       # Solo en desarrollo

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui_minimo_32_caracteres
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=tu_secreto_refresh_jwt_muy_seguro_aqui_minimo_32_caracteres
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app

# IoT WebSocket (opcional)
IOT_WEBSOCKET_PORT=4001
```

#### Ejemplo de configuración real para desarrollo

Si quieres usar la configuración exacta del proyecto, copia este `.env` completo:

```env
# Aplicación
NODE_ENV=development
PORT=4000
API_PREFIX=api

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
DB_SYNCHRONIZE=false
DB_LOGGING=true

JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (opcional - configurar si necesitas envío de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=agrotechsena2025@gmail.com
SMTP_PASS=tu_password_app_aqui

# IoT WebSocket (opcional)
IOT_WEBSOCKET_PORT=4001
```

### 5. Comandos completos para iniciar el proyecto

**Ejecuta estos comandos en orden para tener el proyecto funcionando:**

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar migraciones (crea las tablas en la base de datos)
npm run migration:run

# 3. Ejecutar seeds (inserta datos iniciales: usuarios, roles, permisos, cultivos de ejemplo)
npm run seed

# 4. Iniciar servidor en modo desarrollo
npm run start:dev
```

**Nota**: El seed creará un usuario administrador con las credenciales:
- Email: `agrotechsena2025@gmail.com`
- Password: `Agrotech2025`

**Verificar que todo funciona:**

```bash
# El servidor debe estar corriendo en http://localhost:4000
# Abrir en el navegador:
# - API: http://localhost:4000
# - Documentación Swagger: http://localhost:4000/api
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
# Iniciar servidor en modo watch (recarga automática)
npm run start:dev
```

El servidor estará disponible en: **http://localhost:4000**
Documentación API: **http://localhost:4000/api**

### Modo Producción

```bash
# Compilar proyecto
npm run build

# Iniciar servidor de producción
npm run start:prod
```

### Otros comandos útiles

```bash
# Modo debug (con inspector de Node.js)
npm run start:debug

# Solo compilar sin ejecutar
npm run build

# Linter (revisar código)
npm run lint

# Formatear código con Prettier
npm run format

# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:cov

# Tests E2E (end-to-end)
npm run test:e2e
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger está disponible en:

**http://localhost:4000/api**

Aquí encontrarás:
- Todos los endpoints disponibles
- Parámetros requeridos
- Ejemplos de request/response
- Posibilidad de probar endpoints directamente

## 🗂️ Estructura del Proyecto

```
backend-agrotech/
├── src/
│   ├── app/               # Configuración de la aplicación
│   ├── auth/              # Módulo de autenticación (JWT, login, register)
│   ├── common/            # Utilidades compartidas, guards, decorators
│   ├── config/            # Configuraciones (database, jwt, etc.)
│   ├── database/          # Configuración DB, migraciones y seeds
│   │   ├── config/        # Data source para TypeORM
│   │   ├── migrations/    # Migraciones de base de datos
│   │   └── seeds/         # Seeds de datos iniciales
│   ├── modules/           # Módulos de la aplicación
│   │   ├── activities/    # Registro de actividades agrícolas
│   │   ├── auth/          # Autenticación y autorización
│   │   ├── cultivos/      # Gestión de cultivos y lotes
│   │   ├── finance/       # Gestión financiera
│   │   ├── geo/           # Servicios geoespaciales (PostGIS)
│   │   ├── inventory/     # Control de inventario e insumos
│   │   ├── iot/           # Sensores, lecturas y monitoreo IoT
│   │   ├── production/    # Gestión de producción y cosechas
│   │   ├── reports/       # Generación de reportes (PDF, Excel)
│   │   ├── users/         # Gestión de usuarios y roles
│   │   └── wiki/          # Documentación interna
│   └── main.ts            # Punto de entrada de la aplicación
├── test/                  # Tests E2E
├── uploads/               # Archivos subidos (imágenes, documentos)
├── .env                   # Variables de entorno (NO subir a git)
├── .env.example           # Plantilla de .env
├── nest-cli.json          # Configuración NestJS CLI
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
└── README.md              # Este archivo
```

## 🔑 Endpoints Principales

### Autenticación (`/api/auth`)

```http
POST   /api/auth/login          # Iniciar sesión
POST   /api/auth/register       # Registrar usuario
POST   /api/auth/refresh        # Refrescar token
GET    /api/auth/profile        # Obtener perfil (requiere token)
POST   /api/auth/logout         # Cerrar sesión
```

### Cultivos (`/api/cultivos`)

```http
GET    /api/cultivos            # Listar todos los cultivos
POST   /api/cultivos            # Crear nuevo cultivo
GET    /api/cultivos/:id        # Obtener cultivo por ID
PATCH  /api/cultivos/:id        # Actualizar cultivo
DELETE /api/cultivos/:id        # Eliminar cultivo
GET    /api/cultivos/:id/lotes  # Obtener lotes de un cultivo
```

### IoT (`/api/iot`)

```http
GET    /api/iot/sensors         # Listar sensores
POST   /api/iot/sensors         # Crear sensor
GET    /api/iot/readings        # Obtener lecturas
POST   /api/iot/readings        # Crear lectura manual
GET    /api/iot/alerts          # Listar alertas activas
GET    /api/iot/report          # Reporte IoT general
```

### Reportes (`/api/reports`)

```http
GET    /api/reports/crop/:id    # Reporte de cultivo específico
GET    /api/reports/complete    # Reporte completo con filtros
GET    /api/reports/financial   # Reporte financiero
GET    /api/reports/iot/:loteId # Reporte IoT de un lote
```

### Usuarios (`/api/users`)

```http
GET    /api/users               # Listar usuarios (admin)
POST   /api/users               # Crear usuario (admin)
GET    /api/users/:id           # Obtener usuario
PATCH  /api/users/:id           # Actualizar usuario
DELETE /api/users/:id           # Eliminar usuario (admin)
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Obtener token

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agrotechsena2025@gmail.com",
    "password": "Agrotech2025"
  }'
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "agrotechsena2025@gmail.com",
    "nombre": "Admin"
  }
}
```

### Usar token en requests

```bash
curl -X GET http://localhost:4000/api/cultivos \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

## 🗄️ Base de Datos

### Migraciones

Las migraciones permiten versionar los cambios en la estructura de la base de datos.

```bash
# Generar migración automáticamente (basada en cambios en entities)
npm run migration:generate -- src/database/migrations/NombreMigracion

# Crear migración vacía manualmente
npm run migration:create -- src/database/migrations/NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show

# Sincronizar schema (CUIDADO: solo desarrollo)
npm run schema:sync

# Eliminar todo el schema (CUIDADO: borra todo)
npm run schema:drop
```

**IMPORTANTE**: En producción, NUNCA usar `DB_SYNCHRONIZE=true`. Siempre usar migraciones.

### Seeds

Los seeds insertan datos iniciales en la base de datos.

```bash
# Ejecutar todos los seeds
npm run seed
```

El seed incluye:
- Roles y permisos del sistema
- Usuario administrador por defecto
- Módulos y funcionalidades
- Datos de ejemplo (cultivos, sensores, lecturas)

### Backup y Restauración

```bash
# Crear backup de la base de datos
pg_dump -U postgres -d agrotech_db -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).backup

# Restaurar desde backup
pg_restore -U postgres -d agrotech_db -v backup_20241209_120000.backup

# Backup en formato SQL
pg_dump -U postgres agrotech_db > backup.sql

# Restaurar desde SQL
psql -U postgres agrotech_db < backup.sql
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage (genera reporte en /coverage)
npm run test:cov

# Tests E2E (end-to-end)
npm run test:e2e

# Tests en modo watch (se ejecutan automáticamente al guardar)
npm run test:watch

# Tests en modo debug
npm run test:debug
```

## 🐛 Debugging

### VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "port": 9229
    }
  ]
}
```

Luego presiona F5 para iniciar debugging.

### Logs

```bash
# Ver logs en tiempo real y guardarlos
npm run start:dev 2>&1 | tee logs.txt
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:4000/api/health
```

### Información del servidor

```bash
curl http://localhost:4000/api
```

## 🚨 Solución de Problemas

### Error de conexión a PostgreSQL

```bash
# Windows - Verificar servicio
sc query postgresql-x64-15

# Windows - Iniciar servicio
net start postgresql-x64-15

# Linux - Verificar estado
sudo systemctl status postgresql

# Linux - Reiniciar
sudo systemctl restart postgresql

# macOS - Verificar
brew services list

# macOS - Reiniciar
brew services restart postgresql
```

### Error de PostGIS

```sql
-- Conectarse a la base de datos
psql -U postgres -d agrotech_db

-- Verificar extensión
SELECT * FROM pg_extension WHERE extname = 'postgis';

-- Reinstalar si es necesario
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION postgis;

-- Verificar versión
SELECT PostGIS_version();
```

### Puerto 4000 en uso

```bash
# Windows - Encontrar proceso
netstat -ano | findstr :4000

# Windows - Matar proceso (reemplazar PID)
taskkill /PID <PID> /F

# Linux/macOS - Encontrar proceso
lsof -i :4000

# Linux/macOS - Matar proceso
kill -9 <PID>

# Alternativa: Cambiar puerto en .env
PORT=4001
```

### Error "Cannot find module"

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# O en Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Error de migraciones

```bash
# Ver estado de migraciones
npm run migration:show

# Revertir todas las migraciones
npm run migration:revert

# Ejecutar de nuevo
npm run migration:run

# Si todo falla, recrear base de datos
npm run schema:drop
npm run migration:run
npm run seed
```

## 📝 Convenciones de Código

- **Nombres de archivos**: kebab-case (ej: `user.service.ts`)
- **Nombres de clases**: PascalCase (ej: `UserService`)
- **Nombres de variables**: camelCase (ej: `userName`)
- **Nombres de constantes**: UPPER_SNAKE_CASE (ej: `MAX_FILE_SIZE`)
- **Nombres de interfaces**: PascalCase con prefijo I (ej: `IUser`)
- **Nombres de DTOs**: PascalCase con sufijo Dto (ej: `CreateUserDto`)

## 🔄 Actualización

```bash
# Actualizar dependencias menores
npm update

# Verificar dependencias obsoletas
npm outdated

# Actualizar NestJS
npm install @nestjs/core@latest @nestjs/common@latest

# Actualizar todas las dependencias (CUIDADO)
npm install -g npm-check-updates
ncu -u
npm install
```

## 📞 Soporte

Para problemas o consultas:
- **Email**: agrotechsena2025@gmail.com
- **Documentación API**: http://localhost:4000/api
- **Issues**: GitHub Issues

---

**Desarrollado con ❤️ por el equipo AgroTech SENA**
