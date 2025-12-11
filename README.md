# 🌱 AgroTech SENA - Sistema de Gestión Agrícola Inteligente

## 📋 Descripción General

**AgroTech SENA** es una plataforma integral de gestión agrícola desarrollada como proyecto formativo del SENA. El sistema combina tecnologías modernas de desarrollo web, móvil y backend para proporcionar una solución completa de monitoreo, gestión y análisis de cultivos agrícolas.

### 🎯 Objetivo del Proyecto

Facilitar la gestión eficiente de cultivos mediante:
- **Monitoreo IoT en tiempo real** de condiciones ambientales (temperatura, humedad, etc.)
- **Gestión completa de cultivos** (siembra, cosecha, actividades, insumos)
- **Análisis financiero** con indicadores de rentabilidad (ROI, B/C, márgenes)
- **Reportes profesionales** en PDF, Excel y CSV
- **Trazabilidad completa** de productos desde siembra hasta venta
- **Gestión de usuarios y permisos** con roles diferenciados

## 🏗️ Arquitectura del Sistema

El proyecto está compuesto por **4 módulos principales**:

```
proyecto_formativo/
├── backend-agrotech/     # API REST con NestJS + PostgreSQL/PostGIS (Puerto 4000)
├── agrotech-web/         # Aplicación web con React + Vite (Puerto 3000)
├── agrotech-movil/       # Aplicación móvil con React Native + Expo
└── documentacion-agrotech/  # Documentación técnica y manuales
```

### 🔧 Stack Tecnológico

#### Backend (Puerto 4000)
- **Framework**: NestJS 11.0.1 (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL 15 con extensión PostGIS 3.x
- **ORM**: TypeORM 0.3.27
- **Autenticación**: JWT (passport-jwt 4.0.1) + Bcrypt 6.0.0
- **Validación**: Class Validator 0.14.2
- **WebSockets**: Socket.IO 4.8.1 para datos IoT en tiempo real

#### Frontend Web (Puerto 3000)
- **Framework**: React 19.2.0 + TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **UI Library**: HeroUI 2.8.5 (NextUI fork)
- **Routing**: React Router DOM 7.9.1
- **State Management**: TanStack Query 5.90.2 (React Query)
- **Gráficas**: Recharts 3.3.0
- **Mapas**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **Exportación**: jsPDF 3.0.4, jsPDF-AutoTable 5.0.2, XLSX 0.18.5

#### Frontend Móvil
- **Framework**: React Native + Expo
- **Navegación**: React Navigation
- **UI**: React Native Paper
- **Estado**: Context API + React Query

## 📚 Documentación por Módulo

Cada módulo tiene su propio README con instrucciones detalladas de instalación, configuración y uso:

### 📖 Guías de Instalación

| Módulo | Descripción | README |
|--------|-------------|--------|
| **Backend** | API REST, Base de Datos, WebSockets | [backend-agrotech/README.md](./backend-agrotech/README.md) |
| **Web** | Aplicación web de escritorio | [agrotech-web/README.md](./agrotech-web/README.md) |
| **Móvil** | Aplicación móvil Android/iOS | [agrotech-movil/README.md](./agrotech-movil/README.md) |
| **Documentación** | Manuales y guías técnicas | [documentacion-agrotech/README.md](./documentacion-agrotech/README.md) |

## 🚀 Inicio Rápido

### Prerrequisitos Globales

- **Node.js** 22.x
- **npm** 10.x
- **PostgreSQL** 15.x con PostGIS 3.x
- **Git** para clonar el repositorio

### Instalación Básica

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd proyecto_formativo
```

2. **Configurar Backend (Puerto 4000)**
```bash
cd backend-agrotech
npm install
# Configurar .env (ver backend-agrotech/README.md)
npm run migration:run
npm run seed
npm run start:dev
```

3. **Configurar Frontend Web (Puerto 3000)**
```bash
cd agrotech-web
npm install
# Configurar .env (ver agrotech-web/README.md)
npm run dev
```

4. **Acceder a la aplicación**
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api

### Credenciales por Defecto

```
Email: agrotechsena2025@gmail.com
Password: Agrotech2025
```

## 🌟 Características Principales

### 1. Gestión de Cultivos
- Registro de cultivos con ubicación geográfica (PostGIS)
- Seguimiento de ciclo de vida completo
- Gestión de lotes y sublotes
- Historial de actividades

### 2. Monitoreo IoT
- Sensores en tiempo real (WebSockets)
- Alertas automáticas por umbrales
- Gráficas de tendencias
- Exportación de datos históricos

### 3. Análisis Financiero
- Cálculo automático de costos (insumos, mano de obra, maquinaria)
- Indicadores de rentabilidad (ROI, B/C, márgenes)
- Comparativas entre cultivos
- Proyecciones financieras

### 4. Reportes Profesionales
- Generación de PDF con diseño profesional
- Exportación a Excel y CSV
- Reportes personalizables por sección
- Inclusión de gráficas y tarjetas visuales

### 5. Trazabilidad
- Seguimiento desde siembra hasta venta
- Registro de lotes de producción
- Control de calidad
- Historial completo de movimientos

### 6. Gestión de Usuarios
- Sistema de roles y permisos
- Autenticación segura con JWT
- Gestión de módulos por rol
- Auditoría de acciones

## 📊 Módulos del Sistema

### Backend (NestJS)
- **Auth**: Autenticación y autorización
- **Users**: Gestión de usuarios y roles
- **Cultivos**: CRUD de cultivos y lotes
- **IoT**: Sensores, lecturas y alertas
- **Reports**: Generación de reportes
- **Activities**: Registro de actividades
- **Sales**: Gestión de ventas
- **Inventory**: Control de inventario

### Frontend Web (React)
- **Dashboard**: Vista general del sistema
- **Cultivos**: Gestión de cultivos
- **IoT**: Monitoreo en tiempo real
- **Reportes**: Generación y exportación
- **Actividades**: Registro de tareas
- **Ventas**: Gestión comercial
- **Configuración**: Ajustes del sistema

### Frontend Móvil (React Native)
- **Inicio**: Dashboard móvil
- **Cultivos**: Vista de cultivos
- **IoT**: Monitoreo móvil
- **Actividades**: Registro rápido
- **Perfil**: Configuración de usuario

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Encriptación de contraseñas con Bcrypt
- Validación de datos en backend y frontend
- Protección contra SQL Injection (TypeORM)
- CORS configurado
- Variables de entorno para secretos

## 🧪 Testing

Cada módulo incluye pruebas:
- **Backend**: Jest + Supertest
- **Web**: Vitest + React Testing Library
- **Móvil**: Jest + React Native Testing Library

## 📝 Licencia

Este proyecto es de código abierto desarrollado como proyecto formativo del SENA.

## 👥 Contribuidores

Proyecto desarrollado por aprendices del SENA en el marco del programa de formación en desarrollo de software.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: agrotechsena2025@gmail.com
- Documentación: Ver carpeta `documentacion/`

---

## 🗺️ Roadmap

- [ ] Integración con APIs de clima
- [ ] Módulo de predicción con ML
- [ ] App móvil para iOS
- [ ] Dashboard de analíticas avanzadas
- [ ] Integración con drones
- [ ] Sistema de recomendaciones

---

**Desarrollado con ❤️ por el equipo AgroTech SENA**
