import { useState, useEffect, useMemo } from 'react';
import type { User } from '../models/types/user.types';
import type { Permiso } from '../models/types/permissions.types';
import { usePermisos, useUserPermissions, useSyncUserPermissions, usePermisosByRol } from '../hooks/usePermissions';
import { Checkbox, Chip, Button, Tabs, Tab } from "@heroui/react";
import { Shield, Info } from 'lucide-react';

interface UserPermissionsManagerProps {
  user: User;
  onClose: () => void;
  readOnly?: boolean;
}

export const UserPermissionsManager = ({ user, onClose, readOnly = false }: UserPermissionsManagerProps) => {
  const { data: allPermisos = [] } = usePermisos();
  const { data: userPermisos = [], isLoading: isLoadingUserPermisos } = useUserPermissions(user.id);
  // Fetch permissions for the user's role to show what is inherited
  const { data: rolePermisos = [] } = usePermisosByRol(user.rolId || user.rol?.id || null);
  const syncMutation = useSyncUserPermissions();

  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  useEffect(() => {
    if (userPermisos) {
      const newIds = userPermisos.map((p) => p.id);
      // Prevent infinite loop by checking if ids actually changed
      if (JSON.stringify(newIds.sort()) !== JSON.stringify(selectedPermisos.sort())) {
        setSelectedPermisos(newIds);
      }
    }
  }, [userPermisos]);

  const handleToggle = (permisoId: number) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleSave = async () => {
    try {
      console.log('Syncing user permissions:', { userId: user.id, permisoIds: selectedPermisos });
      await syncMutation.mutateAsync({ userId: user.id, permisoIds: selectedPermisos });
      onClose();
    } catch (error) {
      console.error('Error syncing user permissions:', error);
      alert('Error al guardar permisos del usuario. Verifique la consola para más detalles.');
    }
  };

  // Group permissions by module
  const groupedPermisos = useMemo(() => {
    return allPermisos.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {} as Record<string, Permiso[]>);
  }, [allPermisos]);

  if (isLoadingUserPermisos) return <div className="p-4 text-center">Cargando permisos...</div>;

  return (
    <div className="flex flex-col h-[600px]">
      <div className="pb-4 px-1">
        <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg flex gap-3 items-start">
          <Info className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-success-800 dark:text-success-200">
              <p className="font-semibold mb-1">{readOnly ? 'Vista de Permisos' : 'Gestión de Permisos'}</p>
              <div>
                Los permisos marcados con <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px] px-1 mx-1">ROL</Chip> 
                son heredados del rol <strong>{typeof user.rol === 'string' ? user.rol : user.rol?.nombre}</strong>{readOnly ? '.' : ' y no se pueden quitar aquí.'}
                {!readOnly && ' Puedes otorgar permisos adicionales seleccionándolos manualmente.'}
              </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs 
          aria-label="Módulos de permisos" 
          isVertical 
          className="h-full"
          color="success"
          radius="full"
          classNames={{
            tabList: "w-48 p-2 gap-2 bg-default-100 rounded-medium",
            cursor: "bg-success",
            tab: "justify-start h-10 px-4",
            tabContent: "group-data-[selected=true]:text-white font-medium",
            panel: "flex-1 p-4 overflow-y-auto"
          }}
        >
          {Object.entries(groupedPermisos).map(([modulo, permisos]) => {
            // Calculate state for "Select All"
            const nonInheritedPermisos = permisos.filter(p => !rolePermisos.some(rp => rp.id === p.id));
            const allSelected = nonInheritedPermisos.length > 0 && nonInheritedPermisos.every(p => selectedPermisos.includes(p.id));
            const someSelected = nonInheritedPermisos.some(p => selectedPermisos.includes(p.id));
            const isIndeterminate = someSelected && !allSelected;

            const handleSelectAll = () => {
              if (allSelected) {
                // Deselect all non-inherited
                setSelectedPermisos(prev => prev.filter(id => !nonInheritedPermisos.find(p => p.id === id)));
              } else {
                // Select all non-inherited
                const newIds = nonInheritedPermisos.map(p => p.id);
                setSelectedPermisos(prev => [...new Set([...prev, ...newIds])]);
              }
            };

            return (
              <Tab key={modulo} title={<span className="capitalize">{modulo}</span>}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-divider">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-default-500" />
                      <span className="font-semibold capitalize text-default-700">{modulo}</span>
                    </div>
                    {!readOnly && nonInheritedPermisos.length > 0 && (
                      <Checkbox
                        size="sm"
                        isSelected={allSelected}
                        isIndeterminate={isIndeterminate}
                        onValueChange={handleSelectAll}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success group-data-[selected=true]:border-success",
                        }}
                      >
                        <span className="text-small text-default-500">Seleccionar todo</span>
                      </Checkbox>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {permisos.map((permiso) => {
                      const isInherited = rolePermisos.some(rp => rp.id === permiso.id);
                      const isSelected = selectedPermisos.includes(permiso.id);

                      return (
                        <div 
                          key={permiso.id} 
                          className={`
                            flex items-start gap-3 p-3 rounded-lg border transition-colors
                            ${isInherited 
                              ? 'bg-default-100 border-transparent opacity-70' 
                              : isSelected 
                                ? 'bg-success-50 border-success-200' 
                                : 'bg-transparent border-default-200 hover:border-default-300'
                            }
                          `}
                        >
                          <Checkbox
                            isSelected={isInherited || isSelected}
                            isDisabled={readOnly || isInherited}
                            onValueChange={() => !isInherited && handleToggle(permiso.id)}
                            radius="full"
                            size="sm"
                            color="success"
                            className="mt-1"
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-success group-data-[selected=true]:border-success",
                            }}
                          />
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-medium ${isInherited ? 'text-default-600' : 'text-default-900'}`}>
                                {permiso.accion}
                              </span>
                              {isInherited && (
                                <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px] px-1">ROL</Chip>
                              )}
                            </div>
                            <span className="text-xs text-default-400 font-mono">{permiso.clave}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-default-200">
        {readOnly ? (
          <Button
            color="success"
            onPress={onClose}
          >
            Cerrar
          </Button>
        ) : (
          <>
            <Button
              variant="light"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              color="success"
              onPress={handleSave}
              isLoading={syncMutation.isPending}
            >
              {syncMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
