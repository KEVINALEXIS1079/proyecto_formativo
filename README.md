# Proyecto Formativo Agrotech 2025

Sistema integral de gestión agrícola basado en IoT, desarrollado para optimizar la producción, monitorear cultivos en tiempo real y administrar recursos eficientemente.

## Módulos del Sistema

El proyecto está dividido en varios micro-componentes:

| Módulo             | Ruta                       | Tecnologías                    | Descripción                                                    |
| :----------------- | :------------------------- | :----------------------------- | :------------------------------------------------------------- |
| **Backend**        | `./backend-agrotech`       | NestJS 11, TypeORM, PostgreSQL | API RESTful, Websockets, Lógica de negocio.                    |
| **Web**            | `./agrotech-web`           | React 19, Vite, Tailwind 4     | Panel de administración web para escritorio/tablet.            |
| **Móvil**          | `./agrotech-movil`         | React Native                   | Aplicación móvil para trabajo en campo.                        |
| **Documentación**  | `./documentacion-agrotech` | Astro Starlight                | Guías de usuario y Referencia de API.                          |
| **IoT**            | `./archivos-extras`        | C++, ESP32                     | Código para sensores y dispositivos de campo.                  |
| **Automatización** | `./archivos-extras`        | n8n                            | Automatización de tareas del modulo de gestión de actividades. |

## Requisitos Globales

- **Node.js**: v22.12.0
- **NPM**: v10.2.0
- **PostgreSQL**: v16.1
- **Docker** (Recomendado para Base de Datos)
- **Git**

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

## Carga de Datos Iniciales (Seeds)

El sistema **automáticamente** carga los datos esenciales al iniciar (`roles`, `permisos` y `usuario administrador`). No es necesario ejecutar ningún comando para que el sistema funcione.

### Datos de Prueba (Opcional)

Si deseas cargar datos extra para desarrollo (usuarios falsos, lotes, cultivos, inventario), ejecuta:

```bash
cd backend-agrotech
npm run seed
```

## Manual de Usuario

Para ver el manual de usuario en video, visita el siguiente enlace:
[Ver Manual en YouTube](https://youtu.be/PFwvwFFZ2jQ?si=HVO3UYJM6m0bmH3-)

## Credenciales por Defecto (Desarrollo)

- **Admin Email**: `agrotechsena2025@gmail.com`
- **Password**: `Agrotech2025`

## 📚 Documentación del Proyecto

El proyecto cuenta con múltiples fuentes de documentación organizadas por tipo:

### Documentación Técnica (Código)
- **Backend API**: [`./backend-agrotech/README.md`](./backend-agrotech/README.md) - Configuración, estructura y endpoints del backend
- **Frontend Web**: [`./agrotech-web/README.md`](./agrotech-web/README.md) - Guía de desarrollo del panel web
- **App Móvil**: [`./agrotech-movil/README.md`](./agrotech-movil/README.md) - Configuración de la aplicación móvil

### Documentación de Usuario y API
- **Documentación API**: [`./documentacion-agrotech/`](./documentacion-agrotech/) - Guías de usuario y referencia completa de API
  - Ejecutar con `npm run dev` en la carpeta para ver en `http://localhost:4321`
  - Incluye tutoriales, guías de módulos y documentación de endpoints

### Documentación Formal (PDFs de Diseño)
- **PDFs de Especificación**: [`./documentacion/README.md`](./documentacion/README.md) - Documentos formales del proyecto
  - Acta de Requerimientos
  - Documento de Diseño UML
  - Especificación de Requisitos de Software (IEEE 830)
  - Planteamiento del Problema

### Configuración IoT y Automatización
- **IoT (Sensores)**: [`./archivos-extras/configuracion-IoT/`](./archivos-extras/configuracion-IoT/) - Código C++ para ESP32
- **Automatización n8n**: [`./archivos-extras/automatizacion/README.md`](./archivos-extras/automatizacion/README.md) - Workflows de automatización

## Licencia

Propiedad del SENA / Proyecto Formativo 2025.
