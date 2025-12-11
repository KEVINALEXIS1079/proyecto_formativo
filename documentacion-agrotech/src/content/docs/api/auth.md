---
title: Autenticación y Permisos
description: Documentación de los endpoints de autenticación y gestión de permisos
---

# API de Autenticación y Permisos

Módulo encargado de gestionar el registro, inicio de sesión, recuperación de contraseñas y control de acceso basado en roles y permisos.

## Autenticación de Usuarios

### Registrar Usuario (Paso 1)
Inicia el proceso de registro enviando los datos del usuario.

- **URL**: `/auth/register`
- **Método**: `POST`
- **Auth**: No requerida

**Body (JSON):**
```json
{
  "nombre": "Juan",              // String, Max 100
  "apellido": "Perez",           // String, Max 100
  "identificacion": "123456789", // String, Max 20
  "idFicha": "12345 (opcional)", // String, Max 20
  "telefono": "3001234567",      // String, 10 dígitos (opcional)
  "correo": "juan@example.com",  // Email válido, Max 100
  "password": "Password123"      // Min 8 chars, 1 Mayúscula, 1 minúscula, 1 número
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "message": "Registro iniciado. Se ha enviado un código de verificación a su correo.",
  "correo": "juan@example.com"
}
```

---

### Completar Registro (Paso 2)
Verifica el código enviado al correo para finalizar el registro.

- **URL**: `/auth/complete-register`
- **Método**: `POST`
- **Auth**: No requerida

**Body (JSON):**
```json
{
  "correo": "juan@example.com",
  "code": "123456"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "message": "Registro completado exitosamente",
  "user": { ...datos_usuario }
}
```

---

### Verificar Email
Verifica el correo electrónico (si se requiere en otro flujo).

- **URL**: `/auth/verify-email`
- **Método**: `POST`
- **Auth**: No requerida

**Body (JSON):**
```json
{
  "correo": "juan@example.com",
  "code": "123456"
}
```

---

### Iniciar Sesión
Autentica al usuario y establece la cookie de sesión (`auth_token`).

- **URL**: `/auth/login`
- **Método**: `POST`
- **Auth**: No requerida

**Body (JSON):**
```json
{
  "correo": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "roles": ["admin"]
  }
}
```
*Nota: Se establece una cookie `auth_token` HttpOnly.*

---

### Cerrar Sesión
Invalida la sesión actual y elimina la cookie.

- **URL**: `/auth/logout`
- **Método**: `POST`
- **Auth**: Cookie `auth_token`

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Logout exitoso"
}
```

---

### Recuperación de Contraseña

#### 1. Solicitar Reset
Envía un código de recuperación al correo.

- **URL**: `/auth/request-reset`
- **Método**: `POST`

**Body (JSON):**
```json
{ "correo": "juan@example.com" }
```

#### 2. Verificar Código
Verifica si el código de recuperación es válido.

- **URL**: `/auth/verify-reset-code`
- **Método**: `POST`

**Body (JSON):**
```json
{ "correo": "juan@example.com", "code": "123456" }
```

#### 3. Resetear Contraseña
Establece una nueva contraseña.

- **URL**: `/auth/reset-password`
- **Método**: `POST`

**Body (JSON):**
```json
{
  "correo": "juan@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```

---

## Gestión de Permisos y Roles (Admin)

Estos endpoints requieren autenticación y permisos específicos.

### Permisos

- **Listar Permisos**: `GET /permissions/permisos` (Requiere: `permisos.ver`)
- **Crear Permiso**: `POST /permissions/permisos` (Requiere: `permisos.crear`)
  ```json
  { "modulo": "usuarios", "accion": "leer", "descripcion": "Leer usuarios" }
  ```

### Roles

- **Listar Roles**: `GET /permissions/roles` (Requiere: `roles.ver`)
- **Crear Rol**: `POST /permissions/roles` (Requiere: `roles.crear`)
  ```json
  { "nombre": "supervisor", "descripcion": "Supervisor de campo" }
  ```
- **Eliminar Rol**: `DELETE /permissions/roles/:id` (Requiere: `roles.eliminar`)

### Asignación de Permisos a Roles

- **Ver Permisos de un Rol**: `GET /permissions/roles/:rolId/permisos` (Requiere: `roles.ver`)
- **Asignar Permiso a Rol**: `POST /permissions/roles/:rolId/permisos/:permisoId` (Requiere: `roles.asignar_permisos`)
- **Remover Permiso de Rol**: `DELETE /permissions/roles/:rolId/permisos/:permisoId` (Requiere: `roles.asignar_permisos`)
- **Sincronizar Permisos de Rol**: `POST /permissions/roles/:rolId/permisos/sync`
  ```json
  { "permisoIds": [1, 2, 3] }
  ```

### Asignación Directa a Usuarios

- **Ver Permisos Directos**: `GET /permissions/usuarios/:usuarioId/permisos/directos` (Requiere: `usuarios.ver_permisos`)
- **Ver Todos los Permisos (Efectivos)**: `GET /permissions/usuarios/:usuarioId/permisos/efectivos` (Requiere: `usuarios.ver_permisos`)
- **Asignar Permiso Directo**: `POST /permissions/usuarios/:usuarioId/permisos/:permisoId` (Requiere: `usuarios.asignar_permisos`)
- **Remover Permiso Directo**: `DELETE /permissions/usuarios/:usuarioId/permisos/:permisoId` (Requiere: `usuarios.asignar_permisos`)