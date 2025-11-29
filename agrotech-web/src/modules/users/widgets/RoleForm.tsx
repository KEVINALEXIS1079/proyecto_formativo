import { useState, useEffect } from 'react';
import { Input, Button } from "@heroui/react";
import { useCreateRol, useUpdateRol } from '../hooks/usePermissions';
import type { Rol } from '../models/types/permissions.types';

interface RoleFormProps {
  rol?: Rol;
  readOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleForm = ({ rol, readOnly = false, onClose, onSuccess }: RoleFormProps) => {
  const createRolMutation = useCreateRol();
  const updateRolMutation = useUpdateRol();
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion || '');
    }
  }, [rol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      if (rol) {
        await updateRolMutation.mutateAsync({
          id: rol.id,
          nombre,
          descripcion,
        });
      } else {
        await createRolMutation.mutateAsync({
          nombre,
          descripcion,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error al guardar el rol. Verifique la consola para más detalles.');
    }
  };

  const isLoading = createRolMutation.isPending || updateRolMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Nombre del Rol"
          value={nombre}
          onValueChange={setNombre}
          isRequired
          isDisabled={readOnly}
        />
      </div>
      <div>
        <Input
          label="Descripción"
          value={descripcion}
          onValueChange={setDescripcion}
          isDisabled={readOnly}
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
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
              type="submit"
              color="success"
              isLoading={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
