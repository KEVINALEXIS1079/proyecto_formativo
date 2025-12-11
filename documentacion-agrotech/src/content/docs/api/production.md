---
title: Producción y Ventas
description: Documentación de los endpoints del módulo de producción y comercialización
---

# API de Producción

Gestiona la transformación de cultivos en productos finales, lotes de producción y su comercialización.

## Productos Agrícolas (Catálogo)

### Listar Productos
- **URL**: `/production/productos`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `produccion.ver`

### Crear Producto
Define un nuevo tipo de producto (ej: "Saco de Maíz 50kg").

- **URL**: `/production/productos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `produccion.crear`

**Body (JSON):**
```json
{
  "nombre": "Saco Maíz Premium",
  "unidadMedida": "kg",
  "pesoPromedio": 50,
  "descripcion": "Maíz seleccionado calidad superior"
}
```

---

## Lotes de Producción

### Listar Lotes de Producción
- **URL**: `/production/lotes-produccion`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `produccion.ver`

**Parámetros:** `productoAgroId`, `cultivoId`

### Crear Lote de Producción
Registra la cosecha o transformación.

- **URL**: `/production/lotes-produccion`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `produccion.crear`

**Body (JSON):**
```json
{
  "codigoLote": "LOTE-MZ-2023-01",
  "cultivoId": 1,
  "productoAgroId": 1,
  "cantidad": 100, // Número de unidades (ej: 100 sacos)
  "fechaProduccion": "2023-11-01",
  "fechaVencimiento": "2024-11-01"
}
```

### Actualizar/Eliminar
- `PATCH /production/lotes-produccion/:id`
- `DELETE /production/lotes-produccion/:id`

---

## Ventas y Clientes

### Listar Clientes
- **URL**: `/production/clientes`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `ventas.ver`

### Crear Cliente
- **URL**: `/production/clientes`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `ventas.crear`

### Registrar Venta
Registra una venta de productos.

- **URL**: `/production/ventas`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `ventas.crear`

**Body (JSON):**
```json
{
  "clienteId": 5,
  "detalles": [
    {
      "loteProduccionId": 10,
      "cantidadKg": 500,
      "precioUnitarioKg": 2000
    }
  ],
  "pagos": [
    { "metodoPago": "EFECTIVO", "monto": 1000000 }
  ]
}
```

### Consultar Ventas
- **URL**: `/production/ventas`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `ventas.ver`

### Anular Venta
- **URL**: `/production/ventas/:id/anular`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `ventas.anular`