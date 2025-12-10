import { Chip, Button, Avatar } from "@heroui/react";
import { UserRoundCog, Edit } from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  roleName?: string;
  avatarSrc?: string;
  onAvatarChange?: (file: File) => void;
  isEditMode?: boolean;
  onEdit?: () => void;
}

export function ProfileHeader({
  fullName,
  email,
  roleName,
  avatarSrc,
  onAvatarChange,
  isEditMode = false,
  onEdit
}: ProfileHeaderProps) {
  const handleAvatarClick = () => {
    if (!isEditMode || !onAvatarChange) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onAvatarChange(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            src={avatarSrc}
            name={fullName}
            className="w-24 h-24 text-large text-black"
            isBordered
            color="success"
          />
          {isEditMode && onAvatarChange && (
            <Button
              isIconOnly
              size="sm"
              className="absolute -bottom-1 -right-1 bg-success text-black"
              onPress={handleAvatarClick}
              aria-label="Cambiar foto"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            {fullName}
            {roleName && (
              <Chip color="success" variant="flat" className="text-black" startContent={<UserRoundCog className="w-3.5 h-3.5" />}>
                {roleName}
              </Chip>
            )}
          </h1>
          <p className="text-default-500">{email}</p>
        </div>
      </div>

      {!isEditMode && onEdit && (
        <Button
          color="success"
          className="text-black font-semibold"
          onPress={onEdit}
          startContent={<Edit className="w-4 h-4" />}
        >
          Editar
        </Button>
      )}
    </div>
  );
}
