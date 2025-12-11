import type { Permiso } from '../models/types/permissions.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Spinner } from "@heroui/react";
import { Trash2, Edit } from 'lucide-react';
import Surface from '../ui/Surface';

interface PermissionsTableProps {
  permisos: Permiso[];
  isLoading: boolean;
  onManage?: (permiso: Permiso) => void;
  onDelete?: (permiso: Permiso) => void;
}

export const PermissionsTable = ({ permisos, isLoading, onManage, onDelete }: PermissionsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner color="success" label="Cargando permisos..." />
      </div>
    );
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
                  {onManage && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-[#17C964]"
                      onPress={() => onManage(permiso)}
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
