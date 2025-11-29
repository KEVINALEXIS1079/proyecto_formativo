import { useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Tabs, Tab } from "@heroui/react";
import { Search } from 'lucide-react';
import { useRoles, useDeleteRol } from '../hooks/usePermissions';
import { RolesTable } from '../widgets/RolesTable';
import { RoleForm } from '../widgets/RoleForm';
import { RolePermissionsManager } from '../widgets/RolePermissionsManager';
import { Modal } from '@/shared/components/ui/Modal';
import { DeleteModal } from '@/shared/components/ui/DeleteModal';
import Surface from '../ui/Surface';
import SectionTitle from '../ui/SectionTitle';
import type { Rol } from '../models/types/permissions.types';

export interface RoleListRef {
  openCreateModal: () => void;
}

export const RoleListFeature = forwardRef<RoleListRef>((_, ref) => {
  const { data: roles = [], isLoading } = useRoles();
  const deleteRolMutation = useDeleteRol();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rolToDelete, setRolToDelete] = useState<Rol | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'permissions'>('info');

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedRol(undefined);
      setActiveTab('info');
      setIsModalOpen(true);
    },
  }));

  const filteredRoles = roles.filter((rol) =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (rol: Rol) => {
    setSelectedRol(rol);
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleView = (rol: Rol) => {
    setSelectedRol(rol);
    setActiveTab('info');
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (rol: Rol) => {
    setRolToDelete(rol);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (rolToDelete) {
      try {
        await deleteRolMutation.mutateAsync(rolToDelete.id);
        setIsDeleteModalOpen(false);
        setRolToDelete(undefined);
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error al eliminar el rol. Puede que tenga usuarios asignados.');
      }
    }
  };

  return (
    <div className="flex flex-col">
      <Surface className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-1 md:col-span-4">
            <SectionTitle>Buscar</SectionTitle>
            <Input
              placeholder="Buscar roles..."
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
        </div>
      </Surface>

      <RolesTable
        roles={filteredRoles}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onManagePermissions={handleEdit}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRol(undefined);
        }}
        title={selectedRol ? `Editar Rol: ${selectedRol.nombre}` : 'Nuevo Rol'}
        size={selectedRol ? '3xl' : 'lg'}
      >
        {selectedRol ? (
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <Tabs 
                aria-label="Opciones de rol" 
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'info' | 'permissions')}
                color="success"
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-[#17C964]",
                  tab: "max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-[#17C964]"
                }}
              >
                <Tab key="info" title="Información General">
                  <div className="pt-4">
                    <RoleForm
                      rol={selectedRol}
                      onClose={() => setIsModalOpen(false)}
                      onSuccess={() => setIsModalOpen(false)}
                    />
                  </div>
                </Tab>
                <Tab key="permissions" title="Permisos">
                  <div className="pt-4">
                    <RolePermissionsManager
                      rol={selectedRol}
                      onClose={() => setIsModalOpen(false)}
                    />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        ) : (
          <RoleForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setIsModalOpen(false)}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRol(undefined);
        }}
        title="Detalles del Rol"
        size="3xl"
      >
        {selectedRol && (
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <Tabs 
                aria-label="Opciones de rol" 
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'info' | 'permissions')}
                color="success"
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-[#17C964]",
                  tab: "max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-[#17C964]"
                }}
              >
                <Tab key="info" title="Información General">
                  <div className="pt-4">
                    <RoleForm
                      rol={selectedRol}
                      readOnly={true}
                      onClose={() => setIsViewModalOpen(false)}
                      onSuccess={() => setIsViewModalOpen(false)}
                    />
                  </div>
                </Tab>
                <Tab key="permissions" title="Permisos">
                  <div className="pt-4">
                    <RolePermissionsManager
                      rol={selectedRol}
                      readOnly={true}
                      onClose={() => setIsViewModalOpen(false)}
                    />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        )}
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Rol"
        description={`¿Estás seguro de eliminar el rol ${rolToDelete?.nombre}? Esta acción no se puede deshacer.`}
        isLoading={deleteRolMutation.isPending}
      />
    </div>
  );
});

RoleListFeature.displayName = 'RoleListFeature';
