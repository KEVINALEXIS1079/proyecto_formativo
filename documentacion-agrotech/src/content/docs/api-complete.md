---
title: API Reference Complete
description: Comprehensive API documentation with all endpoints, request/response schemas, and examples.
---

# API Reference - Agrotech Backend

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication & Authorization

### POST `/auth/register`
**Description:** Initiate user registration (Step 1)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nombre": "Juan Pérez"
}
```

**Response:** `200 OK`
```json
{
  "message": "Código de verificación enviado al correo",
  "userId": 1
}
```

---

### POST `/auth/complete-register`
**Description:** Complete registration with verification code (Step 2)

**Request Body:**
```json
{
  "userId": 1,
  "codigo": "123456"
}
```

**Response:** `201 Created`
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nombre": "Juan Pérez",
    "rol": "OPERARIO"
  }
}
```

---

### POST `/auth/login`
**Description:** User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nombre": "Juan Pérez",
    "rol": "ADMIN",
    "permisos": ["cultivos.ver", "cultivos.crear"]
  }
}
```

---

### POST `/auth/logout`
**Description:** Logout and invalidate token
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### POST `/auth/request-reset`
**Description:** Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Código de recuperación enviado al correo"
}
```

---

### POST `/auth/reset-password`
**Description:** Reset password with code

**Request Body:**
```json
{
  "email": "user@example.com",
  "codigo": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 👥 Users Management

### GET `/users`
**Description:** List all users with filters
**Auth Required:** Yes
**Permission:** `usuarios.ver`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `rol` (string): Filter by role

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "nombre": "Juan Pérez",
      "rol": "ADMIN",
      "activo": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### POST `/users`
**Description:** Create new user (Admin only)
**Auth Required:** Yes
**Permission:** `usuarios.crear`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "nombre": "María García",
  "rol": "OPERARIO"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "nombre": "María García",
  "rol": "OPERARIO",
  "activo": true
}
```

---

### GET `/users/profile/me`
**Description:** Get current user profile
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "nombre": "Juan Pérez",
  "rol": "ADMIN",
  "avatarUrl": "/uploads/avatars/user1.jpg",
  "permisos": ["cultivos.ver", "cultivos.crear"]
}
```

---

### PATCH `/users/profile/me`
**Description:** Update own profile
**Auth Required:** Yes

**Request Body:**
```json
{
  "nombre": "Juan Pérez Updated"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "nombre": "Juan Pérez Updated"
}
```

---

### PATCH `/users/:id/rol`
**Description:** Change user role
**Auth Required:** Yes
**Permission:** `usuarios.cambiar_rol`

**Request Body:**
```json
{
  "rol": "SUPERVISOR"
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "rol": "SUPERVISOR"
}
```

---

## 🌱 Crops Management

### GET `/cultivos`
**Description:** List crops with filters
**Auth Required:** Yes
**Permission:** `cultivos.ver`

**Query Parameters:**
- `estado` (string): Filter by status (PLANIFICADO, ACTIVO, FINALIZADO)
- `loteId` (number): Filter by lot
- `limit` (number): Items per page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Tomate Cherry",
      "nombreCultivo": "Tomate",
      "variedad": "Cherry",
      "estado": "ACTIVO",
      "fechaSiembra": "2024-01-15",
      "loteId": 1,
      "lote": {
        "id": 1,
        "nombre": "Lote A"
      },
      "imagenUrl": "/uploads/cultivos/tomate1.jpg"
    }
  ],
  "total": 25
}
```

---

### POST `/cultivos`
**Description:** Create new crop (supports image upload)
**Auth Required:** Yes
**Permission:** `cultivos.crear`

**Request Body (multipart/form-data):**
```
nombre: "Tomate Cherry"
nombreCultivo: "Tomate"
variedad: "Cherry"
loteId: 1
subLoteId: 2
fechaSiembra: "2024-01-15"
imagen: [File]
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nombre": "Tomate Cherry",
  "estado": "PLANIFICADO",
  "loteId": 1,
  "imagenUrl": "/uploads/cultivos/tomate2.jpg"
}
```

---

### GET `/cultivos/:id`
**Description:** Get crop details
**Auth Required:** Yes
**Permission:** `cultivos.ver`

**Response:** `200 OK`
```json
{
  "id": 1,
  "nombre": "Tomate Cherry",
  "nombreCultivo": "Tomate",
  "variedad": "Cherry",
  "estado": "ACTIVO",
  "fechaSiembra": "2024-01-15",
  "loteId": 1,
  "lote": {
    "id": 1,
    "nombre": "Lote A",
    "area": 1000
  },
  "actividades": [
    {
      "id": 1,
      "nombre": "Siembra Inicial",
      "tipo": "CREACION",
      "fecha": "2024-01-15"
    }
  ]
}
```

---

### PATCH `/cultivos/:id`
**Description:** Update crop
**Auth Required:** Yes
**Permission:** `cultivos.editar`

**Request Body:**
```json
{
  "estado": "FINALIZADO",
  "observaciones": "Cosecha completada"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "estado": "FINALIZADO",
  "observaciones": "Cosecha completada"
}
```

---

### DELETE `/cultivos/:id`
**Description:** Delete crop
**Auth Required:** Yes
**Permission:** `cultivos.eliminar`

**Response:** `200 OK`
```json
{
  "message": "Cultivo eliminado exitosamente"
}
```

---

## 📦 Inventory Management

### GET `/insumos`
**Description:** List consumable inputs
**Auth Required:** Yes
**Permission:** `inventario.ver`

**Query Parameters:**
- `categoriaId` (number): Filter by category
- `almacenId` (number): Filter by warehouse
- `search` (string): Search by name

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Fertilizante NPK",
      "tipoInsumo": "CONSUMIBLE",
      "cantidad": 50,
      "unidadMedida": "KG",
      "stockMinimo": 10,
      "categoria": {
        "id": 1,
        "nombre": "Fertilizantes"
      },
      "almacen": {
        "id": 1,
        "nombre": "Almacén Principal"
      }
    }
  ]
}
```

---

### POST `/insumos`
**Description:** Create new input
**Auth Required:** Yes
**Permission:** `inventario.crear`

**Request Body:**
```json
{
  "nombre": "Fertilizante NPK",
  "tipoInsumo": "CONSUMIBLE",
  "cantidad": 50,
  "unidadMedida": "KG",
  "stockMinimo": 10,
  "categoriaId": 1,
  "almacenId": 1,
  "proveedorId": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nombre": "Fertilizante NPK",
  "cantidad": 50,
  "unidadMedida": "KG"
}
```

---

### GET `/insumos/activos-fijos`
**Description:** List fixed assets (machinery, tools)
**Auth Required:** Yes
**Permission:** `inventario.ver`

**Query Parameters:**
- `tipo` (string): HERRAMIENTA | MAQUINARIA
- `estado` (string): DISPONIBLE | EN_USO | MANTENIMIENTO | DADO_DE_BAJA

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Tractor John Deere",
      "tipoInsumo": "MAQUINARIA",
      "estado": "DISPONIBLE",
      "costoAdquisicion": 50000000,
      "depreciacionAcumulada": 5000000,
      "vidaUtilHoras": 10000,
      "horasUsadas": 1000,
      "categoria": {
        "nombre": "Maquinaria Pesada"
      }
    }
  ]
}
```

---

### POST `/insumos/activos-fijos`
**Description:** Create fixed asset
**Auth Required:** Yes
**Permission:** `inventario.crear`

**Request Body (multipart/form-data):**
```
nombre: "Tractor John Deere"
tipoInsumo: "MAQUINARIA"
categoriaId: 2
almacenId: 1
costoAdquisicion: 50000000
valorResidual: 10000000
vidaUtilHoras: 10000
fechaAdquisicion: "2024-01-01"
imagen: [File]
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nombre": "Tractor John Deere",
  "estado": "DISPONIBLE",
  "costoAdquisicion": 50000000
}
```

---

### POST `/insumos/activos-fijos/:id/mantenimiento`
**Description:** Register maintenance for fixed asset
**Auth Required:** Yes
**Permission:** `inventario.editar`

**Request Body:**
```json
{
  "descripcion": "Cambio de aceite y filtros",
  "costo": 500000,
  "fechaInicio": "2024-02-01"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "activoFijoId": 2,
  "descripcion": "Cambio de aceite y filtros",
  "costo": 500000,
  "estado": "EN_PROCESO"
}
```

---

### GET `/insumos/movimientos`
**Description:** List inventory movements
**Auth Required:** Yes
**Permission:** `inventario.ver`

**Query Parameters:**
- `tipo` (string): ENTRADA | SALIDA
- `fechaDesde` (date): Start date
- `fechaHasta` (date): End date

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "tipo": "SALIDA",
      "cantidad": 10,
      "fecha": "2024-02-15",
      "insumo": {
        "nombre": "Fertilizante NPK"
      },
      "usuario": {
        "nombre": "Juan Pérez"
      },
      "actividadId": 5
    }
  ]
}
```

---

### POST `/insumos/movimientos`
**Description:** Register inventory movement
**Auth Required:** Yes
**Permission:** `inventario.crear`

**Request Body:**
```json
{
  "tipo": "ENTRADA",
  "insumoId": 1,
  "cantidad": 25,
  "almacenId": 1,
  "observaciones": "Compra mensual"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "tipo": "ENTRADA",
  "cantidad": 25,
  "stockActual": 75
}
```

---

## 🏭 Production & Sales

### GET `/production/lotes-produccion`
**Description:** List production lots ready for sale
**Auth Required:** Yes
**Permission:** `produccion.ver`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "cultivoId": 1,
      "productoAgroId": 1,
      "cantidadKg": 500,
      "cantidadDisponibleKg": 450,
      "fechaCosecha": "2024-02-20",
      "cultivo": {
        "nombre": "Tomate Cherry"
      },
      "productoAgro": {
        "nombre": "Tomate"
      }
    }
  ]
}
```

---

### POST `/production/lotes-produccion`
**Description:** Register production lot
**Auth Required:** Yes
**Permission:** `produccion.crear`

**Request Body:**
```json
{
  "cultivoId": 1,
  "productoAgroId": 1,
  "cantidadKg": 500,
  "fechaCosecha": "2024-02-20",
  "precioSugeridoKg": 5000
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "cantidadKg": 500,
  "cantidadDisponibleKg": 500
}
```

---

### GET `/production/ventas`
**Description:** List sales history
**Auth Required:** Yes
**Permission:** `ventas.ver`

**Query Parameters:**
- `fechaDesde` (date): Start date
- `fechaHasta` (date): End date
- `clienteId` (number): Filter by client

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "fecha": "2024-02-25",
      "clienteId": 1,
      "subtotal": 100000,
      "impuestos": 19000,
      "total": 119000,
      "estado": "completada",
      "cliente": {
        "nombre": "Supermercado XYZ"
      },
      "detalles": [
        {
          "loteProduccionId": 1,
          "cantidadKg": 20,
          "precioUnitarioKg": 5000,
          "subtotal": 100000
        }
      ]
    }
  ]
}
```

---

### POST `/production/ventas`
**Description:** Register sale (POS)
**Auth Required:** Yes
**Permission:** `ventas.crear`

**Request Body:**
```json
{
  "clienteId": 1,
  "detalles": [
    {
      "loteProduccionId": 1,
      "cantidadKg": 20,
      "precioUnitarioKg": 5000
    }
  ],
  "pagos": [
    {
      "metodoPago": "EFECTIVO",
      "monto": 119000
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "total": 119000,
  "estado": "completada",
  "detalles": [...]
}
```

---

### POST `/production/ventas/:id/anular`
**Description:** Cancel sale
**Auth Required:** Yes
**Permission:** `ventas.anular`

**Response:** `200 OK`
```json
{
  "message": "Venta anulada exitosamente",
  "venta": {
    "id": 2,
    "estado": "anulada"
  }
}
```

---

## 🗺️ Geospatial (Lots & Sublots)

### GET `/geo/lotes`
**Description:** List lots
**Auth Required:** Yes
**Permission:** `lotes.ver`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Lote A",
      "area": 1000,
      "geom": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

---

### POST `/geo/lotes`
**Description:** Create lot
**Auth Required:** Yes
**Permission:** `lotes.crear`

**Request Body:**
```json
{
  "nombre": "Lote B",
  "area": 1500,
  "geom": {
    "type": "Polygon",
    "coordinates": [[[...]]]
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nombre": "Lote B",
  "area": 1500
}
```

---

## 🌡️ IoT Sensors

### GET `/iot/sensors`
**Description:** List sensors
**Auth Required:** Yes
**Permission:** `iot.ver`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Sensor Temp Lote A",
      "tipoSensorId": 1,
      "loteId": 1,
      "activo": true,
      "ultimoValor": 25.5,
      "ultimaLectura": "2024-02-25T10:30:00Z",
      "tipoSensor": {
        "nombre": "Temperatura",
        "unidad": "°C"
      }
    }
  ]
}
```

---

### POST `/iot/sensors`
**Description:** Register sensor
**Auth Required:** Yes
**Permission:** `iot.crear`

**Request Body:**
```json
{
  "nombre": "Sensor Humedad Lote B",
  "tipoSensorId": 2,
  "loteId": 2,
  "protocolo": "MQTT",
  "topico": "agrotech/lote2/humedad"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nombre": "Sensor Humedad Lote B",
  "activo": true
}
```

---

### GET `/iot/sensors/:id/readings`
**Description:** Get sensor reading history
**Auth Required:** Yes
**Permission:** `iot.ver`

**Query Parameters:**
- `from` (datetime): Start date
- `to` (datetime): End date
- `limit` (number): Max readings

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "valor": 25.5,
      "fechaLectura": "2024-02-25T10:30:00Z"
    }
  ]
}
```

---

## 📊 Reports

### GET `/reports/crops/:id/complete`
**Description:** Get complete crop report
**Auth Required:** Yes
**Permission:** `cultivos.ver`

**Query Parameters:**
- `fechaDesde` (date): Start date
- `fechaHasta` (date): End date

**Response:** `200 OK`
```json
{
  "resumen": {
    "costoTotal": 5000000,
    "ingresoTotal": 8000000,
    "utilidadNeta": 3000000,
    "margenNeto": 37.5,
    "roi": 60,
    "relacionBC": 1.6
  },
  "costos": {
    "insumos": 2000000,
    "manoObra": 2500000,
    "maquinaria": 500000
  },
  "actividades": [...],
  "ventas": [...]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "No tiene permisos para realizar esta acción"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Recurso no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Error interno del servidor"
}
```
