---
title: Actividades
description: Documentación de los endpoints del módulo de actividades
---

# API de Actividades

Gestiona las actividades agrícolas (siembra, fertilización, riego, cosecha, etc.) asociadas a cultivos y lotes.

## Gestión de Actividades

### Crear Actividad
Crea una nueva actividad agrícola.

- **URL**: `/activities`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `actividades.crear`

**Body (JSON - CreateActivityDto):**
```json
{
  "cultivoId": 1,              // ID del cultivo (opcional si es general)
  "loteId": 2,                 // ID del lote (requerido)
  "tipo": "FERTILIZACION",     // Tipo de actividad
  "fechaProgramada": "2023-10-27T10:00:00Z",
  "descripcion": "Aplicación de fertilizante NPK",
  "responsableId": 5,          // ID del usuario responsable
  "estado": "PENDIENTE"        // PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA
}
```

**Respuesta Exitosa (201 Created):**
Devuelve el objeto de la actividad creada.

---

### Listar Actividades
Obtiene todas las actividades, opcionalmente filtradas.

- **URL**: `/activities`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `actividades.ver`

**Parámetros de Consulta (Query Params):**
- `cultivoId`: Filtrar por ID de cultivo
- `loteId`: Filtrar por ID de lote
- `tipo`: Filtrar por tipo de actividad

---

### Obtener Actividad por ID
Obtiene los detalles de una actividad específica.

- **URL**: `/activities/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `actividades.ver`

---

### Actualizar Actividad
Actualiza los datos de una actividad existente.

- **URL**: `/activities/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `actividades.editar`

**Body (JSON - UpdateActivityDto):**
Campos opcionales de `CreateActivityDto`.

---

### Finalizar Actividad
Marca una actividad como finalizada y registra datos de cierre.

- **URL**: `/activities/:id/finalize`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `actividades.editar`

**Body (JSON):**
```json
{
  "fechaFin": "2023-10-27T12:00:00Z",
  "observaciones": "Finalizado sin novedades",
  "costoReal": 150000 // Opcional
}
```

---

### Eliminar Actividad
Elimina una actividad del sistema.

- **URL**: `/activities/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `actividades.eliminar`

---

## Recursos Adicionales de Actividad

### Subir Archivo (Imagen)
Sube una imagen para ser usada como evidencia.

- **URL**: `/activities/upload`
- **Método**: `POST`
- **Auth**: Requiere autenticación

**Body (FormData):**
- `file`: Archivo de imagen

**Respuesta:**
```json
{ "url": "https://..." }
```

---

### Agregar Insumo
Registra el consumo de un insumo en una actividad.

- **URL**: `/activities/:id/insumos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `actividades.editar`

**Body (JSON):**
```json
{
  "insumoId": 10,
  "cantidadUso": 5,
  "costoUnitarioUso": 2000
}
```

---

### Agregar Servicio
Registra un servicio (maquinaria, mano de obra externa) utilizado.

- **URL**: `/activities/:id/servicios`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `actividades.editar`

**Body (JSON):**
```json
{
  "nombreServicio": "Alquiler Tractor",
  "horas": 4,
  "precioHora": 50000
}
```

---

### Agregar Evidencia
Adjunta descripción y fotos como evidencia de la actividad.

- **URL**: `/activities/:id/evidencias`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `actividades.editar`

**Body (JSON):**
```json
{
  "descripcion": "Foto del campo después de fertilizar",
  "imagenes": ["https://url-imagen-1.jpg", "https://url-imagen-2.jpg"]
}
```