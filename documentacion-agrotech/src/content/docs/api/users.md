---
title: Usuarios
description: Documentación de los endpoints del módulo de usuarios
---

# API de Usuarios

Gestiona la información de usuarios, perfiles, roles y estados.

## Gestión de Perfil (Self-Service)

### Ver Mi Perfil
Obtiene los datos del usuario autenticado.

- **URL**: `/users/profile/me`
- **Método**: `GET`
- **Auth**: Requiere autenticación

### Actualizar Mi Perfil
Actualiza datos permitidos (nombre, teléfono, etc).

- **URL**: `/users/profile/me`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación

**Body (JSON):**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "telefono": "3001234567"
}
```

### Cambiar Mi Contraseña
- **URL**: `/users/profile/me/password`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación

### Subir Avatar
- **URL**: `/users/profile/me/avatar`
- **Método**: `POST`
- **Content-Type**: `multipart/form-data`

---

## Gestión de Usuarios (Admin)

### Listar Usuarios
Obtiene lista de usuarios con filtros.

- **URL**: `/users`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `usuarios.ver` (o implícito)

**Parámetros:**
- `q`: Búsqueda de texto
- `rolId`: Filtrar por rol
- `estado`: Filtrar por estado (`ACTIVO`, `INACTIVO`, `SUSPENDIDO`)

### Crear Usuario (Admin)
Crea un usuario administrativamente.

- **URL**: `/users`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `usuarios.crear`

**Body (JSON):**
```json
{
  "nombre": "Pedro",
  "apellido": "Gomez",
  "correo": "pedro@example.com",
  "password": "Password123",
  "roleIds": [2]
}
```

### Ver Usuario por ID
- **URL**: `/users/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `usuarios.ver_perfil`

### Actualizar Usuario (Admin)
Actualiza cualquier dato de usuario.

- **URL**: `/users/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `usuarios.editar`

### Cambiar Rol de Usuario
- **URL**: `/users/:id/rol`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `usuarios.cambiar_rol`

### Sincronizar Permisos de Usuario
- **URL**: `/users/:id/permissions/sync`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `usuarios.asignar_permisos`

### Eliminar Usuario
- **URL**: `/users/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `usuarios.eliminar`