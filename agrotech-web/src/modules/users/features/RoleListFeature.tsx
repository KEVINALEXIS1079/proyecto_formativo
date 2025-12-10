import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { useRoles, useDeleteRol } from "../hooks/usePermissions";
import RoleModal from "../widgets/RoleModal";
import { RoleFilters, type RoleFiltersState } from "../widgets/RoleFilters";
import type { Rol } from "../models/types/permissions.types";

export interface RoleListRef {
  openCreateModal: () => void;
}

export const RoleListFeature = forwardRef<RoleListRef, {}>((_, ref) => {
  const { data: allRoles = [], isLoading } = useRoles();
  const deleteRol = useDeleteRol();

  const [filters, setFilters] = useState<RoleFiltersState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<Rol | null>(null);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      handleCreate();
    }
  }));

  const filteredRoles = useMemo(() => {
    return allRoles.filter(role => {
      if (!filters.q) return true;
      const q = filters.q.toLowerCase();
      return role.nombre.toLowerCase().includes(q) ||
        (role.descripcion && role.descripcion.toLowerCase().includes(q));
    });
  }, [allRoles, filters.q]);

  const handleCreate = () => {
    setSelectedRole(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (rol: Rol) => {
    setSelectedRole(rol);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rol: Rol) => {
    setRoleToDelete(rol);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRol.mutate(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  if (isLoading) return <div>Cargando roles...</div>;

  return (
    <div className="flex flex-col">
      <RoleFilters filters={filters} onChange={setFilters} />

      <Table
        aria-label="Tabla de roles"
        classNames={{
          wrapper: "min-h-[400px] shadow-sm border border-divider rounded-xl",
          th: "bg-default-50 text-default-600 font-medium",
          td: "group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none"
        }}
      >
        <TableHeader>
          <TableColumn>ROL</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn>PERMISOS</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No hay roles registrados."}>
          {filteredRoles.map((rol) => (
            <TableRow key={rol.id}>
              <TableCell>
                <div className="flex flex-col">
                  <p className="font-bold text-medium capitalize">{rol.nombre}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-small text-default-500">{rol.descripcion || "Sin descripción"}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="secondary">
                  {rol.permisos?.length || 0} permisos
                </Chip>
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Editar permisos">
                    <span className="text-lg text-[#17C964] cursor-pointer active:opacity-50 hover:text-[#12A150] transition-colors" onClick={() => handleEdit(rol)}>
                      <Edit size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip color="danger" content="Eliminar rol">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50 hover:text-danger-400 transition-colors" onClick={() => handleDeleteClick(rol)}>
                      <Trash2 size={18} />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roleToEdit={selectedRole}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!roleToDelete} onClose={() => setRoleToDelete(null)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de eliminar el rol <strong>"{roleToDelete?.nombre}"</strong>?
            </p>
            <p className="text-sm text-default-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRoleToDelete(null)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
              isLoading={deleteRol.isPending}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

RoleListFeature.displayName = "RoleListFeature";
