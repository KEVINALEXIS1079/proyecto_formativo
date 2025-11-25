import type { ReactNode } from "react";
import { Button } from "@heroui/react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Error",
  description = "Ocurrió un error inesperado.",
  icon,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-danger">{title}</h3>
      <p className="text-sm text-default-500 mt-1">{description}</p>
      {onRetry && (
        <Button color="primary" variant="flat" className="mt-4" onPress={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}