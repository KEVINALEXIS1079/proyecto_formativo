import { Chip, Badge } from "@heroui/react";
import { Check, AlertTriangle, User, Shield } from "lucide-react";

export default function PermisoChip({
  checked,
  label,
  onToggle,
  fuente,
  isRedundant = false
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  fuente?: "usuario" | "rol" | null;
  isRedundant?: boolean;
}) {
  const getFuenteIcon = () => {
    if (fuente === "rol") return <Shield className="h-3 w-3" />;
    if (fuente === "usuario") return <User className="h-3 w-3" />;
    return null;
  };

  const getFuenteLabel = () => {
    if (fuente === "rol") return "Rol";
    if (fuente === "usuario") return "Directo";
    return "";
  };

  const getColor = () => {
    if (isRedundant) return "warning";
    if (checked) return "success";
    return "default";
  };

  const getVariant = () => {
    if (isRedundant) return "solid";
    return checked ? "solid" : "flat";
  };

  return (
    <div className="flex items-center gap-2">
      <Chip
        variant={getVariant()}
        color={getColor()}
        onClick={onToggle}
        className="cursor-pointer select-none"
        startContent={checked ? <Check className="h-3 w-3" /> : undefined}
        endContent={
          fuente ? (
            <Badge
              color={fuente === "rol" ? "primary" : "secondary"}
              variant="flat"
              size="sm"
              className="text-xs px-1 py-0.5"
            >
              {getFuenteIcon()}
              <span className="ml-1">{getFuenteLabel()}</span>
            </Badge>
          ) : null
        }
      >
        {label}
      </Chip>
      {isRedundant && (
        <AlertTriangle className="h-4 w-4 text-warning" />
      )}
    </div>
  );
}
