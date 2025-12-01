import { useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from '../ui/ProfileHeader';
import { ProfileForm } from '../features/ProfileForm';
import { mapProfileToForm } from '../models/mappers/profile.mapper';
import type { UpdateProfileInput } from '../models/types/profile.types';

export function ProfilePage() {
  const { profile, isLoading, isSaving, previewUrl, handleAvatarPick, save } = useProfile();
  const [edit, setEdit] = useState<UpdateProfileInput>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // We need to manage the avatar file state here to pass it to save
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  const onAvatarChange = (file: File) => {
    handleAvatarPick(file);
    setAvatarFile(file);
  };

  const handleSave = async () => {
    try {
      setErrorMessage("");
      await save({ ...edit, avatar: avatarFile });
      setIsEditMode(false);
      setAvatarFile(undefined);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Error al guardar el perfil";
      setErrorMessage(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (profile) {
      setEdit(mapProfileToForm(profile));
    }
    setIsEditMode(false);
    setAvatarFile(undefined);
    setErrorMessage("");
    if (previewUrl) {
      // Clear preview
      handleAvatarPick(null as any);
    }
  };

  useEffect(() => {
    if (!profile) return;
    setEdit(mapProfileToForm(profile));
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="w-full h-[60vh] grid place-items-center">
        <Spinner label="Cargando perfil..." />
      </div>
    );
  }

  const fullName = `${profile.nombre} ${profile.apellido}`.trim();
  
  // Debug: Log avatar data
  console.log('Profile avatar data:', {
    avatarUrl: profile.avatarUrl,
    previewUrl,
    profileId: profile.id
  });
  
  // Use preview if exists, otherwise use backend URL
  const rawSrc = previewUrl || profile.avatarUrl;
  const avatarSrc = rawSrc 
    ? (rawSrc.startsWith('blob:') || rawSrc.startsWith('http') 
        ? rawSrc 
        : `http://localhost:4000${rawSrc.startsWith('/') ? '' : '/'}${rawSrc}`)
    : undefined;
  
  console.log('Computed avatarSrc:', avatarSrc);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <ProfileHeader
        fullName={fullName}
        email={profile.correo}
        roleName={profile.rol?.nombre}
        avatarSrc={avatarSrc}
        onAvatarChange={onAvatarChange}
        isEditMode={isEditMode}
        onEdit={handleEdit}
      />

      <ProfileForm
        values={edit}
        onChange={setEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        isEditMode={isEditMode}
        errorMessage={errorMessage}
      />
    </div>
  );
}
