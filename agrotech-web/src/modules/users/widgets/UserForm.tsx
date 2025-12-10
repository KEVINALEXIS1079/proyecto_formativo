import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { UserStatus } from '../models/types/user.types';
import type { User, CreateUserDto } from '../models/types/user.types';
import { useCreateUser, useUpdateUser, useChangeUserRole, useUploadAvatar } from '../hooks/useUsers';
import { useRoles } from '../hooks/usePermissions';
import { Input, Select, SelectItem, Button, Avatar } from "@heroui/react";
import { Camera } from 'lucide-react';

export interface UserFormRef {
  save: () => Promise<void>;
}

interface UserFormProps {
  user?: User | null;
  readOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToggleEdit?: () => void;
  onCancelEdit?: () => void;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(({ user, readOnly = false, onClose, onSuccess, onToggleEdit, onCancelEdit }, ref) => {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const changeRoleMutation = useChangeUserRole();
  const uploadAvatarMutation = useUploadAvatar();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserDto>({
    nombre: '',
    apellido: '',
    identificacion: '',
    correo: '',
    telefono: '',
    idFicha: '',
    password: '',
    estado: UserStatus.ACTIVO,
    rolId: 5, // Default to Invitado
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        identificacion: user.identificacion,
        correo: user.correo,
        telefono: user.telefono || '',
        idFicha: user.idFicha || '',
        estado: user.estado,
        rolId: user.rolId,
      });
      if (user.avatarUrl) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        setPreviewUrl(`${apiUrl}${user.avatarUrl}`);
      }
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Expose save method to parent via ref
  useImperativeHandle(ref, () => ({
    save: async () => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      await handleSubmit(event as any);
    }
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Helper to clean empty strings
      const cleanData = (data: any) => {
        const cleaned = { ...data };
        if (!cleaned.telefono) delete cleaned.telefono;
        if (!cleaned.idFicha) delete cleaned.idFicha;
        if (!cleaned.password) delete cleaned.password;
        return cleaned;
      };

      let userId = user?.id;

      if (user) {
        // Update Profile
        const updateData = cleanData(formData);

        // Remove rolId from updateData as it's handled separately
        // @ts-ignore
        delete updateData.rolId;

        await updateUserMutation.mutateAsync({ id: user.id, data: updateData });

        // Update Role if changed
        if (formData.rolId && formData.rolId !== user.rolId) {
          console.log(`Updating role for user ${user.id} from ${user.rolId} to ${formData.rolId}`);
          await changeRoleMutation.mutateAsync({ id: user.id, rolId: formData.rolId });
        }
      } else {
        // Create
        const createData = cleanData(formData);
        const newUser = await createUserMutation.mutateAsync(createData);
        userId = newUser.id;
      }

      // Upload avatar if selected
      if (userId && selectedFile) {
        await uploadAvatarMutation.mutateAsync({ id: userId, file: selectedFile });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario. Verifique la consola para más detalles.');
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending || changeRoleMutation.isPending || uploadAvatarMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar
            src={previewUrl || undefined}
            className="w-24 h-24 text-large"
            isBordered
            radius="full"
          />
          {!readOnly && (
            <label className="absolute bottom-0 right-0 bg-success text-white p-1.5 rounded-full cursor-pointer hover:bg-success-600 transition-colors shadow-sm">
              <Camera size={16} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <Input
            label="Nombre"
            name="nombre"
            isRequired
            value={formData.nombre}
            onValueChange={(value) => setFormData(prev => ({ ...prev, nombre: value }))}
            isDisabled={readOnly}
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            label="Apellido"
            name="apellido"
            isRequired
            value={formData.apellido}
            onValueChange={(value) => setFormData(prev => ({ ...prev, apellido: value }))}
            isDisabled={readOnly}
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            label="Identificación"
            name="identificacion"
            isRequired
            value={formData.identificacion}
            onValueChange={(value) => setFormData(prev => ({ ...prev, identificacion: value }))}
            isDisabled={readOnly}
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            type="email"
            label="Correo"
            name="correo"
            isRequired
            value={formData.correo}
            onValueChange={(value) => setFormData(prev => ({ ...prev, correo: value }))}
            isDisabled={readOnly}
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onValueChange={(value) => setFormData(prev => ({ ...prev, telefono: value }))}
            isDisabled={readOnly}
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            label="ID Ficha"
            name="idFicha"
            value={formData.idFicha}
            onValueChange={(value) => setFormData(prev => ({ ...prev, idFicha: value }))}
            isDisabled={readOnly}
          />
        </div>

        {!user && !readOnly && (
          <div className="sm:col-span-6">
            <Input
              type="password"
              label="Contraseña"
              name="password"
              isRequired={!user}
              value={formData.password}
              onValueChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              isDisabled={readOnly}
            />
          </div>
        )}

        <div className="sm:col-span-3">
          <Select
            label="Estado"
            selectedKeys={formData.estado ? [formData.estado] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as UserStatus;
              setFormData(prev => ({ ...prev, estado: value }));
            }}
            isDisabled={readOnly}
          >
            <SelectItem key={UserStatus.ACTIVO}>Activo</SelectItem>
            <SelectItem key={UserStatus.INACTIVO}>Inactivo</SelectItem>
            <SelectItem key={UserStatus.BLOQUEADO}>Bloqueado</SelectItem>
            <SelectItem key={UserStatus.PENDIENTE_VERIFICACION}>Pendiente</SelectItem>
          </Select>
        </div>

        <div className="sm:col-span-3">
          <Select
            label="Rol"
            selectedKeys={formData.rolId ? [String(formData.rolId)] : []}
            onSelectionChange={(keys) => {
              const value = Number(Array.from(keys)[0]);
              setFormData(prev => ({ ...prev, rolId: value }));
            }}
            isLoading={isLoadingRoles}
            isDisabled={isLoadingRoles || readOnly}
          >
            {(roles || []).map((rol) => (
              <SelectItem key={rol.id}>
                {rol.nombre}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {readOnly ? (
          <>
            <Button
              variant="flat"
              onPress={onClose}
            >
              Cerrar
            </Button>
            {onToggleEdit && (
              <Button
                color="success"
                className="text-black font-semibold"
                onPress={onToggleEdit}
              >
                Editar
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="light"
              onPress={user && onCancelEdit ? onCancelEdit : onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="success"
              className="text-black font-semibold"
              isLoading={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
});
