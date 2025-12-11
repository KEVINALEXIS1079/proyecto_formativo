import { useState, useEffect, useMemo } from 'react';
import { Checkbox, Button, Tabs, Tab, Spinner } from '@heroui/react';
import type { Rol, Permiso } from '../models/types/permissions.types';
import { usePermisos, usePermisosByRol, useSyncPermisosRol } from '../hooks/usePermissions';
import { Shield } from 'lucide-react';

interface RolePermissionsManagerProps {
  rol: Rol;
  readOnly?: boolean;
  onClose: () => void;
}

export const RolePermissionsManager = ({ rol, readOnly = false, onClose }: RolePermissionsManagerProps) => {
  const { data: allPermisos = [] } = usePermisos();
  const { data: rolePermisos = [], isLoading: isLoadingRolePermisos } = usePermisosByRol(rol.id);
  const syncMutation = useSyncPermisosRol();

  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);

  useEffect(() => {
    if (rolePermisos) {
      const newIds = rolePermisos.map((p) => p.id);
      // Prevent infinite loop by checking if ids actually changed
      if (JSON.stringify(newIds.sort()) !== JSON.stringify(selectedPermisos.sort())) {
        setSelectedPermisos(newIds);
      }
    }
  }, [rolePermisos]);

  const handleToggle = (permisoId: number) => {
    if (readOnly) return;
    setSelectedPermisos((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleSave = async () => {
    if (readOnly) return;
    try {
      console.log('Syncing role permissions:', { rolId: rol.id, type: typeof rol.id, permisoIds: selectedPermisos });
      // Sync permissions
      await syncMutation.mutateAsync({ rolId: Number(rol.id), permisoIds: selectedPermisos });

      onClose();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      alert('Error al guardar permisos del rol. Verifique la consola para más detalles.');
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

  if (isLoadingRolePermisos) return (
    <div className="flex justify-center p-4">
      <Spinner color="success" label="Cargando permisos del rol..." />
    </div>
  );

  return (
    <div className="flex flex-col h-[500px]">
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
            const allSelected = permisos.every(p => selectedPermisos.includes(p.id));
            const someSelected = permisos.some(p => selectedPermisos.includes(p.id));
            const isIndeterminate = someSelected && !allSelected;

            const handleSelectAll = () => {
              if (readOnly) return;
              if (allSelected) {
                // Deselect all
                setSelectedPermisos(prev => prev.filter(id => !permisos.find(p => p.id === id)));
              } else {
                // Select all
                const newIds = permisos.map(p => p.id);
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
                    {!readOnly && (
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
                      const isSelected = selectedPermisos.includes(permiso.id);

                      return (
                        <div
                          key={permiso.id}
                          className={`
                            flex items-start gap-3 p-3 rounded-lg border transition-colors
                            ${isSelected
                              ? 'bg-success-50 border-success-200'
                              : 'bg-transparent border-default-200 hover:border-default-300'
                            }
                          `}
                        >
                          <Checkbox
                            isSelected={isSelected}
                            onValueChange={() => handleToggle(permiso.id)}
                            radius="full"
                            size="sm"
                            color="success"
                            className="mt-1"
                            isDisabled={readOnly}
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-success group-data-[selected=true]:border-success",
                            }}
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-default-900">
                              {permiso.accion}
                            </span>
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
