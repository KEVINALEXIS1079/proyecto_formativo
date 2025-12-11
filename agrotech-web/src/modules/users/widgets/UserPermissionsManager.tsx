import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import type { User } from '../models/types/user.types';
import type { Permiso } from '../models/types/permissions.types';
import { usePermisos, useUserPermissions, useSyncUserPermissions, usePermisosByRol } from '../hooks/usePermissions';
import { Checkbox, CheckboxGroup, Chip, Accordion, AccordionItem, ScrollShadow, Spinner } from "@heroui/react";
import { Info } from 'lucide-react';
import { formatModuleName } from '../constants/module-labels';

interface UserPermissionsManagerProps {
  user: User;
  onClose: () => void;
  readOnly?: boolean;
}

export interface UserPermissionsManagerRef {
  save: () => Promise<void>;
}

export const UserPermissionsManager = forwardRef<UserPermissionsManagerRef, UserPermissionsManagerProps>(({ user, onClose, readOnly = false }, ref) => {
  const { data: allPermisos = [] } = usePermisos();
  const { data: userPermisos = [], isLoading: isLoadingUserPermisos } = useUserPermissions(user.id);
  const { data: rolePermisos = [] } = usePermisosByRol(user.rolId || user.rol?.id || null);
  const syncMutation = useSyncUserPermissions();

  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);

  useEffect(() => {
    // Combine role permissions (inherited) + user extra permissions
    const rolePermissionIds = rolePermisos.map(p => String(p.id));
    const userPermissionIds = userPermisos.map(p => String(p.id));
    const allIds = [...new Set([...rolePermissionIds, ...userPermissionIds])];

    setSelectedPermisos(prev => {
      const isSame = prev.length === allIds.length && prev.every(id => allIds.includes(id));
      return isSame ? prev : allIds;
    });
  }, [userPermisos, rolePermisos]);

  const handleSave = async () => {
    try {
      const permisoIds = selectedPermisos.map(Number);
      await syncMutation.mutateAsync({ userId: user.id, permisoIds });
      onClose();
    } catch (error) {
      console.error('Error syncing user permissions:', error);
      alert('Error al guardar permisos del usuario. Verifique la consola para más detalles.');
    }
  };

  // Expose save method to parent via ref
  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  const permisosByModule = useMemo(() => {
    const grouped: Record<string, Permiso[]> = {};
    allPermisos.forEach(p => {
      if (!grouped[p.modulo]) grouped[p.modulo] = [];
      grouped[p.modulo].push(p);
    });
    return grouped;
  }, [allPermisos]);

  const sortedModules = useMemo(() => {
    return Object.keys(permisosByModule).sort((a, b) => {
      const nameA = formatModuleName(a);
      const nameB = formatModuleName(b);
      return nameA.localeCompare(nameB);
    });
  }, [permisosByModule]);

  const handleSelectModule = (modulo: string, isSelected: boolean) => {
    if (readOnly) return;
    const idsInModule = permisosByModule[modulo]
      .filter(p => !rolePermisos.some(rp => rp.id === p.id))
      .map(p => String(p.id));

    if (isSelected) {
      setSelectedPermisos(prev => [...new Set([...prev, ...idsInModule])]);
    } else {
      setSelectedPermisos(prev => prev.filter(id => !idsInModule.includes(id)));
    }
  };

  const isModuleSelected = (modulo: string) => {
    const idsInModule = permisosByModule[modulo]
      .filter(p => !rolePermisos.some(rp => rp.id === p.id))
      .map(p => String(p.id));
    return idsInModule.length > 0 && idsInModule.every(id => selectedPermisos.includes(id));
  };

  const isModuleIndeterminate = (modulo: string) => {
    const idsInModule = permisosByModule[modulo]
      .filter(p => !rolePermisos.some(rp => rp.id === p.id))
      .map(p => String(p.id));
    const selectedCount = idsInModule.filter(id => selectedPermisos.includes(id)).length;
    return selectedCount > 0 && selectedCount < idsInModule.length;
  };

  if (isLoadingUserPermisos) return (
    <div className="flex justify-center p-4">
      <Spinner color="success" label="Cargando permisos..." />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg flex gap-3 items-start">
        <Info className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-success-800 dark:text-success-200">
          <p className="font-semibold mb-1">{readOnly ? 'Vista de Permisos' : 'Gestión de Permisos Extra'}</p>
          <div>
            Los permisos marcados con <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px] px-1 mx-1">ROL</Chip>
            son heredados del rol <strong>{typeof user.rol === 'string' ? user.rol : user.rol?.nombre}</strong>{readOnly ? '.' : ' y no se pueden quitar aquí.'}
            {!readOnly && ' Puedes otorgar permisos adicionales seleccionándolos manualmente.'}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Permisos del Sistema</h3>
        <p className="text-sm text-gray-500 mb-4">Seleccione los permisos adicionales que tendrá este usuario.</p>

        <ScrollShadow className="h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          <Accordion selectionMode="multiple" variant="splitted">
            {sortedModules.map((modulo) => {
              const permisos = permisosByModule[modulo];
              return (
                <AccordionItem
                  key={modulo}
                  aria-label={modulo}
                  title={
                    <div className="flex items-center gap-4">
                      <Checkbox
                        color="success"
                        isSelected={isModuleSelected(modulo)}
                        isIndeterminate={isModuleIndeterminate(modulo)}
                        onValueChange={(v) => handleSelectModule(modulo, v)}
                        onClick={(e) => e.stopPropagation()}
                        isDisabled={readOnly}
                      />
                      <span className="font-semibold text-medium">{formatModuleName(modulo)}</span>
                      <Chip size="sm" variant="flat" color="success">{permisos.length}</Chip>
                    </div>
                  }
                >
                  <CheckboxGroup
                    value={selectedPermisos}
                    onValueChange={readOnly ? undefined : setSelectedPermisos}
                    className="pl-2"
                    classNames={{ wrapper: "grid grid-cols-1 md:grid-cols-2 gap-4" }}
                    orientation="horizontal"
                    isDisabled={readOnly}
                  >
                    {permisos.map(p => {
                      const isInherited = rolePermisos.some(rp => rp.id === p.id);
                      return (
                        <Checkbox
                          color="success"
                          key={p.id}
                          value={String(p.id)}
                          isDisabled={readOnly || isInherited}
                          classNames={{
                            base: `max-w-full w-full bg-content2 hover:bg-content3 m-0 border-2 border-transparent hover:border-success/20 rounded-lg p-3 cursor-pointer transition-colors ${isInherited ? 'opacity-70' : ''}`,
                            label: "w-full"
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{p.accion}</span>
                              {isInherited && (
                                <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px] px-1">ROL</Chip>
                              )}
                            </div>
                            <span className="text-tiny text-default-500 font-mono">{p.clave}</span>
                            {p.descripcion && <span className="text-tiny text-default-400">{p.descripcion}</span>}
                          </div>
                        </Checkbox>
                      );
                    })}
                  </CheckboxGroup>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollShadow>
      </div>
    </div>
  );
});
