# Documentación API - AgroTech

Documentación completa y profesional de la API REST y WebSocket del sistema AgroTech para gestión agrícola integral.

## 🚀 Inicio Rápido

### 1. Instalación
```bash
cd documentacion-agrotech
npm install
npm run dev
```

### 2. Acceder a la Documentación
- **URL Local**: http://localhost:4321
- **Documentación Interactiva**: Navega por los módulos y endpoints

## 📚 Estructura de la Documentación

### Guías Generales
- **[Primeros Pasos](./getting-started.mdx)** - Configuración inicial del backend
- **[Autenticación](./authentication.mdx)** - Sistema JWT, tokens y permisos

### Tipos y Datos
- **[Esquemas TypeScript](./types/schemas.mdx)** - Definiciones completas de tipos
- **[Ejemplos de Datos](./types/examples.mdx)** - Datos reales de prueba

### Referencia Técnica
- **[Códigos de Estado](./reference/status-codes.mdx)** - HTTP status codes y errores
- **[Manejo de Errores](./reference/errors.mdx)** - Estrategias de error handling
- **[WebSockets](./reference/websockets.mdx)** - Comunicación en tiempo real

### Módulos de API

#### 🔐 Autenticación
- **[Registro](./api/auth/register.mdx)** - Crear nueva cuenta
- **[Login](./api/auth/login.mdx)** - Iniciar sesión

#### 👥 Usuarios
- **[Listar Usuarios](./api/users/list.mdx)** - Obtener lista paginada
- **[Perfil](./api/users/profile.mdx)** - Gestión del perfil personal

#### 🌍 Geografía
- **[Lotes](./api/geo/lotes.mdx)** - Gestión de lotes agrícolas
- **[Sub-lotes](./api/geo/sublotes.mdx)** - Gestión de sub-lotes

#### 🌱 Cultivos
- **[Gestión de Cultivos](./api/cultivos/cultivos.mdx)** - CRUD completo de cultivos

#### 📦 Inventario
- **[Insumos](./api/inventory/insumos.mdx)** - Gestión de inventario agrícola

#### 🚜 Actividades
- **[Gestión de Actividades](./api/activities/activities.mdx)** - Actividades agrícolas completas

#### 🏭 Producción
- **[Gestión de Producción](./api/production/production.mdx)** - Lotes, ventas, clientes y reportes

#### 📡 IoT
- **[Sensores y Monitoreo](./api/iot/iot.mdx)** - Sistema IoT completo

#### 📚 Wiki
- **[Base de Conocimiento](./api/wiki/wiki.mdx)** - EPAs y tipos de cultivo

#### 📊 Reportes Avanzados
- **[Reportes de Cultivos](./api/reports/crop-reports.mdx)** - Análisis detallado de cultivos
- **[Reportes IoT](./api/reports/iot-reports.mdx)** - Dashboard y análisis de sensores
- **[Reportes Financieros](./api/reports/financial-reports.mdx)** - Análisis financiero completo

##  Tecnologías Utilizadas

### Backend
- **Framework**: NestJS con TypeScript
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT con Redis
- **WebSockets**: Socket.IO
- **Validación**: class-validator

### Documentación
- **Framework**: Astro con Starlight
- **Lenguaje**: Markdown con componentes MDX
- **Estilos**: Tailwind CSS
- **Tema**: Starlight (basado en Shadcn/ui)

## 📋 Características de la API

### ✅ Implementadas
- [x] Autenticación JWT completa
- [x] Sistema de permisos granular
- [x] Gestión de usuarios completa
- [x] Módulo de Geografía (Lotes y Sub-lotes)
- [x] Módulo de Cultivos
- [x] Módulo de Inventario (Insumos)
- [x] Módulo de Actividades agrícolas
- [x] Módulo de Producción completa
- [x] Módulo de Reportes avanzados (Cultivos, IoT, Financieros)
- [x] Módulo IoT (Sensores y monitoreo)
- [x] Módulo Wiki (Base de conocimiento agrícola)
- [x] WebSockets en tiempo real
- [x] Validación de datos completa
- [x] Paginación automática
- [x] Manejo de errores consistente
- [x] Documentación completa con Starlight

### 🎉 **COMPLETADO**
**Sistema AgroTech 100% documentado** - Todos los módulos principales implementados y documentados profesionalmente.

## 🔧 Desarrollo

### Comandos Disponibles
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Estructura del Proyecto
```
documentacion-agrotech/
├── src/
│   └── content/
│       ├── docs/
│       │   ├── api/           # Documentación de endpoints
│       │   ├── types/         # Tipos y esquemas
│       │   └── reference/     # Referencia técnica
│       └── config.ts          # Configuración de contenido
├── astro.config.mjs           # Configuración de Astro
├── package.json
└── tsconfig.json
```

## 📖 Guías de Contribución

### Agregar Nuevo Endpoint

1. **Crear directorio del módulo** (si no existe):
   ```bash
   mkdir -p src/content/docs/api/{modulo}
   ```

2. **Crear archivo MDX** con la documentación:
   ```mdx
   ---
   title: Nombre del Endpoint
   description: Descripción breve
   ---

   ## Método /ruta

   Descripción del endpoint...

   ### Parámetros de Entrada
   ```typescript
   interface Dto {
     campo: tipo;
   }
   ```

   ### Respuesta Exitosa
   ```json
   {
     "data": "ejemplo"
   }
   ```
   ```

3. **Actualizar navegación** en `astro.config.mjs`

### Estándares de Documentación

- **Idioma**: Español para interfaz, inglés para código
- **Ejemplos**: Incluir cURL, JavaScript y Python
- **Errores**: Documentar códigos de estado y mensajes
- **Tipos**: Usar TypeScript para todas las interfaces
- **Consistencia**: Seguir el formato establecido

## 🔍 Testing de la API

### Health Check
```bash
curl http://localhost:4000
# Respuesta: {"status":"ok","message":"AgroTech API"}
```

### Autenticación
```bash
# Registro
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@agrotech.com","password":"Test123!","nombre":"Test","apellido":"User"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@agrotech.com","password":"Test123!"}'
```

## 📞 Soporte

### Canales de Comunicación
- **Issues**: GitHub Issues para bugs y mejoras
- **Discussions**: GitHub Discussions para preguntas generales
- **Email**: soporte@agrotech.com

### Versiones
- **API Version**: v1.0.0
- **Documentación**: v1.0.0

---

**AgroTech** - Sistema Integral de Gestión Agrícola