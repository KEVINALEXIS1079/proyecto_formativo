import type { User } from '../models/types/user.types';
import { UserStatusBadge } from '../ui/UserStatusBadge';
import { UserRoleBadge } from '../ui/UserRoleBadge';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Avatar } from "@heroui/react";
import { Eye, Edit, UserX, UserCheck } from 'lucide-react';
import Surface from '../ui/Surface';

import { useRoles } from '../hooks/usePermissions';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onView?: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable = ({ users, isLoading, onView, onEdit, onToggleStatus }: UserTableProps) => {
  const { data: roles } = useRoles();

  if (isLoading) {
    return <div className="p-4 text-center">Cargando usuarios...</div>;
  }

  if (!users.length) {
    return <div className="p-4 text-center text-gray-500">No hay usuarios registrados.</div>;
  }

  // Helper function to get role name from user
  const getRoleName = (user: User): string | undefined => {
    // Priority 1: Direct role object or string
    if (user.rol) {
      if (typeof user.rol === 'string') return user.rol;
      return user.rol.nombre;
    }
    
    // Priority 2: Look up by rolId in fetched roles
    if (user.rolId && roles) {
      const foundRole = roles.find(r => r.id === user.rolId);
      if (foundRole) return foundRole.nombre;
    }

    return undefined;
  };

  return (
    <Surface>
      <Table aria-label="Tabla de usuarios" removeWrapper className="[&_[data-slot=td]]:py-3">
        <TableHeader>
          <TableColumn>USUARIO</TableColumn>
          <TableColumn>CORREO</TableColumn>
          <TableColumn>TELÉFONO</TableColumn>
          <TableColumn>FICHA</TableColumn>
          <TableColumn>ROL</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>ÚLTIMO ACCESO</TableColumn>
          <TableColumn align="end">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatarUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${user.avatarUrl}` : undefined}
                    name={`${user.nombre} ${user.apellido}`}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{user.nombre} {user.apellido}</div>
                    <div className="text-xs text-gray-500">{user.identificacion}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.correo}</TableCell>
              <TableCell>{user.telefono || '-'}</TableCell>
              <TableCell>{user.idFicha || '-'}</TableCell>
              <TableCell>
                <UserRoleBadge roleName={getRoleName(user)} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.estado} />
              </TableCell>
              <TableCell>
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-gray-600"
                      onPress={() => onView(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    className="text-[#17C964]"
                    onPress={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color={user.estado === 'activo' ? "warning" : "success"}
                    onPress={() => onToggleStatus(user)}
                    title={user.estado === 'activo' ? "Desactivar usuario" : "Activar usuario"}
                  >
                    {user.estado === 'activo' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Surface>
  );
};
