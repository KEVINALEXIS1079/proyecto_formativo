---
title: Finanzas
description: Documentación de los endpoints del módulo de finanzas
---

# API de Finanzas

Gestiona la visualización y reporte de transacciones financieras asociadas a las operaciones agrícolas.

## Endpoints de Finanzas

### Listar Transacciones
Obtiene un listado de transacciones (ingresos/gastos) con filtros.

- **URL**: `/finance/transactions`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `finanzas.ver`

**Parámetros de Consulta:**
- `tipo`: 'INGRESO' o 'GASTO'
- `categoria`: Categoría de la transacción
- `actividadId`: Filtrar por ID de actividad relacionada
- `fechaInicio`: Fecha inicial del rango (ISO 8601)
- `fechaFin`: Fecha final del rango (ISO 8601)

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 100,
    "tipo": "GASTO",
    "monto": 150000,
    "descripcion": "Compra de semillas",
    "fecha": "2025-10-15T10:00:00Z",
    "categoria": "INSUMOS",
    "responsable": { "nombre": "Juan Perez" }
  },
  {
    "id": 101,
    "tipo": "INGRESO",
    "monto": 5000000,
    "descripcion": "Venta Lote Maíz",
    "fecha": "2025-10-20T14:00:00Z",
    "categoria": "VENTA_COSECHA"
  }
]
```

---

### Obtener Transacción
Obtiene el detalle de una transacción específica.

- **URL**: `/finance/transactions/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `finanzas.ver`

---

### Resumen Financiero
Obtiene un resumen de ingresos y gastos totales en un periodo.

- **URL**: `/finance/summary`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `finanzas.ver`

**Parámetros de Consulta:**
- `fechaInicio`: Fecha inicial (opcional)
- `fechaFin`: Fecha final (opcional)

**Respuesta Exitosa:**
```json
{
  "totalIngresos": 5000000,
  "totalGastos": 3500000,
  "balance": 1500000
}
```

---

### Transacciones por Actividad
Obtiene las transacciones asociadas a una actividad específica.

- **URL**: `/finance/by-activity/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `finanzas.ver`

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 50,
    "tipo": "GASTO",
    "monto": 25000,
    "categoria": "MANO_DE_OBRA",
    "descripcion": "Pago jornal riego"
  }
]
```
