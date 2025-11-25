# Backend Agrotech - API Documentation

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npm run migration:run

# Seed de datos iniciales
npm run seed

# Iniciar en modo desarrollo
npm run start:dev

# Build para producción
npm run build
npm run start:prod
```

---

## 📋 Tabla de Contenidos

1. [Módulos del Sistema](#módulos-del-sistema)
2. [Autenticación](#autenticación)
3. [Endpoints por Módulo](#endpoints-por-módulo)
4. [Nuevas Funcionalidades 2024](#nuevas-funcionalidades-2024)
5. [Variables de Entorno](#variables-de-entorno)

---

## 🏗️ Módulos del Sistema

### Módulos Implementados (9)

| Módulo | Descripción | Cobertura |
|--------|-------------|-----------|
| **Auth** | Autenticación, roles y permisos | 100% |
| **Users** | Gestión de usuarios | 100% |
| **Geo** | Lotes, sublotes y cult ivos | 100% |
| **Activities** | Actividades agrícolas | 100% |
| **Inventory** | Insumos y stock | 100% |
| **Wiki** | EPA y tipos de cultivo | 100% |
| **IoT** | Sensores y lecturas | 100% |
| **Production** | Producción y POS | 100% |
| **Reports** | Reportes financieros e IoT | 100% |

---

## 🔐 Autenticación

### Endpoints de Autenticación

```http
POST   /auth/register          # Registrar usuario
POST   /auth/verify-email      # Verificar correo
POST   /auth/login             # Login (devuelve cookie)
POST   /auth/logout            # Logout
POST   /auth/forgot-password   # Recuperar contraseña
POST   /auth/reset-password    # Resetear contraseña
```

### Seguridad
- **JWT** con cookies HTTP-only
- **Refresh tokens** en Redis
- **Blacklist de tokens** para logout
- **Guards**: `JwtAuthGuard`, `PermissionsGuard`

---

## 📡 Endpoints por Módulo

### 👥 Usuarios

```http
GET    /users             # Listar usuarios (requiere: usuarios.ver)
GET    /users/me          # Perfil del usuario autenticado
PATCH  /users/me          # Actualizar perfil propio
GET    /users/:id         # Detalle de usuario
PATCH  /users/:id         # Editar usuario (admin)
DELETE /users/:id         # Desactivar usuario
PATCH  /users/:id/role    # Cambiar rol
POST   /users/:id/activate    # Activar/desactivar
```

### 🔑 Permisos ✨ *NUEVO*

```http
GET    /permissions/permisos              # Listar permisos
POST   /permissions/permisos              # Crear permiso
GET    /permissions/permisos/:id          # Detalle permiso
DELETE /permissions/permisos/:id          # Eliminar permiso (validado)

GET    /permissions/roles                 # Listar roles
POST   /permissions/roles                 # Crear rol
DELETE /permissions/roles/:id             # Eliminar rol

GET    /permissions/roles/:id/permisos    # Permisos de un rol
POST   /permissions/roles/:id/permisos/:permisoId    # Asignar
DELETE /permissions/roles/:id/permisos/:permisoId    # Remover
```

### 🗺️ Geo (Lotes y Cultivos)

```http
GET    /geo/lotes         # Listar lotes
POST   /geo/lotes         # Crear lote
GET    /geo/lotes/:id     # Detalle lote

GET    /geo/sublotes      # Listar sublotes
POST   /geo/sublotes      # Crear sublote

GET    /geo/cultivos      # Listar cultivos
POST   /geo/cultivos      # Crear cultivo
GET    /geo/cultivos/:id  # Detalle cultivo
```

### 🌱 Actividades

```http
GET    /activities                    # Listar actividades
POST   /activities                    # Crear actividad
GET    /activities/:id                # Detalle actividad
PATCH  /activities/:id                # Editar actividad
DELETE /activities/:id                # Eliminar actividad

POST   /activities/:id/servicios      # Agregar servicio
POST   /activities/:id/evidencias     # Agregar evidencia
POST   /activities/:id/insumos        # Consumir insumo
GET    /activities/:id/costo-total    # Calcular costo total
```

### 📦 Inventario

```http
GET    /inventory/insumos             # Listar insumos
POST   /inventory/insumos             # Crear insumo
GET    /inventory/insumos/:id         # Detalle insumo
PATCH  /inventory/insumos/:id         # Editar insumo

GET    /inventory/movimientos         # Historial movimientos
POST   /inventory/movimientos         # Crear movimiento

GET    /inventory/almacenes           # Listar almacenes
GET    /inventory/proveedores         # Listar proveedores
GET    /inventory/categorias          # Listar categorías
```

### 🏭 Producción y POS ✨ *ACTUALIZADO*

```http
# Productos
GET    /production/productos-agro     # Listar productos

# Lotes de Producción
GET    /production/lotes-produccion   # Listar lotes
POST   /production/lotes-produccion   # Crear lote
GET    /production/lotes-produccion/:id    # Detalle lote
GET    /production/lotes-produccion/:id/movimientos  # Historial ✨ NUEVO

# Clientes ✨ NUEVO - CRUD COMPLETO
GET    /production/clientes           # Listar clientes
GET    /production/clientes/:id       # Detalle cliente
POST   /production/clientes           # Crear cliente
PATCH  /production/clientes/:id       # Editar cliente
DELETE /production/clientes/:id       # Eliminar cliente (soft)

# Ventas
GET    /production/ventas             # Listar ventas
POST   /production/ventas             # Crear venta
GET    /production/ventas/:id         # Detalle venta
POST   /production/ventas/:id/anular  # Anular venta
```

### 🌡️ IoT Sensores ✨ *ACTUALIZADO*

```http
GET    /iot/tipos-sensor              # Listar tipos
POST   /iot/tipos-sensor              # Crear tipo

GET    /iot/sensores                  # Listar sensores
POST   /iot/sensores                  # Crear sensor
GET    /iot/sensores/:id              # Detalle sensor
PATCH  /iot/sensores/:id              # Editar sensor

POST   /iot/lecturas                  # Ingestar lectura
GET    /iot/sensores/:id/lecturas     # Obtener lecturas

# ✨ NUEVO: Job automático cada 5 min actualiza estado_conexion (online/offline)
```

### 📊 Reportes ✨ *NUEVO*

#### Reportes Financieros

```http
GET    /reports/financial/ventas                      # Reporte ventas
GET    /reports/financial/precios-historicos          # Precios/kg históricos
GET    /reports/financial/rentabilidad/:cultivoId     # Rentabilidad cultivo
```

#### Reportes IoT ✨ *ACTUALIZADO*

```http
GET    /reports/iot/dashboard         # Dashboard stats
GET    /reports/iot/aggregations      # Agregaciones (avg, min, max)
GET    /reports/iot/sensors/:id/out-of-range    # % fuera de rango
GET    /reports/iot/sensors/:id/uptime          # Disponibilidad
GET    /reports/iot/sensors/:id/sparkline       # Últimas N lecturas

# ✨ NUEVO
GET    /reports/iot/sensors/compare   # Comparativa sensores (ranking)
GET    /reports/iot/export            # Exportar a Excel
```

#### Reportes de Cultivos ✨ *ACTUALIZADO*

```http
GET    /reports/crops/:id/summary      # Resumen histórico
GET    /reports/crops/:id/activities   # Conteo actividades
GET    /reports/crops/:id/labor        # Horas por responsable
GET    /reports/crops/:id/inputs       # Insumos consumidos

# ✨ NUEVO
GET    /reports/crops/:id/consistency  # Validar coherencia inventario
GET    /reports/crops/:id/export       # Exportar a Excel
```

---

## ✨ Nuevas Funcionalidades 2024

### 1. Job TTL Sensores IoT (RF34)
- **Cron**: Cada 5 minutos
- **Función**: Actualiza automáticamente `estado_conexion` de sensores
- **Lógica**: Si `now - last_seen_at > ttlMinutos` → `offline`, sino → `online`

### 2. Cosecha → LoteProduccion Automático (RF23)
- Al crear actividad con `subtipo = 'COSECHA'`
- Se crea automáticamente `LoteProduccion` con stock inicial
- Se registra `MovimientoProduccion` tipo `INGRESO_COSECHA`

### 3. Historial Completo Movimientos Producción (RF37)
- **Tipos implementados**:
  - `INGRESO_COSECHA` (automático al cosechar)
  - `SALIDA_VENTA` (automático al vender)
  - `INGRESO_ANULACION` (automático al anular venta)
  - `AJUSTE_POSITIVO` (manual)
  - `AJUSTE_NEGATIVO` (manual con validación stock)

### 4. CRUD Completo Clientes (RF38)
- Endpoints HTTP para listar, crear, editar, eliminar clientes
- Soft delete implementado
- Permisos granulares: `produccion.clientes.*`

### 5. Endpoints HTTP Permisos (RF07)
- Gestión completa de permisos desde UI
- Validación de asignaciones antes de eliminar
- Endpoints para roles y permisos de usuarios

### 6. Comparativa Sensores IoT (RF50)
- Ranking de sensores por métrica (avg, max, min)
- Filtros: tipo, cultivo, rango de fechas
- Útil para análisis comparativo

### 7. Validación Coherencia Inventario (RF61)
- Compara consumos en actividades vs movimientos de inventario
- Detecta diferencias por insumo
- Retorna `{ ok: boolean, diferencias: [...] }`

### 8. Exportación Excel (RF51 & RF60)
- Exportar datos IoT a Excel: `GET /reports/iot/export`
- Exportar historial cultivo: `GET /reports/crops/:id/export`
- Formato XLSX con estilos y columnas ajustadas

### 9. DTOs Paginación Estandarizados (RF65)
- `PaginationDto` común para todos los listados
- Incluye: `page`, `limit`, `orderBy`, `orderDir`, `q`
- Disponible en `src/common/dtos/pagination.dto.ts`

### 10. TTL Caché Permisos (RF08)
- Redis con TTL = 3600s (1 hora)
- Invalidación automática al cambiar roles/permisos
- Optimización de consultas repetidas

---

## 🔧 Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=agrotech

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Redis (caché y sesiones)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Otros
NODE_ENV=development
PORT=3000
```

---

## 📈 Cobertura de Requerimientos

| Fase | Funcionalidades | Estado |
|------|-----------------|--------|
| **Fase 1** (Alta Prioridad) | 4/4 | ✅ 100% |
| **Fase 2** (Media Prioridad) | 3/3 | ✅ 100% |
| **Fase 3** (Baja Prioridad) | 3/3 | ✅ 100% |
| **TOTAL** | **10/10** | ✅ **100%** |

**Cobertura global**: ~90% (65 de 72 RF implementados)

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📝 Notas Técnicas

### Convenciones
- **snake_case** en base de datos
- **camelCase** en código TypeScript
- **Soft delete** en todas las entidades con `deleted_at`
- **Auditoría** con `created_at`, `updated_at`

### Arquitectura
- **Modular**: Un módulo por dominio
- **Services**: Lógica de negocio
- **Controllers**: Endpoints HTTP
- **DTOs**: Validación con `class-validator`
- **Guards**: Autenticación y autorización
- **WebSockets**: Para IoT real-time

### Dependencias Principales
- **@nestjs/*** (framework)
- **typeorm** (ORM)
- **postgres** + **postgis** (base de datos)
- **redis** + **ioredis** (caché y sesiones)
- **@nestjs/schedule** (cron jobs)
- **exceljs** (exportación Excel)
- **bcrypt** (encriptación passwords)
- **class-validator** (validación DTOs)

---

## 👨‍💻 Desarrollo

### Estructura de Carpetas

```
src/
├── app/              # Módulo raíz
├── common/           # Servicios compartidos
│   ├── dtos/        # DTOs comunes (pagination)
│   ├── services/    # ExportService, RedisService
│   └── guards/      # Guards compartidos
├── config/           # Configuración
├── database/         # Migraciones y seeds
└── modules/          # Módulos de negocio
    ├── auth/         # Autenticación
    ├── users/        # Usuarios
    ├── geo/          # Geo
    ├── activities/   # Actividades
    ├── inventory/    # Inventario
    ├── wiki/         # Wiki EPA
    ├── iot/          # IoT
    ├── production/   # Producción
    └── reports/      # Reportes
```

---

## 🚀 Próximos Pasos Opcionales

- [ ] Aplicar `PaginationDto` a todos los endpoints de listado
- [ ] Agregar tests unitarios para nuevas funcionalidades
- [ ] Documentar APIs con Swagger/OpenAPI
- [ ] Implementar notificaciones push
- [ ] Dashboard analytics en tiempo real

---

**Versión**: 2.0.0  
**Última actualización**: 2024-11-24  
**Cobertura RF**: 90% (65/72)
