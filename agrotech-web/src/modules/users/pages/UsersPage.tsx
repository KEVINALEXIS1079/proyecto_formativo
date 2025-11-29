import { useState, useRef } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Surface from '../ui/Surface';
import PillToggle from '../ui/PillToggle';
import { UserListFeature } from '../features/UserListFeature';
import type { UserListRef } from '../features/UserListFeature';
import { RoleListFeature } from '../features/RoleListFeature';
import type { RoleListRef } from '../features/RoleListFeature';
import { PermissionsListFeature } from '../features/PermissionsListFeature';
import type { PermissionsListRef } from '../features/PermissionsListFeature';

type Tab = 'users' | 'roles' | 'permissions';

export const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const userListRef = useRef<UserListRef>(null);
  const roleListRef = useRef<RoleListRef>(null);
  const permissionsListRef = useRef<PermissionsListRef>(null);

  const handleAddClick = () => {
    if (activeTab === 'users') {
      userListRef.current?.openCreateModal();
    } else if (activeTab === 'roles') {
      roleListRef.current?.openCreateModal();
    } else if (activeTab === 'permissions') {
      permissionsListRef.current?.openCreateModal();
    }
  };

  const getButtonLabel = () => {
    if (activeTab === 'users') return 'Agregar Usuario';
    if (activeTab === 'roles') return 'Agregar Rol';
    return 'Agregar Permiso';
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestión de usuarios</h1>
        <p className="text-sm opacity-70">Administra usuarios, roles y permisos del sistema</p>
      </div>

      {/* PillToggle y botón de acción en la misma fila */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillToggle value={activeTab} onChange={setActiveTab} />
        <Button
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleAddClick}
        >
          {getButtonLabel()}
        </Button>
      </div>

      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              {activeTab === 'users' && <UserListFeature ref={userListRef} />}
              {activeTab === 'roles' && <RoleListFeature ref={roleListRef} />}
              {activeTab === 'permissions' && <PermissionsListFeature ref={permissionsListRef} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div>
  );
};

