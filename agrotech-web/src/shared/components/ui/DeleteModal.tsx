import { Modal } from './Modal';
import { Button } from "@heroui/react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "danger" | "primary" | "success" | "warning" | "default" | "secondary";
}

export const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  isLoading,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  confirmColor = 'danger'
}: DeleteModalProps) => {
  const footer = (
    <div className="flex w-full justify-end gap-2">
      <Button
        variant="light"
        onPress={onClose}
        isDisabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        color={confirmColor}
        onPress={onConfirm}
        isLoading={isLoading}
      >
        {isLoading ? `${confirmText}...` : confirmText}
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={footer}
      size="md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="mt-1">
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
};
