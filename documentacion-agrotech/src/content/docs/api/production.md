---
title: API de Producción
description: Documentación de los endpoints del módulo de producción
---

# API de Producción

Esta sección documenta los endpoints relacionados con la producción agrícola (lotes, productos, ventas).

## Endpoints

### GET /production/productos
Obtiene la lista de productos agro.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "price": "number"
    }
  ]
}
```

### POST /production/productos
Crea un nuevo producto agro.

**Parámetros de entrada:**
- `name`: string (requerido)
- `description`: string (opcional)
- `price`: number (requerido)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "price": "number"
}
```

### GET /production/lotes-produccion
Obtiene la lista de lotes de producción.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "productId": "number",
      "quantity": "number",
      "status": "string"
    }
  ]
}
```

### POST /production/ventas
Registra una nueva venta.

**Parámetros de entrada:**
- `productId`: number (requerido)
- `quantity`: number (requerido)
- `clientId`: number (opcional)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "productId": "number",
  "quantity": "number",
  "total": "number",
  "date": "string"
}
```

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Recurso no encontrado