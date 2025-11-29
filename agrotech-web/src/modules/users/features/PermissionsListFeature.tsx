import { useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from 'lucide-react';
import { usePermisos, useDeletePermiso } from '../hooks/usePermissions';
import { PermissionsTable } from '../widgets/PermissionsTable';
import { PermissionForm } from '../widgets/PermissionForm';
import { Modal } from '@/shared/components/ui/Modal';
import { DeleteModal } from '@/shared/components/ui/DeleteModal';
import Surface from '../ui/Surface';
import SectionTitle from '../ui/SectionTitle';
import type { Permiso } from '../models/types/permissions.types';

export interface PermissionsListRef {
  openCreateModal: () => void;
}

export const PermissionsListFeature = forwardRef<PermissionsListRef>((_, ref) => {
  const { data: permisos = [], isLoading } = usePermisos();
  const deletePermisoMutation = useDeletePermiso();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | undefined>(undefined);
  const [permisoToDelete, setPermisoToDelete] = useState<Permiso | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedPermiso(undefined);
      setIsModalOpen(true);
    },
  }));

  // Extract unique modules
  const modules = Array.from(new Set(permisos.map((p) => p.modulo))).sort();

  const filteredPermisos = permisos.filter((permiso) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      permiso.modulo.toLowerCase().includes(term) ||
      permiso.accion.toLowerCase().includes(term) ||
      permiso.clave.toLowerCase().includes(term);
    
    const matchesModule = selectedModule ? permiso.modulo === selectedModule : true;

    return matchesSearch && matchesModule;
  });

  const handleEdit = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsModalOpen(true);
  };

  const handleView = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (permiso: Permiso) => {
    setPermisoToDelete(permiso);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (permisoToDelete) {
      await deletePermisoMutation.mutateAsync(permisoToDelete.id);
      setIsDeleteModalOpen(false);
      setPermisoToDelete(undefined);
    }
  };

  const handleModuleChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    setSelectedModule(value || '');
  };

  return (
    <div className="flex flex-col">
      <Surface className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <SectionTitle>Buscar</SectionTitle>
            <Input
              placeholder="Buscar permisos..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="text-gray-400" size={16} />}
              variant="bordered"
              radius="lg"
              classNames={{
                inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              }}
            />
          </div>

          {/* Module Filter */}
          <div>
            <SectionTitle>Módulo</SectionTitle>
            <Select
              aria-label="Filtrar por módulo"
              placeholder="Todos los módulos"
              selectedKeys={selectedModule ? [selectedModule] : []}
              onSelectionChange={handleModuleChange}
              variant="bordered"
              radius="lg"
              popoverProps={{
                placement: "bottom",
                offset: 8,
                classNames: { content: "max-h-80 overflow-auto" },
              }}
              classNames={{
                trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                value: "text-sm",
                popoverContent: "rounded-xl min-w-[18rem] max-h-80 overflow-auto",
                listbox: "max-h-80 overflow-auto",
              }}
            >
              {modules.map((modulo) => (
                <SelectItem key={modulo} className="text-sm py-2">
                  {modulo}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </Surface>

      <PermissionsTable
        permisos={filteredPermisos}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPermiso ? 'Editar Permiso' : 'Nuevo Permiso'}
      >
        <PermissionForm
          permiso={selectedPermiso}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Permiso"
      >
        {selectedPermiso && (
          <PermissionForm
            permiso={selectedPermiso}
            readOnly={true}
            onClose={() => setIsViewModalOpen(false)}
            onSuccess={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Permiso"
        description={`¿Estás seguro de eliminar el permiso ${permisoToDelete?.clave}? Esta acción no se puede deshacer.`}
        isLoading={deletePermisoMutation.isPending}
      />
    </div>
  );
});

PermissionsListFeature.displayName = 'PermissionsListFeature';
