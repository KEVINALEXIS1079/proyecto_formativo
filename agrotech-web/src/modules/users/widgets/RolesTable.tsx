import type { Rol } from '../models/types/permissions.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { Edit, Trash2, Eye } from 'lucide-react';
import Surface from '../ui/Surface';

interface RolesTableProps {
  roles: Rol[];
  isLoading: boolean;
  onView?: (rol: Rol) => void;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  onManagePermissions: (rol: Rol) => void;
}

export const RolesTable = ({ roles, isLoading, onView, onEdit, onDelete, onManagePermissions }: RolesTableProps) => {
  if (isLoading) {
    return <div className="p-4 text-center">Cargando roles...</div>;
  }

  if (!roles.length) {
    return <div className="p-4 text-center text-gray-500">No hay roles registrados.</div>;
  }

  return (
    <Surface>
      <Table aria-label="Tabla de roles" removeWrapper className="[&_[data-slot=td]]:py-3">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn align="end">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody items={roles}>
          {(rol) => (
            <TableRow key={rol.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="font-medium text-gray-900">{rol.nombre}</TableCell>
              <TableCell className="text-gray-500">{rol.descripcion || '-'}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-gray-600"
                      onPress={() => onView(rol)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    className="text-[#17C964]"
                    onPress={() => onEdit(rol)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color="danger"
                    onPress={() => onDelete(rol)}
                  >
                    <Trash2 className="h-4 w-4" />
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
