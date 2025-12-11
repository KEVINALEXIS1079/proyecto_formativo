---
title: Geografía y Lotes
description: Documentación de los endpoints de gestión de lotes y sublotes
---

# API de Geografía (Lotes y Sublotes)

Gestiona la estructura geoespacial de la finca, dividiéndola en lotes y sublotes.

## Lotes

### Listar Lotes
Obtiene todos los lotes registrados.

- **URL**: `/geo/lotes`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `lotes.ver`

### Resumen de Lotes
Obtiene un resumen ligero de los lotes (útil para selectores).

- **URL**: `/geo/lotes/summary`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `lotes.ver`

### Crear Lote
Registra un nuevo lote.

- **URL**: `/geo/lotes`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `lotes.crear`

**Body (JSON):**
```json
{
  "nombre": "Lote Norte",
  "descripcion": "Zona norte de la finca",
  "area": 10.5,
  "unidadArea": "HECTAREAS"
}
```

### Actualizar Lote
Actualiza la información de un lote.

- **URL**: `/geo/lotes/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `lotes.editar`

### Eliminar Lote
Elimina un lote.

- **URL**: `/geo/lotes/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `lotes.eliminar`

---

## Sublotes

### Listar Sublotes
Obtiene los sublotes, opcionalmente filtrados por lote padre.

- **URL**: `/geo/sublotes`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `sublotes.ver`

**Parámetros:**
- `loteId`: ID del lote padre

### Crear Sublote
Registra una subdivisión de un lote.

- **URL**: `/geo/sublotes`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `sublotes.crear`

**Body (JSON):**
```json
{
  "nombre": "Sublote A1",
  "area": 2.5,
  "loteId": 1
}
```

### Actualizar Sublote
- **URL**: `/geo/sublotes/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `sublotes.editar`

### Eliminar Sublote
- **URL**: `/geo/sublotes/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `sublotes.eliminar`