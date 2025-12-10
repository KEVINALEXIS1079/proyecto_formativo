import { Card, CardBody, CardFooter, Chip, Button } from "@heroui/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Epa } from "../models/types";
import { useMemo } from "react";
import { getTipoEpaColor, getTipoEpaIcon } from "../utils/colorUtils";

export default function EpaCard({
  epa,
  onViewDetail,
  onDelete,
}: {
  epa: Epa;
  onViewDetail: (epa: Epa) => void;
  onDelete?: (epa: Epa) => void;
}) {
  const truncateText = (text?: string, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const resolveImageUrl = (src?: string) => {
    if (!src) return null;
    const val = String(src);
    if (/^(data:|blob:|https?:\/\/)/.test(val)) return val;
    const FILES_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const cleanBase = FILES_BASE.replace(/\/+$/, "");
    const rel = val.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
    return `${cleanBase}/${rel}`;
  };

  const imageUrl = useMemo(() => {
    const src = epa.imagenesUrls?.[0];
    return resolveImageUrl(src) || undefined;
  }, [epa.imagenesUrls]);

  const hasRiskMonths = epa.mesesProbables && epa.mesesProbables.length > 0;

  // Usar las funciones de utilidad compartidas
  const getTypeIconComponent = (tipo: string) => {
    const IconComponent = getTipoEpaIcon(tipo);
    return <IconComponent size={14} />;
  };



  const formatMeses = (meses?: number[]) => {
    if (!meses || meses.length === 0) return "No especificado";
    const nombresMeses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return meses
      .map(m => (m >= 1 && m <= 12 ? nombresMeses[m - 1] : m))
      .join(', ');
  };

  return (
    <Card className="w-full h-full group hover:shadow-lg transition-all duration-200 border border-default-200 dark:border-default-100 bg-white dark:bg-zinc-900">
      {/* Header con imagen completa */}
      <div className="relative h-48 w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={epa.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-zinc-600">
              <AlertTriangle size={48} className="opacity-20" />
            </div>
          </div>
        )}
      </div>

      <CardBody className="p-3">
        {/* Nombre y Tipo EPA */}
        <div className="text-left mb-2 flex items-center gap-2">
          <h3 className="font-semibold text-base text-default-900 dark:text-default-100">
            {truncateText(epa.nombre, 50)}
          </h3>
          <Chip
            startContent={getTypeIconComponent(epa.tipoEpa.tipoEpaEnum)}
            variant="flat"
            size="sm"
            className="text-xs font-medium h-5"
            style={{ backgroundColor: getTipoEpaColor(epa.tipoEpa.tipoEpaEnum) }}
          >
            {epa.tipoEpa.nombre}
          </Chip>
        </div>

        {/* Información básica */}
        <div className="space-y-1 text-left">
          <div className="text-xs">
            <span className="font-medium text-default-600 dark:text-default-400">Cultivo afectado:</span> {epa.tipoCultivoEpa.nombre}
          </div>
          {hasRiskMonths && (
            <div className="text-xs">
              <span className="font-medium text-default-600 dark:text-default-400">Meses de riesgo:</span> {formatMeses(epa.mesesProbables)}
            </div>
          )}
        </div>
      </CardBody>

      <CardFooter className="p-3 pt-0">
        <div className="flex gap-1 w-full">
          <Button
            className="flex-1 text-default-700 dark:text-default-300"
            variant="light"
            size="sm"
            onPress={() => onViewDetail(epa)}
          >
            Ver
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              isIconOnly
              onPress={() => onDelete(epa)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}