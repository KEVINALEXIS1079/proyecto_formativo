---
title: Referencia de API Backend
description: Documentación completa de los endpoints del backend de Agrotech.
---

# API Backend Agrotech

Esta referencia documenta todos los endpoints disponibles en la API REST del backend.

## Autenticación y Autorización

### Authentication (`/auth`)
Gestión del ciclo de vida de la sesión y registro de usuarios.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Iniciar proceso de registro (paso 1). | Público |
| `POST` | `/auth/complete-register` | Completar registro con código de verificación (paso 2). | Público |
| `POST` | `/auth/verify-email` | Verificar correo electrónico. | Público |
| `POST` | `/auth/resend-verification` | Reenviar código de verificación. | Público |
| `POST` | `/auth/login` | Iniciar sesión (Devuelve JWT y Cookie). | Público |
| `POST` | `/auth/logout` | Cerrar sesión e invalidar token. | Autenticado |
| `POST` | `/auth/request-reset` | Solicitar restablecimiento de contraseña. | Público |
| `POST` | `/auth/reset-password` | Establecer nueva contraseña. | Público |
| `POST` | `/auth/verify-reset-code` | Verificar código de recuperación. | Público |

---

## Módulos Principales

### Usuarios (`/users`)
Gestión de usuarios del sistema, perfiles y roles.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Listar usuarios con filtros (query params). | `usuarios.ver` |
| `POST` | `/users` | Crear un usuario nuevo (Admin). | `usuarios.crear` |
| `GET` | `/users/profile/me` | Obtener perfil del usuario actual. | Autenticado |
| `PATCH` | `/users/profile/me` | Actualizar perfil propio. | Autenticado |
| `PATCH` | `/users/profile/me/password` | Cambiar contraseña propia. | Autenticado |
| `POST` | `/users/profile/me/avatar` | Subir avatar propio. | Autenticado |
| `GET` | `/users/:id` | Ver detalles de un usuario específico. | `usuarios.ver_perfil` |
| `PATCH` | `/users/:id/rol` | Cambiar rol de un usuario. | `usuarios.cambiar_rol` |
| `PATCH` | `/users/:id` | Editar usuario (Admin). | `usuarios.editar` |
| `DELETE` | `/users/:id` | Eliminar usuario. | `usuarios.eliminar` |
| `POST` | `/users/:id/permissions/sync` | Sincronizar permisos granulares de usuario. | `usuarios.asignar_permisos` |
| `POST` | `/users/:id/avatar` | Subir avatar de usuario (Admin). | `usuarios.editar` |

---

### Cultivos (`/cultivos`)
Gestión del ciclo de vida de los cultivos agrícolas.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/cultivos` | Listar cultivos con filtros. | `cultivos.ver` |
| `POST` | `/cultivos` | Crear nuevo cultivo (soporta imagen). | `cultivos.crear` |
| `GET` | `/cultivos/historial` | Ver historial de cambios. | `cultivos.ver` |
| `GET` | `/cultivos/:id` | Obtener detalle de cultivo. | `cultivos.ver` |
| `PATCH` | `/cultivos/:id` | Actualizar cultivo. | `cultivos.editar` |
| `DELETE` | `/cultivos/:id` | Eliminar cultivo. | `cultivos.eliminar` |

---

### Inventario (`/insumos`)
Control de stock, activos fijos y movimientos.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/insumos` | Listar insumos (consumibles). | `inventario.ver` |
| `POST` | `/insumos` | Crear nuevo insumo. | `inventario.crear` |
| `GET` | `/insumos/:id` | Ver detalle de insumo. | `inventario.ver` |
| `PATCH` | `/insumos/:id` | Editar insumo. | `inventario.editar` |
| `DELETE` | `/insumos/:id` | Eliminar insumo. | `inventario.eliminar` |
| `POST` | `/insumos/:id/upload-image` | Subir imagen de insumo. | `inventario.editar` |
| `GET` | `/insumos/activos-fijos` | Listar activos fijos. | `inventario.ver` |
| `POST` | `/insumos/activos-fijos` | Crear activo fijo. | `inventario.crear` |
| `POST` | `/insumos/activos-fijos/:id/mantenimiento` | Registrar mantenimiento. | `inventario.editar` |
| `PATCH` | `/insumos/activos-fijos/:id/finalizar-mantenimiento` | Finalizar mantenimiento. | `inventario.editar` |
| `POST` | `/insumos/activos-fijos/:id/dar-baja` | Dar de baja activo fijo. | `inventario.eliminar` |
| `GET` | `/insumos/movimientos` | Ver movimientos de inventario. | `inventario.ver` |
| `POST` | `/insumos/movimientos` | Registrar movimiento (Entrada/Salida). | `inventario.crear` |
| `GET` | `/insumos/alerts` | Ver alertas de stock bajo. | `inventario.ver` |
| `GET` | `/insumos/almacenes` | Listar almacenes. | `inventario.ver` |
| `POST` | `/insumos/almacenes` | Crear almacén. | `inventario.crear` |
| `GET` | `/insumos/proveedores` | Listar proveedores. | `inventario.ver` |
| `POST` | `/insumos/proveedores` | Crear proveedor. | `inventario.crear` |
| `GET` | `/insumos/categorias` | Listar categorías. | `inventario.ver` |
| `POST` | `/insumos/categorias` | Crear categoría. | `inventario.crear` |

---

### Producción y Ventas (`/production`)
Gestión de lotes de producción y punto de venta.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/production/productos` | Listar productos agro. | `produccion.ver` |
| `POST` | `/production/productos` | Crear producto agro. | `produccion.crear` |
| `GET` | `/production/lotes-produccion` | Listar lotes listos para venta. | `produccion.ver` |
| `POST` | `/production/lotes-produccion` | Registrar lote de producción. | `produccion.crear` |
| `GET` | `/production/ventas` | Listar historial de ventas. | `ventas.ver` |
| `POST` | `/production/ventas` | Registrar venta (POS). | `ventas.crear` |
| `POST` | `/production/ventas/:id/anular` | Anular venta. | `ventas.anular` |
| `GET` | `/production/clientes` | Listar clientes. | `ventas.ver` |
| `POST` | `/production/clientes` | Registrar cliente. | `ventas.crear` |

---

### Geoespacial (`/geo`)
Gestión de lotes (terrenos) y sublotes.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/geo/lotes` | Listar lotes. | `lotes.ver` |
| `GET` | `/geo/lotes/summary` | Resumen de lotes (para mapas). | `lotes.ver` |
| `POST` | `/geo/lotes` | Crear lote. | `lotes.crear` |
| `PATCH` | `/geo/lotes/:id` | Editar lote. | `lotes.editar` |
| `DELETE` | `/geo/lotes/:id` | Eliminar lote. | `lotes.eliminar` |
| `GET` | `/geo/sublotes` | Listar sublotes. | `sublotes.ver` |
| `POST` | `/geo/sublotes` | Crear sublote. | `sublotes.crear` |
| `PATCH` | `/geo/sublotes/:id` | Editar sublote. | `sublotes.editar` |

---

### IoT (`/iot`)
Sensores y lecturas en tiempo real.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/iot/config` | Obtener configuración global. | `iot.ver` |
| `GET` | `/iot/sensors` | Listar sensores. | `iot.ver` |
| `POST` | `/iot/sensors` | Registrar sensor. | `iot.crear` |
| `GET` | `/iot/lecturas` | Ver lecturas de sensores. | `iot.ver` |
| `GET` | `/iot/alerts` | Ver alertas de sensores. | `iot.ver` |
| `GET` | `/iot/sensors/:id/readings` | Historial de lecturas de un sensor. | `iot.ver` |
| `GET` | `/iot/sensor-types` | Tipos de sensores soportados. | `iot.ver` |

---

### Wiki Fitosanitaria (`/epas`)
Enciclopedia de Plagas y Enfermedades (EPAs).

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/epas` | Buscar EPAs. | `wiki.ver` |
| `POST` | `/epas` | Crear entrada de EPA (Fotos, Descripción). | `wiki.crear` |
| `GET` | `/epas/:id` | Ver detalle de EPA. | `wiki.ver` |
| `PATCH` | `/epas/:id` | Editar EPA. | `wiki.editar` |
| `DELETE` | `/epas/:id` | Eliminar EPA. | `wiki.eliminar` |

---

### Actividades (`/activities`)
Gestión y seguimiento de labores agrícolas.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/activities` | Listar actividades con filtros. | `actividades.ver` |
| `POST` | `/activities` | Crear nueva actividad. | `actividades.crear` |
| `GET` | `/activities/:id` | Ver detalle de actividad. | `actividades.ver` |
| `PATCH` | `/activities/:id` | Editar actividad. | `actividades.editar` |
| `DELETE` | `/activities/:id` | Eliminar actividad. | `actividades.eliminar` |
| `POST` | `/activities/upload` | Subir archivo/evidencia (general). | Autenticado |
| `PATCH` | `/activities/:id/finalize` | Finalizar actividad (Completar). | `actividades.editar` |
| `POST` | `/activities/:id/evidencias` | Agregar evidencia fotográfica. | `actividades.editar` |
| `POST` | `/activities/:id/servicios` | Registrar servicios de terceros. | `actividades.editar` |
| `POST` | `/activities/:id/insumos` | Registrar consumo de insumos. | `actividades.editar` |

---

### Finanzas (`/finance`)
Registro de transacciones y resumen financiero.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/finance/transactions` | Listar transacciones (ingresos/gastos). | `finanzas.ver` |
| `GET` | `/finance/transactions/:id` | Ver detalle de transacción. | `finanzas.ver` |
| `GET` | `/finance/summary` | Resumen financiero por rango de fechas. | `finanzas.ver` |
| `GET` | `/finance/by-activity/:id` | Costos asociados a una actividad. | `finanzas.ver` |

---

### Reservas de Inventario (`/reservas`)
Apartado de insumos para actividades futuras.

| Método | Endpoint | Descripción | Permisos Requeridos |
| :--- | :--- | :--- | :--- |
| `GET` | `/reservas` | Listar reservas activas. | Autenticado |
| `POST` | `/reservas` | Crear nueva reserva. | Autenticado |
| `PATCH` | `/reservas/:id/liberar` | Cancelar/Liberar reserva. | Autenticado |
| `PATCH` | `/reservas/:id/utilizar` | Consumir reserva (convertir en salida). | Autenticado |

---

## Reportes

### Reportes de Cultivos (`/reports/crops`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/reports/crops/:id/summary` | Resumen ejecutivo del cultivo. |
| `GET` | `/reports/crops/:id/activities` | Estadísticas de actividades. |
| `GET` | `/reports/crops/:id/labor` | Estadísticas de mano de obra. |
| `GET` | `/reports/crops/:id/inputs` | Consumo de insumos. |
| `GET` | `/reports/crops/:id/export` | Exportar historial (CSV). |
| `GET` | `/reports/crops/:id/complete` | Reporte completo PDF. |

### Reportes Financieros (`/reports/financial`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/reports/financial/sales` | Reporte de ventas. |
| `GET` | `/reports/financial/sales/export` | Exportar ventas (CSV). |
| `GET` | `/reports/financial/rentability/:cultivoId` | Rentabilidad por cultivo. |

### Reportes IoT (`/reports/iot`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/reports/iot/dashboard` | Estado general del sistema IoT. |
| `GET` | `/reports/iot/export` | Exportar datos de sensores (CSV). |
| `GET` | `/reports/iot/export-pdf` | Exportar reporte PDF de lote. |

### Reportes N8N (`/reports/n8n`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/reports/n8n/activities/pdf` | Generar PDF de actividades via N8N. |
| `GET` | `/reports/n8n/activities/excel` | Generar Excel de actividades via N8N. |
