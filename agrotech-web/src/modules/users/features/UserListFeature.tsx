import { useState, forwardRef, useImperativeHandle } from 'react';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import { UserTable } from '../widgets/UserTable';
import { UserForm } from '../widgets/UserForm';
import { UserPermissionsManager } from '../widgets/UserPermissionsManager';
import { UserFilters } from '../widgets/UserFilters';
import { Modal } from '@/shared/components/ui/Modal';
import { DeleteModal } from '@/shared/components/ui/DeleteModal';
import type { User, UserFilters as UserFiltersType } from '../models/types/user.types';
import { Tabs, Tab } from "@heroui/react";

export interface UserListRef {
  openCreateModal: () => void;
}

export const UserListFeature = forwardRef<UserListRef>((_, ref) => {
  const [filters, setFilters] = useState<UserFiltersType>({});
  const { data: allUsers = [], isLoading } = useUsers(); // Fetch ALL users without filters
  const updateUserMutation = useUpdateUser();
  
  // Client-side filtering (like Roles and Permissions)
  const users = allUsers.filter((user) => {
    // Filter by search term (q)
    if (filters.q && filters.q.trim() !== '') {
      const searchLower = filters.q.toLowerCase();
      const matchesSearch = 
        user.nombre?.toLowerCase().includes(searchLower) ||
        user.apellido?.toLowerCase().includes(searchLower) ||
        user.correo?.toLowerCase().includes(searchLower) ||
        user.identificacion?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Filter by role
    if (filters.rolId !== undefined && filters.rolId !== null) {
      if (user.rolId !== filters.rolId) return false;
    }
    
    // Filter by status
    if (filters.estado && filters.estado.trim() !== '') {
      if (user.estado?.toLowerCase() !== filters.estado.toLowerCase()) return false;
    }
    
    return true;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [userToToggle, setUserToToggle] = useState<User | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'info' | 'permissions'>('info');

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedUser(undefined);
      setActiveTab('info');
      setIsModalOpen(true);
    },
  }));

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setActiveTab('info');
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user);
    setIsToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (userToToggle) {
      try {
        const newStatus = userToToggle.estado === 'activo' ? 'inactivo' : 'activo';
        // @ts-ignore
        await updateUserMutation.mutateAsync({ id: userToToggle.id, data: { estado: newStatus } });
        setIsToggleModalOpen(false);
        setUserToToggle(undefined);
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Error al cambiar el estado del usuario. Verifique la consola para más detalles.');
      }
    }
  };

  const isActivating = userToToggle?.estado !== 'activo';

  return (
    <div className="flex flex-col">
      <UserFilters filters={filters} onChange={setFilters} />
      
      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleView}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        title={selectedUser ? `Editar Usuario: ${selectedUser.nombre}` : 'Nuevo Usuario'}
        size={selectedUser ? '3xl' : 'lg'}
      >
        {selectedUser ? (
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <Tabs 
                aria-label="Opciones de usuario" 
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
                <Tab key="info" title="Información Personal">
                  <div className="pt-4">
                    <UserForm
                      user={selectedUser}
                      onClose={() => setIsModalOpen(false)}
                      onSuccess={() => setIsModalOpen(false)}
                    />
                  </div>
                </Tab>
                <Tab key="permissions" title="Permisos Extra">
                  <div className="pt-4">
                    <UserPermissionsManager
                      user={selectedUser}
                      onClose={() => setIsModalOpen(false)}
                    />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        ) : (
          <UserForm
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
          setSelectedUser(undefined);
        }}
        title="Detalles del Usuario"
        size="3xl"
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <Tabs 
                aria-label="Opciones de usuario" 
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
                <Tab key="info" title="Información Personal">
                  <div className="pt-4">
                    <UserForm
                      user={selectedUser}
                      readOnly={true}
                      onClose={() => setIsViewModalOpen(false)}
                      onSuccess={() => setIsViewModalOpen(false)}
                    />
                  </div>
                </Tab>
                <Tab key="permissions" title="Permisos Extra">
                  <div className="pt-4">
                    <UserPermissionsManager
                      user={selectedUser}
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
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={isActivating ? "Activar Usuario" : "Desactivar Usuario"}
        description={isActivating 
          ? `¿Estás seguro de activar al usuario ${userToToggle?.nombre}? El usuario podrá acceder al sistema nuevamente.`
          : `¿Estás seguro de desactivar al usuario ${userToToggle?.nombre}? El usuario no podrá acceder al sistema.`
        }
        isLoading={updateUserMutation.isPending}
        confirmText={isActivating ? "Activar" : "Desactivar"}
        confirmColor={isActivating ? "success" : "warning"}
      />
    </div>
  );
});

UserListFeature.displayName = 'UserListFeature';
