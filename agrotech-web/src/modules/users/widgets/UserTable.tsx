import type { User } from '../models/types/user.types';
import { UserStatusBadge } from '../ui/UserStatusBadge';
import { UserRoleBadge } from '../ui/UserRoleBadge';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Avatar, Tooltip, Spinner } from "@heroui/react";
import { Edit, UserX, UserCheck } from 'lucide-react';
import Surface from '../ui/Surface';

import { useRoles } from '../hooks/usePermissions';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onManage: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable = ({ users, isLoading, onManage, onToggleStatus }: UserTableProps) => {
  const { data: roles } = useRoles();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner color="success" label="Cargando usuarios..." />
      </div>
    );
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
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Gestionar usuario">
                    <span className="text-lg text-[#17C964] cursor-pointer active:opacity-50 hover:text-[#12A150] transition-colors" onClick={() => onManage(user)}>
                      <Edit size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip color={user.estado === 'activo' ? "warning" : "success"} content={user.estado === 'activo' ? "Desactivar usuario" : "Activar usuario"}>
                    <span
                      className={`text-lg cursor-pointer active:opacity-50 transition-colors ${user.estado === 'activo'
                        ? 'text-warning hover:text-warning-400'
                        : 'text-success hover:text-success-400'
                        }`}
                      onClick={() => onToggleStatus(user)}
                    >
                      {user.estado === 'activo' ? <UserX size={18} /> : <UserCheck size={18} />}
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Surface>
  );
};
