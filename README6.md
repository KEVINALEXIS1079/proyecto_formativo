# README6 - Arquitectura Modular y Estándares de Desarrollo

## 📋 Documentación de Módulos Users y Profile

### Módulo Users (Backend + Frontend)

El módulo de Users implementa la gestión completa de usuarios con una arquitectura modular y separación de responsabilidades.

#### Backend (`backend-agrotech/src/modules/users/`)

**Estructura:**
```
users/
├── controllers/
│   └── users.controller.ts       # Endpoints HTTP + métodos internos para WebSocket
├── services/
│   └── users.service.ts          # Lógica de negocio y validaciones
├── entities/
│   └── usuario.entity.ts         # Entidad TypeORM
├── dtos/
│   ├── user-management.dto.ts    # DTOs para CRUD
│   └── users-do.dto.ts           # DTOs para WebSocket
├── gateways/
│   └── users.gateway.ts          # WebSocket real-time
├── hooks/
│   └── useUsers.ts               # React Query hooks
└── users.module.ts               # Configuración del módulo
```

**Características:**
- ✅ CRUD completo con soft delete
- ✅ Validaciones exhaustivas con mensajes en español
- ✅ Sistema de permisos dinámicos (roles + permisos individuales)
- ✅ Upload de avatares con Multer
- ✅ Filtros avanzados (nombre, email, rol, estado)
- ✅ WebSocket para actualizaciones en tiempo real

#### Frontend (`agrotech-web/src/modules/users/`)

**Estructura:**
```
users/
├── api/
│   └── users.api.ts              # Llamadas HTTP al backend
├── features/
│   ├── UserListFeature.tsx       # Componente principal con tabs
│   ├── PermissionsListFeature.tsx
│   └── RoleListFeature.tsx
├── widgets/
│   ├── UserTable.tsx             # Tabla de usuarios
│   ├── UserForm.tsx              # Formulario crear/editar
│   ├── UserFilters.tsx           # Filtros de búsqueda
│   ├── UserPermissionsManager.tsx
│   └── RolePermissionsManager.tsx(componentes grandes)
| 
|
|
|_ui/
│   └── PillToggle.tsx
│   └── Button.tsx
│   └── Dialog.tsx
│   └── Modal.tsx # Componentes pequeños y reutilizables (ej. botones, toggles,modales) 

├── hooks/
│   └── useUsers.ts               # React Query hooks
├── models/
│   ├── types/
│   │   └── user.types.ts         # Interfaces TypeScript
│   └── mappers/
│       └── user.mapper.ts        # Transformación de datos
└── pages/
    └── UsersPage.tsx             # Página principal
```

**Características UI/UX:**
- ✅ Diseño moderno con HeroUI (NextUI)
- ✅ Tabs para Users, Roles y Permissions
- ✅ Modal unificado para crear/editar
- ✅ Filtros en tiempo real
- ✅ Avatar circular en tabla
- ✅ Badges para roles y estados
- ✅ Iconos de acciones (Ver, Editar, Eliminar)
- ✅ Backdrop blur en modales

---

### Módulo Profile (Backend + Frontend)

El módulo de Profile permite a los usuarios gestionar su propia información.

#### Backend (`backend-agrotech/src/modules/users/`)

**Endpoints Profile:**
```typescript
GET    /users/profile/me          # Obtener perfil actual
PATCH  /users/profile/me          # Actualizar perfil
POST   /users/profile/avatar      # Subir avatar
```

**DTOs:**
- `UpdateProfileDto` - Solo campos editables por el usuario
- Validaciones específicas para perfil (teléfono 10 dígitos, etc.)

#### Frontend (`agrotech-web/src/modules/profile/`)

**Estructura:**
```
profile/
├── api/
│   └── profile.api.ts            # Llamadas HTTP
├── features/
│   └── ProfileForm.tsx           # Formulario editable
├── hooks/
│   └── useProfile.ts             # React Query hook
├── models/
│   ├── types/
│   │   └── profile.types.ts
│   └── mappers/
│       └── profile.mapper.ts
├── ui/
│   └── ProfileHeader.tsx         # Header con avatar
└── pages/
    └── ProfilePage.tsx           # Página principal
```

**Características UI/UX:**
- ✅ Modo edición toggle
- ✅ Avatar editable con preview
- ✅ Validación de teléfono (10 dígitos)
- ✅ Botón "Guardando..." durante save
- ✅ Sin reload de página al guardar
- ✅ Cache-busting para avatares

---

## 🎯 PROMPT OBLIGATORIO PARA DESARROLLO MODULAR

**Para: Kilo Code, Codex, Antigravity y cualquier IA trabajando en este proyecto**

### REGLAS OBLIGATORIAS DE ARQUITECTURA

#### 1. Estructura de Carpetas (OBLIGATORIO)

**Backend (NestJS):**
```
modules/[nombre-modulo]/
├── controllers/
│   └── [nombre].controller.ts    # HTTP + métodos para WebSocket
├── services/
│   └── [nombre].service.ts       # Lógica de negocio
├── entities/
│   └── [nombre].entity.ts        # TypeORM entity
├── dtos/
│   ├── create-[nombre].dto.ts
│   ├── update-[nombre].dto.ts
│   └── [nombre]-do.dto.ts        # WebSocket DTOs
├── gateways/
│   └── [nombre].gateway.ts       # WebSocket gateway
└── [nombre].module.ts            # Module config
```

**Frontend (React + TypeScript):**
```
modules/[nombre-modulo]/
├── api/
│   └── [nombre].api.ts           # Axios calls
├── features/
│   └── [Nombre]ListFeature.tsx   # Main component
├── widgets/
│   ├── [Nombre]Table.tsx
│   ├── [Nombre]Form.tsx
│   └── [Nombre]Filters.tsx
├── hooks/
│   └── use[Nombre].ts            # React Query
├── models/
│   ├── types/
│   │   └── [nombre].types.ts
│   └── mappers/
│       └── [nombre].mapper.ts
└── pages/
    └── [Nombre]Page.tsx
```

#### 2. Separación de Responsabilidades (OBLIGATORIO)

**Backend:**
- ❌ **NUNCA** poner lógica de negocio en controllers
- ✅ Controllers solo llaman a services
- ✅ Services contienen toda la lógica
- ✅ DTOs con validaciones exhaustivas
- ✅ Mensajes de error en español

**Frontend:**
- ❌ **NUNCA** llamadas HTTP directas en componentes
- ✅ Usar hooks de React Query (`use[Nombre]`)
- ✅ Separar lógica de presentación
- ✅ Features = lógica + composición
- ✅ Widgets = componentes reutilizables

#### 3. Estándares UI/UX (OBLIGATORIO)

**Diseño Visual:**
```typescript
// ✅ USAR SIEMPRE HeroUI (NextUI)
import { Button, Input, Modal, Table } from "@heroui/react";

// ✅ Colores consistentes
const colors = {
  primary: "primary",    // Azul
  success: "success",    // Verde
  warning: "warning",    // Amarillo
  danger: "danger",      // Rojo
};

// ✅ Iconos de Lucide React
import { Eye, Edit, Trash2, Plus } from "lucide-react";
```

**Modales:**
```typescript
// ✅ SIEMPRE usar backdrop blur
<Modal
  backdrop="blur"
  isOpen={isOpen}
  onClose={onClose}
>
  {/* Contenido */}
</Modal>
```

**Tablas:**
```typescript
// ✅ Avatar circular en primera columna
<Table.Cell>
  <div className="flex items-center gap-3">
    <Avatar src={user.avatarUrl} size="sm" />
    <span>{user.nombre}</span>
  </div>
</Table.Cell>

// ✅ Badges para estados
<Chip color={user.activo ? "success" : "danger"}>
  {user.activo ? "Activo" : "Inactivo"}
</Chip>

// ✅ Iconos de acciones
<Button isIconOnly size="sm" variant="light">
  <Eye size={18} />
</Button>
```

**Formularios:**
```typescript
// ✅ Validación en tiempo real
<Input
  label="Teléfono"
  maxLength={10}
  isInvalid={!!errors.telefono}
  errorMessage={errors.telefono}
/>

// ✅ Botones con estado de carga
<Button
  color="success"
  isLoading={isSaving}
>
  {isSaving ? "Guardando..." : "Guardar"}
</Button>
```

#### 4. React Query Patterns (OBLIGATORIO)

```typescript
// ✅ Hook personalizado
export const useUsers = () => {
  const queryClient = useQueryClient();

  // Query para listar
  const { data, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getAll(filters),
  });

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado");
    },
  });

  return { data, isLoading, createMutation };
};
```

#### 5. Validaciones Backend (OBLIGATORIO)

```typescript
// ✅ DTOs con class-validator
export class CreateUserDto {
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser texto" })
  nombre: string;

  @IsEmail({}, { message: "Email inválido" })
  correo: string;

  @Matches(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos" })
  telefono: string;
}
```

#### 6. Permisos y Guards (OBLIGATORIO)

```typescript
// ✅ Backend - HTTP
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("usuarios.crear")
@Post()
create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}

// ✅ Backend - WebSocket
@UseGuards(WsJwtGuard, WsPermissionsGuard)
@RequirePermissions("usuarios.ver")
@SubscribeMessage("getUsers")
getUsers() {
  return this.controller.findAll();
}
```

#### 7. Naming Conventions (OBLIGATORIO)

**Backend:**
- Archivos: `kebab-case.ts`
- Clases: `PascalCase`
- Métodos: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

**Frontend:**
- Componentes: `PascalCase.tsx`
- Hooks: `use[Nombre].ts`
- Utils: `camelCase.ts`
- Types: `[nombre].types.ts`

#### 8. Imports Organization (OBLIGATORIO)

```typescript
// ✅ Orden de imports
// 1. React/Next
import { useState, useEffect } from "react";

// 2. Librerías externas
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";

// 3. Alias internos (@/)
import { useUsers } from "@/modules/users/hooks/useUsers";
import { UserTable } from "@/modules/users/widgets/UserTable";

// 4. Relativos
import { UserFilters } from "../widgets/UserFilters";
```

#### 9. Error Handling (OBLIGATORIO)

**Backend:**
```typescript
// ✅ Excepciones específicas
if (!user) {
  throw new NotFoundException("Usuario no encontrado");
}

if (user.correo === dto.correo) {
  throw new BadRequestException("El email ya está en uso");
}
```

**Frontend:**
```typescript
// ✅ Toast notifications
import { toast } from "sonner";

try {
  await createMutation.mutateAsync(data);
  toast.success("Usuario creado exitosamente");
} catch (error) {
  toast.error(error.message || "Error al crear usuario");
}
```

#### 10. TypeScript Strict (OBLIGATORIO)

```typescript
// ❌ NUNCA usar any
const data: any = await fetch();

// ✅ SIEMPRE tipar
interface User {
  id: number;
  nombre: string;
  correo: string;
}

const data: User[] = await fetch();
```

---

## 🚨 CHECKLIST ANTES DE COMMIT

- [ ] ✅ Estructura de carpetas respetada
- [ ] ✅ Separación de responsabilidades correcta
- [ ] ✅ UI/UX consistente con módulo Users
- [ ] ✅ React Query hooks implementados
- [ ] ✅ Validaciones backend con mensajes en español
- [ ] ✅ Guards de permisos aplicados
- [ ] ✅ TypeScript sin `any`
- [ ] ✅ Imports organizados
- [ ] ✅ Error handling con toast
- [ ] ✅ Naming conventions seguidas

---

## 📚 Referencias de Implementación

**Módulos de Referencia:**
- `backend-agrotech/src/modules/users/` - Backend completo
- `agrotech-web/src/modules/users/` - Frontend completo
- `agrotech-web/src/modules/profile/` - Perfil de usuario

**Componentes Clave:**
- `UserListFeature.tsx` - Tabs y modal unificado
- `UserForm.tsx` - Formulario con avatar upload
- `UserTable.tsx` - Tabla con avatares y acciones
- `useUsers.ts` - React Query patterns

---

## ⚠️ ADVERTENCIAS CRÍTICAS

1. **NO ROMPER LA ESTRUCTURA** - Cada módulo debe seguir exactamente el patrón de Users
2. **NO MEZCLAR RESPONSABILIDADES** - Controllers no tienen lógica, Services sí
3. **NO IGNORAR UI/UX** - Todos los módulos deben verse igual
4. **NO USAR `any`** - TypeScript estricto siempre
5. **NO OLVIDAR PERMISOS** - Todos los endpoints protegidos

---

**Este documento es OBLIGATORIO para cualquier desarrollo en el proyecto Agrotech.**
