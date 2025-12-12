---
title: Inventario
description: Documentación de los endpoints del módulo de inventario
---

# API de Inventario

Gestiona insumos, activos fijos, movimientos de stock, proveedores, almacenes y reservas.

## Insumos y Activos Fijos

### Listar Insumos
Obtiene la lista de insumos (consumibles), con filtros.

- **URL**: `/insumos`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `inventario.ver`

**Parámetros de Consulta:**
- `page`, `limit`: Paginación
- `q`: Búsqueda
- `categoriaId`: Filtrar por categoría
- `proveedorId`: Filtrar por proveedor
- `almacenId`: Filtrar por almacén
- `tipoInsumo`: 'CONSUMIBLE' (default)
- `page`: Página actual
- `limit`: Items por página

**Respuesta Exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Fertilizante NPK",
      "stockActual": 150,
      "unidadMedida": "kg",
      "categoria": { "id": 1, "nombre": "Fertilizantes" }
    }
  ],
  "meta": { "total": 100, "page": 1, "lastPage": 10 }
}
```

### Crear Insumo
Registra un nuevo insumo.

- **URL**: `/insumos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `inventario.crear`

**Body (JSON - CreateInsumoDto):**
```json
{
  "nombre": "Fertilizante NPK",
  "descripcion": "Saco 50kg",
  "categoriaId": 1,
  "unidadMedida": "kg",
  "stockMinimo": 10
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 5,
  "nombre": "Fertilizante NPK",
  "stockActual": 0,
  "createdAt": "2025-11-01T10:00:00Z"
}
```

### Listar Activos Fijos
Obtiene la lista de activos fijos (maquinaria, herramientas).

- **URL**: `/insumos/activos-fijos`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `inventario.ver`

### Crear Activo Fijo
Registra un nuevo activo fijo (maquinaria, herramienta).

- **URL**: `/insumos/activos-fijos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `inventario.crear`
- **Content-Type**: `multipart/form-data`

**Body (FormData):**
- `nombre`: string
- `marca`: string
- `modelo`: string
- `serial`: string
- `costoAdquisicion`: number
- `fechaAdquisicion`: date
- `vidaUtilAnios`: number
- `imagen`: File (opcional)

### Actualizar Insumo/Activo
- **URL**: `/insumos/:id`
- **Método**: `PATCH`

### Eliminar Insumo/Activo
- **URL**: `/insumos/:id`
- **Método**: `DELETE`

---

## Movimientos de Inventario

### Registrar Movimiento
Registra entradas, salidas, mermas o ajustes.

- **URL**: `/insumos/movimientos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `inventario.crear`

**Body (JSON):**
```json
{
  "insumoId": 1,
  "tipo": "ENTRADA", // ENTRADA, SALIDA, AJUSTE
  "cantidad": 50,
  "costoUnitario": 2000,
  "detalle": "Compra factura #123"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 100,
  "tipo": "ENTRADA",
  "cantidad": 50,
  "costoTotal": 100000,
  "nuevoStock": 200,
  "fecha": "2025-11-02T15:00:00Z"
}
```

### Historial de Movimientos
- **URL**: `/insumos/movimientos`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `inventario.ver`

**Parámetros:** `insumoId`, `tipoMovimiento`, `fechaDesde`, `fechaHasta`.

### Alertas de Stock
Obtiene productos con stock bajo.

- **URL**: `/insumos/alerts`
- **Método**: `GET`

---

## Mantenimiento de Activos

### Registrar Mantenimiento
- **URL**: `/insumos/activos-fijos/:id/mantenimiento`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `inventario.editar`

### Finalizar Mantenimiento
- **URL**: `/insumos/activos-fijos/:id/finalizar-mantenimiento`
- **Método**: `PATCH`

### Dar de Baja Activo
- **URL**: `/insumos/activos-fijos/:id/dar-baja`
- **Método**: `POST`

---

## Catálogos (Almacenes, Proveedores, Categorías)

### Almacenes
CRUD de almacenes.
- `GET /insumos/almacenes`
- `POST /insumos/almacenes`
- `PATCH /insumos/almacenes/:id`
- `DELETE /insumos/almacenes/:id`

### Proveedores
CRUD de proveedores.
- `GET /insumos/proveedores`
- `POST /insumos/proveedores`
- `PATCH /insumos/proveedores/:id`
- `DELETE /insumos/proveedores/:id`

### Categorías
CRUD de categorías de insumos.
- `GET /insumos/categorias`
- `POST /insumos/categorias`
- `PATCH /insumos/categorias/:id`
- `DELETE /insumos/categorias/:id`

---

## Reservas

Gestiona la reserva de insumos para actividades futuras.

### Crear Reserva
- **URL**: `/reservas`
- **Método**: `POST`

### Listar Reservas
- **URL**: `/reservas`
- **Método**: `GET`

### Liberar Reserva
Cancela la reserva y devuelve el stock.
- **URL**: `/reservas/:id/liberar`
- **Método**: `PATCH`

### Utilizar Reserva
Confirma el uso de la reserva (convierte en salida).
- **URL**: `/reservas/:id/utilizar`
- **Método**: `PATCH`