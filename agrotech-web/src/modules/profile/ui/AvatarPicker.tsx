import { useRef } from 'react';
import { Avatar, Button } from '@heroui/react';
import { Camera } from 'lucide-react';

interface AvatarPickerProps {
  src?: string;
  name: string;
  onFileSelect: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarPicker({ src, name, onFileSelect, size = 'lg' }: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  return (
    <div className="relative inline-block">
      <Avatar
        src={src}
        className={`${sizeClasses[size]} text-large`}
        radius="lg"
        showFallback
        name={name}
      />
      <Button
        isIconOnly
        size="sm"
        className="absolute -bottom-2 -right-2"
        onPress={handleClick}
        aria-label="Cambiar foto"
      >
        <Camera className="w-4 h-4" />
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
