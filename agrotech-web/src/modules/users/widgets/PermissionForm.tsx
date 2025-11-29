import { useState, useEffect } from 'react';
import type { Permiso, CreatePermisoDto } from '../models/types/permissions.types';
import { useCreatePermiso, useUpdatePermiso } from '../hooks/usePermissions';
import { Input, Textarea, Button } from "@heroui/react";

interface PermissionFormProps {
  permiso?: Permiso;
  readOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PermissionForm = ({ permiso, readOnly = false, onClose, onSuccess }: PermissionFormProps) => {
  const createPermisoMutation = useCreatePermiso();
  const updatePermisoMutation = useUpdatePermiso();

  const [formData, setFormData] = useState<CreatePermisoDto>({
    modulo: '',
    accion: '',
    clave: '',
    descripcion: '',
  });

  useEffect(() => {
    if (permiso) {
      setFormData({
        modulo: permiso.modulo,
        accion: permiso.accion,
        clave: permiso.clave,
        descripcion: permiso.descripcion || '',
      });
    }
  }, [permiso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    
    try {
      if (permiso) {
        await updatePermisoMutation.mutateAsync({ id: permiso.id, data: formData });
      } else {
        await createPermisoMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isLoading = createPermisoMutation.isPending || updatePermisoMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Módulo"
        name="modulo"
        value={formData.modulo}
        onValueChange={(value) => handleChange('modulo', value)}
        isRequired
        isDisabled={readOnly}
      />

      <Input
        label="Acción"
        name="accion"
        value={formData.accion}
        onValueChange={(value) => handleChange('accion', value)}
        isRequired
        isDisabled={readOnly}
      />

      <Input
        label="Clave"
        name="clave"
        value={formData.clave}
        onValueChange={(value) => handleChange('clave', value)}
        isRequired
        isDisabled={readOnly}
      />

      <Textarea
        label="Descripción"
        name="descripcion"
        value={formData.descripcion}
        onValueChange={(value) => handleChange('descripcion', value)}
        isDisabled={readOnly}
      />

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
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Guardando...' : permiso ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
