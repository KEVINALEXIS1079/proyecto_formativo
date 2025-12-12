---
title: Reportes de Cultivos
description: Documentación de los endpoints de analítica de cultivos
---

# Reportes de Cultivos

Endpoints para obtener métricas, estadísticas y archivos exportables sobre el rendimiento de los cultivos.

**Base URL**: `/reports/crops`

## Resumen y Estadísticas

### Resumen del Cultivo
Obtiene datos clave (financieros, producción, tiempos).
- **URL**: `/reports/crops/:id/summary`
- **Método**: `GET`
- **Auth**: Requiere permiso `cultivos.ver`
```json
{
  "cultivoId": 10,
  "nombre": "Maíz Lote Norte",
  "areaHa": 1.5,
  "rendimientoEstimado": 12000,
  "inversionTotal": 5000000,
  "estadoActual": "ACTIVO"
}
```

### Estadísticas de Actividades
Métricas sobre actividades realizadas vs programadas.
- **URL**: `/reports/crops/:id/activities`
- **Método**: `GET`

### Estadísticas de Labor (Mano de Obra)
Análisis de horas hombre y costos de personal.
- **URL**: `/reports/crops/:id/labor`
- **Método**: `GET`

### Estadísticas de Insumos
Análisis de consumo de materiales.
- **URL**: `/reports/crops/:id/inputs`
- **Método**: `GET`
```json
{
  "totalInsumos": 1500000,
  "desglose": [
    { "categoria": "Fertilizantes", "costo": 1000000 },
    { "categoria": "Semillas", "costo": 500000 }
  ]
}
```

### Distribución Temporal (Gráficos)
Para generar gráficas de horas o insumos por periodo.

- **Horas**: `GET /reports/crops/:id/hours-distribution?granularity=day|week|month`
- **Insumos**: `GET /reports/crops/:id/insumos-distribution?granularity=day|week|month`

---

## Reportes Completos y Exportación

### Reporte Completo (JSON)
Devuelve toda la información consolidada del cultivo.
- **URL**: `/reports/crops/:id/complete`
- **Método**: `GET`

### Exportar CSV
Descarga un archivo CSV con el historial.
- **URL**: `/reports/crops/:id/export`
- **Método**: `GET`
- **Parámetros**: `type` ('summary', 'activities', 'insumos')

### Validar Consistencia
Revisión de integridad de datos del cultivo.
- **URL**: `/reports/crops/:id/consistency`
- **Método**: `GET`
