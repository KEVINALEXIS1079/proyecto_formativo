---
title: Wiki (EPAs)
description: Documentación de los endpoints de Enfermedades, Plagas y Arvenses (EPAs)
---

# API de Wiki Agrícola (EPAs)

Gestiona la base de conocimiento sobre Enfermedades, Plagas y Arvenses (EPAs).

## EPAs (Artículos)

### Listar EPAs
Obtiene artículos de la wiki con filtros.

- **URL**: `/epas`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `wiki.ver`

**Parámetros:**
- `q`: Búsqueda de texto
- `tipoId`: ID del tipo de EPA (Enfermedad, Plaga, etc.)
- `tipoCultivoEpaId`: Filtrar por cultivo afectado

### Crear EPA
Registra un nuevo artículo.

- **URL**: `/epas`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `wiki.crear`
- **Content-Type**: `multipart/form-data`

**Body (FormData):**
- `nombre`: string
- `nombreCientifico`: string
- `descripcion`: string
- `tratamiento`: string
- `tipoId`: number
- `tipoCultivoIds[]`: number[] (IDs de cultivos afectados)
- `fotosSintomas`: Files
- `fotosGenerales`: Files

### Ver EPA
- **URL**: `/epas/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `wiki.ver`

### Actualizar EPA
- **URL**: `/epas/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `wiki.editar`

### Eliminar EPA
- **URL**: `/epas/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `wiki.eliminar`

---

## Tipos y Clasificaciones

### Tipos de EPA
Gestiona las categorías (Enfermedad, Plaga, Arvense).

- `GET /mtipo-epa` (Endpoint base definido en controller root, validar prefijo, el controller dice `@Controller`, methods `@Get('tipo-epa')` -> root path likely `/tipo-epa` o bajo api global prefix si existe).
*Nota: Revisando `wiki-types.controller.ts`, el controlador no tiene prefijo, por lo que las rutas son directas `/tipo-epa`.*

- **Listar**: `GET /tipo-epa`
- **Crear**: `POST /tipo-epa`
- **Actualizar**: `PATCH /tipo-epa/:id`
- **Eliminar**: `DELETE /tipo-epa/:id`

### Tipos de Cultivo (Categorías Wiki)
Gestiona los tipos de cultivo asociados a la wiki.

- **Listar**: `GET /tipo-cultivo-epa`
- **Crear**: `POST /tipo-cultivo-epa`
- **Actualizar**: `PATCH /tipo-cultivo-epa/:id`
- **Eliminar**: `DELETE /tipo-cultivo-epa/:id`