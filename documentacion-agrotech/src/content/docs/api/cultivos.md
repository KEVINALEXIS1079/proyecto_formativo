---
title: API de Cultivos
description: Documentacion del modulo de cultivos con reglas de ubicacion (lote/sublote), auditoria y restricciones de unicidad
---

# API de Cultivos

## Vision general

El modulo de cultivos administra siembras asociadas a lotes o sublotes. Se aplica una regla XOR de ubicacion (loteId o subLoteId, nunca ambos) y se impide tener dos cultivos activos en la misma ubicacion. Las operaciones de edicion exigen motivo y registran historial de cambios. No se permite eliminar cultivos: se debe cerrar cambiando el estado.

### Caracteristicas principales

- **XOR ubicacion**: se debe enviar `loteId` o `subLoteId`. Si un lote tiene sublotes, solo se permite asociar al sublote.
- **Unicidad de cultivo activo**: solo un cultivo activo por lote o sublote.
- **Auditoria**: cada actualizacion requiere `motivo` y guarda diffs en `cultivo_historial`.
- **Estados**: inicia en `activo`; `fechaFinalizacion` marca `finalizado`. Borrado no permitido.
- **Uploads**: imagen opcional con campo `img` (multipart/form-data), guardada en `uploads/cultivos`.

### Permisos clave

- `cultivos.ver`, `cultivos.crear`, `cultivos.editar`, `cultivos.eliminar`

## Endpoints

Base path: `/cultivos`

### POST /cultivos

**Permisos:** `cultivos.crear`  
**Contenido:** `multipart/form-data` (campo de archivo opcional `img`)

**Body:**

```json
{
  "nombreCultivo": "Tomate Cherry",
  "tipoCultivo": "hortaliza",
  "descripcion": "Ciclo 2024",
  "loteId": 3,
  "fechaSiembra": "2024-11-30",
  "estado": "activo"
}
```

**Reglas de negocio:**

- Requiere `loteId` XOR `subLoteId`. Si el lote tiene sublotes registrados, obliga a usar `subLoteId`.
- Si ya existe un cultivo activo en la misma ubicacion, responde 400.
- Estado inicial se fuerza a `activo`; `fechaCreacion` se setea automaticamente.

**Respuesta 201 (ejemplo):**

```json
{
  "id": 21,
  "nombreCultivo": "Tomate Cherry",
  "tipoCultivo": "hortaliza",
  "descripcion": "Ciclo 2024",
  "loteId": 3,
  "subLoteId": null,
  "imgCultivo": "uploads/cultivos/cultivo-1701701111.png",
  "fechaSiembra": "2024-11-30",
  "fechaFinalizacion": null,
  "estado": "activo",
  "fechaCreacion": "2024-12-04T14:00:00.000Z",
  "createdAt": "2024-12-04T14:00:00.000Z",
  "updatedAt": "2024-12-04T14:00:00.000Z"
}
```

### GET /cultivos

**Permisos:** `cultivos.ver`

Filtros soportados (`query`):

- `q`: texto (busca en nombre, tipo, descripcion)
- `loteId`, `subLoteId`: numericos
- `estado`: ej. `activo`, `finalizado`
- `tipoCultivo`: texto parcial

Retorna cultivos con relaciones `lote` y `subLote`.

### GET /cultivos/:id

**Permisos:** `cultivos.ver`  
Incluye `lote`/`subLote`.  
Errores: 404 si no existe.

### GET /cultivos/historial

**Permisos:** `cultivos.ver`

**Query opcional:** `limit` (por defecto 50), `cultivoId` para filtrar historial de un cultivo.

Retorna entradas de `cultivo_historial` con usuario y ubicacion enlazadas.

### PATCH /cultivos/:id

**Permisos:** `cultivos.editar`  
**Contenido:** `multipart/form-data` (campo `img` opcional)

**Body (ejemplo):**

```json
{
  "nombreCultivo": "Tomate Cherry - Lote 3",
  "estado": "activo",
  "motivo": "Actualizacion de nombre y foto"
}
```

**Reglas de negocio:**

- Campo `motivo` es obligatorio siempre.
- No permite enviar `loteId` y `subLoteId` juntos.
- Al mover ubicacion: valida que el lote sin sublotes; si el lote tiene sublotes, exige `subLoteId`.
- Vuelve a validar unicidad de cultivo activo en el destino.
- Guarda historial con diffs `{ campo: { previo, nuevo } }`; si no hay cambios tambien registra la intencion con motivo.

### DELETE /cultivos/:id

**Permisos:** `cultivos.eliminar`

- Bloqueado por regla de negocio: responde 400 indicando que no se pueden eliminar cultivos; se debe cambiar el estado (ej. `finalizado`/`inactivo`).

## Validaciones principales

- `nombreCultivo`: requerido, texto.
- `loteId` XOR `subLoteId`: al menos uno, nunca ambos.
- Lote con sublotes: solo se admite `subLoteId`.
- Unicidad: un solo cultivo `activo` por lote o sublote.
- `motivo`: requerido en todas las ediciones.
- Fechas: `fechaSiembra` y `fechaFinalizacion` en formato `YYYY-MM-DD`.

## Entidades relacionadas

### Cultivo

```typescript
{
  id: number;
  nombreCultivo: string;
  tipoCultivo?: string;
  descripcion?: string;
  loteId?: number | null;
  subLoteId?: number | null;
  imgCultivo?: string; // ruta en uploads/cultivos
  fechaSiembra?: Date;
  fechaFinalizacion?: Date;
  estado: string; // 'activo' por defecto
  fechaCreacion: Date;
  lote?: Lote;
  subLote?: SubLote;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### CultivoHistorial

```typescript
{
  id: number;
  cultivoId: number;
  usuarioId: number;
  motivo: string;
  cambios: Record<string, { previo: any; nuevo: any }> | null;
  createdAt: Date;
}
```

## Respuestas de error comunes

- **400 Bad Request**: falta `motivo`, ubicacion duplicada, lote con sublotes sin subLoteId, XOR no cumplido, intento de delete.
- **401 Unauthorized**: token JWT invalido.
- **403 Forbidden**: permisos insuficientes.
- **404 Not Found**: cultivo inexistente.
