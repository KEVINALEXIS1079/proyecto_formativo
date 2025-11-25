import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  title = "No hay datos",
  description = "No se encontraron elementos para mostrar.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-default-900">{title}</h3>
      <p className="text-sm text-default-500 mt-1">{description}</p>
    </div>
  );
}