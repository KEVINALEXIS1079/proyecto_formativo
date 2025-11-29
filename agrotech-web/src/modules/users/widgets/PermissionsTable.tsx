import type { Permiso } from '../models/types/permissions.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { Edit, Trash2, Eye } from 'lucide-react';
import Surface from '../ui/Surface';

interface PermissionsTableProps {
  permisos: Permiso[];
  isLoading: boolean;
  onView?: (permiso: Permiso) => void;
  onEdit?: (permiso: Permiso) => void;
  onDelete?: (permiso: Permiso) => void;
}

export const PermissionsTable = ({ permisos, isLoading, onView, onEdit, onDelete }: PermissionsTableProps) => {
  if (isLoading) {
    return <div className="p-4 text-center">Cargando permisos...</div>;
  }

  if (!permisos.length) {
    return <div className="p-4 text-center text-gray-500">No hay permisos registrados.</div>;
  }

  return (
    <Surface>
      <Table aria-label="Tabla de permisos" removeWrapper className="[&_[data-slot=td]]:py-3">
        <TableHeader>
          <TableColumn>MÓDULO</TableColumn>
          <TableColumn>ACCIÓN</TableColumn>
          <TableColumn>CLAVE</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn align="end">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody items={permisos}>
          {(permiso) => (
            <TableRow key={permiso.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="font-medium text-gray-900">{permiso.modulo}</TableCell>
              <TableCell className="text-gray-500">{permiso.accion}</TableCell>
              <TableCell className="text-gray-500 font-mono text-xs">{permiso.clave}</TableCell>
              <TableCell className="text-gray-500">{permiso.descripcion || '-'}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-gray-600"
                      onPress={() => onView(permiso)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-[#17C964]"
                      onPress={() => onEdit(permiso)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      color="danger"
                      onPress={() => onDelete(permiso)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Surface>
  );
};
