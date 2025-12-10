import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Permiso, CreatePermisoDto } from '../models/types/permissions.types';
import { useCreatePermiso, useUpdatePermiso } from '../hooks/usePermissions';
import { Input, Textarea } from "@heroui/react";

interface PermissionFormProps {
  permiso?: Permiso;
  readOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface PermissionFormRef {
  save: () => Promise<void>;
}

export const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(({ permiso, readOnly = false, onSuccess }, ref) => {
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

  // Expose save method to parent via ref
  useImperativeHandle(ref, () => ({
    save: async () => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      await handleSubmit(event as any);
    }
  }));

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
    </form>
  );
});
