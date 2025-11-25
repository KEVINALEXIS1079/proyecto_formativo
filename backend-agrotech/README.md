# Backend Agrotech

Sistema backend para la gestión integral de cultivos agrícolas con tecnología IoT, desarrollado con NestJS, PostgreSQL y TypeORM.

---

## 📋 Tabla de Contenidos

- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#️-base-de-datos)
  - [Migraciones](#migraciones)
  - [Seeds](#seeds)
- [Autenticación y Permisos](#-autenticación-y-permisos)
- [Módulos Principales](#-módulos-principales)
- [Testing](#-testing)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [Flujo de Desarrollo](#️-flujo-de-desarrollo)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x con extensión **PostGIS**
- **npm** o **yarn**

### Instalación

```bash
# 1. Clonar el repositorio (si aplica)
git clone <repository-url>
cd backend-agrotech

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Configuración de Base de Datos

```bash
# 1. Crear base de datos PostgreSQL
createdb agrotech_db

# 2. Habilitar PostGIS (IMPORTANTE)
psql agrotech_db -c "CREATE EXTENSION postgis;"

# 3. Generar migración inicial (primera vez)
npm run migration:generate -- src/database/migrations/InitialSchema

# 4. Ejecutar migraciones
npm run migration:run
```

### Ejecutar Aplicación

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

> **📝 Nota:** Los seeds se ejecutan **automáticamente** la primera vez que inicias el backend. No necesitas ejecutarlos manualmente.

---

## 📁 Estructura del Proyecto

```
backend-agrotech/
├── src/
│   ├── common/                    # Código compartido
│   │   ├── constants/             # Mensajes de error/éxito, enums
│   │   ├── decorators/            # @RequirePermissions, @CurrentUser
│   │   ├── entities/              # BaseEntity (soft delete)
│   │   ├── filters/               # Exception filters globales
│   │   ├── guards/                # JwtAuthGuard, PermissionsGuard
│   │   └── utils/                 # Validadores, helpers
│   │
│   ├── config/                    # Configuración de la aplicación
│   │   ├── configuration.ts
│   │   └── validation.schema.ts
│   │
│   ├── database/                  # Database config, migrations, seeds
│   │   ├── config/
│   │   │   └── data-source.ts     # TypeORM DataSource para CLI
│   │   ├── migrations/            # Migraciones generadas
│   │   │   └── *.ts
│   │   ├── seeds/
│   │   │   ├── services/
│   │   │   │   └── seed.service.ts  # Auto-ejecuta seeds
│   │   │   ├── roles-admin.seed.ts
│   │   │   ├── permisos.seed.ts
│   │   │   └── seeds.module.ts      # NestJS module
│   │   └── seed.ts                # Script manual de seeds
│   │
│   └── modules/                   # Módulos funcionales
│       ├── auth/                  # Autenticación, JWT, permisos
│       ├── users/                 # Gestión de usuarios
│       ├── geo/                   # Lotes, sublotes, cultivos (PostGIS)
│       ├── activities/            # Actividades agrícolas
│       ├── inventory/             # Inventario de insumos
│       ├── iot/                   # Sensores IoT en tiempo real
│       ├── production/            # Producción y ventas (POS)
│       └── wiki/                  # Wiki de EPAs
│
├── .env                           # Variables de entorno
├── package.json
└── README.md
```

---

## 🗄️ Base de Datos

### Migraciones

TypeORM maneja las migraciones de base de datos para mantener un historial de cambios y facilitar despliegues.

#### 📝 Comandos de Migraciones

##### Generar migración automática
Compara las entidades con la base de datos actual y genera una migración con los cambios:

```bash
npm run migration:generate -- src/database/migrations/NombreMigracion
```

**Ejemplo:**
```bash
npm run migration:generate -- src/database/migrations/AddUserProfileFields
```

##### Crear migración vacía
Para escribir SQL manualmente:

```bash
npm run migration:create -- src/database/migrations/NombreMigracion
```

##### Ejecutar migraciones pendientes

```bash
npm run migration:run
```

##### Revertir última migración

```bash
npm run migration:revert
```

##### Ver estado de migraciones

```bash
npm run migration:show
```

##### Eliminar todo el esquema (⚠️ SOLO DESARROLLO)

```bash
npm run schema:drop
```

##### Sincronizar esquema automáticamente (⚠️ SOLO DESARROLLO)

```bash
npm run schema:sync
```

> **⚠️ Advertencia:** NUNCA uses `schema:sync` o `synchronize: true` en producción. Usa migraciones.

---

### Seeds

Los seeds son datos iniciales que se cargan en la base de datos. En este proyecto, se ejecutan **automáticamente** al iniciar el backend por primera vez.

#### 🌱 Cómo Funcionan los Seeds

1. Al iniciar el backend, `SeedService` verifica si existe una tabla `seed_execution_log`
2. Si no existe, la crea y ejecuta todos los seeds
3. Los seeds incluyen:
   - **Roles del sistema:** Administrador, Instructor, Aprendiz, Pasante, Invitado
   - **Usuario administrador:** `agrotechsena2025@gmail.com` con contraseña `Agrotech2025`
   - **40+ Permisos base:** Para todos los módulos (usuarios, lotes, cultivos, actividades, etc.)
4. Una vez ejecutados, se registra en `seed_execution_log` para evitar duplicados

#### 🔄 Ejecutar Seeds Manualmente

Si necesitas volver a ejecutar los seeds (por ejemplo, después de `schema:drop`):

```bash
npm run seed
```

> **📝 Nota:** Si la tabla `seed_execution_log` tiene registros, los seeds no se ejecutarán. Para forzar ejecución, elimina esta tabla primero.

#### 🗑️ Resetear Seeds

```bash
# Eliminar tabla de log de seeds
psql agrotech_db -c "DROP TABLE IF EXISTS seed_execution_log;"

# Reiniciar backend (los seeds se ejecutarán automáticamente)
npm run start:dev
```

---

## 🔐 Autenticación y Permisos

### Sistema de Permisos Dinámicos

Este proyecto utiliza un **sistema de permisos 100% dinámico** que permite asignar permisos tanto a **roles** como a **usuarios individuales**.

#### Decoradores de Permisos

```typescript
// En controladores REST (HTTP)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('usuarios.crear')
createUser(@Body() dto: CreateUserDto) { 
  return this.usersService.create(dto); 
}

// En gateways WebSocket
@UseGuards(WsJwtGuard, WsPermissionsGuard)
@RequirePermissions('lotes.ver')
@SubscribeMessage('getLotes')
getLotes() { 
  return this.geoService.findAllLotes(); 
}
```

#### Permisos Base Incluidos

Los siguientes permisos se crean automáticamente al ejecutar los seeds:

##### Usuarios
- `usuarios.ver`, `usuarios.crear`, `usuarios.editar`, `usuarios.eliminar`
- `usuarios.ver_permisos`, `usuarios.asignar_permisos`

##### Roles
- `roles.ver`, `roles.crear`, `roles.editar`, `roles.eliminar`
- `roles.asignar_permisos`

##### Permisos
- `permisos.ver`, `permisos.crear`

##### Geo (Lotes, Sublotes, Cultivos)
- `lotes.ver`, `lotes.crear`, `lotes.editar`, `lotes.eliminar`
- `cultivos.ver`, `cultivos.crear`, `cultivos.editar`, `cultivos.eliminar`

##### Actividades
- `actividades.ver`, `actividades.crear`, `actividades.editar`, `actividades.eliminar`

##### Inventario
- `inventario.ver`, `inventario.crear`, `inventario.editar`, `inventario.eliminar`

##### IoT
- `iot.ver`, `iot.crear`, `iot.editar`, `iot.eliminar`

##### Ventas
- `ventas.ver`, `ventas.crear`, `ventas.anular`

### Usuario Admin por Defecto

Al ejecutar los seeds, se crea un usuario administrador:

- **Email:** `agrotechsena2025@gmail.com`
- **Password:** `Agrotech2025`
- **Rol:** Administrador
- **Permisos:** Todos los permisos del sistema

---

## 📦 Módulos Principales

### 1. Auth Module (`/modules/auth`)
- Registro de usuarios con verificación de email
- Login con JWT
- Gestión de roles y permisos dinámicos
- Recuperación de contraseña

### 2. Users Module (`/modules/users`)
- CRUD de usuarios
- Soft delete
- Asignación de permisos individuales

### 3. Geo Module (`/modules/geo`)
- **Lotes:** Parcelas de terreno con geometrías PostGIS
- **SubLotes:** Subdivisiones dentro de lotes
- **Cultivos:** Cultivos asociados a lotes o sublotes (XOR)
- Validaciones espaciales

### 4. Activities Module (`/modules/activities`)
- Actividades agrícolas (SIEMBRA, RIEGO, FERTILIZACION, COSECHA, etc.)
- Mano de obra, servicios externos, uso de insumos
- Integración con cultivos y producción

### 5. Inventory Module (`/modules/inventory`)
- Sistema de presentación/uso de insumos
- Movimientos de inventario (ENTRADA, SALIDA, AJUSTE)
- Catálogos (almacenes, proveedores, categorías)

### 6. IoT Module (`/modules/iot`)
- Sensores y lecturas en tiempo real
- Multi-protocolo (HTTP, WebSocket, MQTT preparado)
- TTL y estados de conexión
- Alertas por umbrales (min/max)

### 7. Production Module (`/modules/production`)
- Productos agrícolas y lotes de producción
- Sistema POS (Punto de Venta)
- Gestión de clientes
- Cálculo automático de IVA (19%)
- Anulaciones de ventas

### 8. Wiki Module (`/modules/wiki`)
- EPAs (Enfermedades, Plagas, Arvences)
- Búsqueda avanzada con filtros
- Asociación con tipos de cultivo
- Temporadas y meses probables

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Inicia el servidor |
| `npm run start:dev` | Inicia con hot reload (desarrollo) |
| `npm run start:prod` | Inicia en modo producción |
| `npm run start:debug` | Inicia con debugger |
| `npm run build` | Compila el proyecto |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea código con Prettier |
| **Migraciones** | |
| `npm run migration:generate` | Genera migración automática |
| `npm run migration:create` | Crea migración vacía |
| `npm run migration:run` | Ejecuta migraciones pendientes |
| `npm run migration:revert` | Revierte última migración |
| `npm run migration:show` | Muestra estado de migraciones |
| `npm run schema:drop` | ⚠️ Elimina todo el esquema |
| `npm run schema:sync` | ⚠️ Sincroniza esquema (dev) |
| **Seeds** | |
| `npm run seed` | Ejecuta seeds manualmente |
| **Testing** | |
| `npm run test` | Tests unitarios |
| `npm run test:e2e` | Tests E2E |
| `npm run test:cov` | Cobertura de tests |

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ===================
# SERVIDOR
# ===================
PORT=3000
NODE_ENV=development

# ===================
# BASE DE DATOS
# ===================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=agrotech_db

# ===================
# JWT
# ===================
JWT_SECRET=tu_secret_super_seguro_cambialo_en_produccion
JWT_EXPIRES_IN=7d

# ===================
# EMAIL (Gmail)
# ===================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=agrotechsena2025@gmail.com
EMAIL_PASSWORD=tu_app_password_aqui
EMAIL_FROM=agrotechsena2025@gmail.com

# ===================
# REDIS (Opcional)
# ===================
REDIS_HOST=localhost
REDIS_PORT=6379

# ===================
# CORS
# ===================
CORS_ORIGIN=http://localhost:4200,http://localhost:5173
```

### 📌 Notas Importantes

- **`DB_PASSWORD`**: Cambia por tu contraseña de PostgreSQL
- **`JWT_SECRET`**: Usa un string largo y aleatorio en producción
- **`EMAIL_PASSWORD`**: Para Gmail, genera una [App Password](https://support.google.com/accounts/answer/185833)

---

## 🛠️ Flujo de Desarrollo

### 1️⃣ Primera Vez (Base de Datos Vacía)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Crear base de datos y habilitar PostGIS
createdb agrotech_db
psql agrotech_db -c "CREATE EXTENSION postgis;"

# 4. Generar migración inicial
npm run migration:generate -- src/database/migrations/InitialSchema

# 5. Ejecutar migración
npm run migration:run

# 6. Iniciar backend (los seeds se ejecutan automáticamente)
npm run start:dev
```

**Resultado esperado:**
```
🌱 Checking if seeds need to be executed...
✅ Created seed_execution_log table
🌱 Executing seeds for the first time...
  ✅ Rol creado: Administrador
  ✅ Usuario admin creado
  ✅ 40 permisos creados y asignados
✅ Seeds executed successfully!
```

### 2️⃣ Agregar Nuevas Entidades o Modificar Existentes

```bash
# 1. Modificar entidades en src/modules/*/entities/

# 2. Generar migración con los cambios
npm run migration:generate -- src/database/migrations/DescripcionDelCambio

# 3. Revisar archivo generado en src/database/migrations/

# 4. Ejecutar migración
npm run migration:run

# 5. Reiniciar servidor
# (Ctrl+C si está corriendo, luego:)
npm run start:dev
```

### 3️⃣ Si Algo Sale Mal

#### Opción 1: Revertir última migración
```bash
npm run migration:revert
```

#### Opción 2: Empezar de cero (SOLO DESARROLLO)
```bash
# Eliminar todo el esquema
npm run schema:drop

# Ejecutar migraciones
npm run migration:run

# Iniciar backend (seeds automáticos)
npm run start:dev
```

---

## 🐛 Solución de Problemas

### ❌ Error: "relation does not exist"

**Causa:** No se han ejecutado las migraciones.

**Solución:**
```bash
npm run migration:run
```

---

### ❌ Error: "password authentication failed"

**Causa:** Credenciales incorrectas de PostgreSQL.

**Solución:**
- Verifica `DB_USERNAME` y `DB_PASSWORD` en `.env`
- Asegúrate de que el usuario tenga permisos en la base de datos

---

### ❌ Error: "database does not exist"

**Causa:** La base de datos no ha sido creada.

**Solución:**
```bash
createdb agrotech_db
```

---

### ❌ Error: "PostGIS extension not found"

**Causa:** PostGIS no está habilitado en la base de datos.

**Solución:**
```bash
psql agrotech_db -c "CREATE EXTENSION postgis;"
```

---

### ❌ Seeds no se ejecutan

**Causa:** Ya se ejecutaron anteriormente.

**Solución:** Los seeds solo se ejecutan una vez. Si necesitas volver a ejecutarlos:

```bash
# Eliminar tabla de log
psql agrotech_db -c "DROP TABLE IF EXISTS seed_execution_log;"

# Reiniciar backend
npm run start:dev
```

---

### ❌ Error: "Cannot find module"

**Causa:** Dependencias no instaladas o desactualizadas.

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Características Implementadas

- ✅ **8 Sprints completados** con 72 Requerimientos Funcionales
- ✅ **Sistema de permisos 100% dinámico** (roles + usuarios)
- ✅ **Soft delete universal** con `BaseEntity`
- ✅ **CRUD completo** en todos los módulos
- ✅ **Validaciones exhaustivas** con mensajes en español
- ✅ **WebSockets en tiempo real** para IoT y notificaciones
- ✅ **Transacciones atómicas** en operaciones críticas
- ✅ **Seeds automáticos** al iniciar por primera vez
- ✅ **Exception filters globales** para manejo de errores
- ✅ **Guards de autenticación y permisos** en REST y WebSocket
- ✅ **Sistema de migraciones** TypeORM
- ✅ **PostGIS** para geometrías espaciales

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado para **SENA - Agrotech Project 2025**

---

## 📞 Soporte

Para soporte técnico, contacta a: **agrotechsena2025@gmail.com**

---

**¡Listo para desarrollar! 🚀**
