import { Card, CardBody, CardFooter, Chip, Button, Tooltip } from "@heroui/react";
import { Eye, Edit, Calendar, AlertTriangle, Leaf } from "lucide-react";
import type { Epa } from "../models/types";
import { useMemo } from "react";

export default function EpaCard({
  epa,
  onViewDetail,
  onEdit,
}: {
  epa: Epa;
  onViewDetail: (epa: Epa) => void;
  onEdit: (epa: Epa) => void;
}) {
  const truncateText = (text?: string, maxLength: number = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const imageUrl = useMemo(() => {
    const src = epa.imagenesUrls?.[0];
    if (!src) return null;
    if (/^(data:|blob:|https?:\/\/)/i.test(src)) return src;
    return `http://localhost:4000/${src.replace(/\\/g, "/").replace(/^\/+/, "")}`;
  }, [epa.imagenesUrls]);

  const hasRiskMonths = epa.mesesProbables && epa.mesesProbables.length > 0;
  const hasSeasons = epa.temporadas && epa.temporadas.length > 0;

  return (
    <Card className="w-full h-full group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-success-200 dark:hover:border-success-800">
      {/* Imagen Header */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={epa.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-default-300">
            <Leaf size={48} />
          </div>
        )}
        
        {/* Badges Flotantes */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Chip
            startContent={epa.tipoEpa.tipoEpaEnum === 'plaga' ? <AlertTriangle size={12} /> : undefined}
            color={epa.tipoEpa.tipoEpaEnum === "enfermedad" ? "danger" : epa.tipoEpa.tipoEpaEnum === "plaga" ? "warning" : "success"}
            variant="solid"
            size="sm"
            className="shadow-sm backdrop-blur-md bg-opacity-90"
          >
            {epa.tipoEpa.nombre}
          </Chip>
        </div>
        
        <div className="absolute top-3 right-3">
             <Chip
                variant="flat"
                size="sm"
                className="bg-white/90 dark:bg-black/60 backdrop-blur-md shadow-sm text-xs font-medium"
              >
                {epa.tipoCultivoEpa.nombre}
              </Chip>
        </div>
      </div>

      <CardBody className="flex flex-col gap-3 p-4">
        {/* Título y Descripción */}
        <div>
          <h3 className="font-bold text-lg text-default-900 line-clamp-1 group-hover:text-success-600 transition-colors">
            {epa.nombre}
          </h3>
          <p className="text-sm text-default-500 line-clamp-2 mt-1 min-h-[2.5rem]">
            {truncateText(epa.descripcion)}
          </p>
        </div>

        {/* Info Extra (Temporada/Riesgo) */}
        {(hasRiskMonths || hasSeasons) && (
            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-divider">
                {hasSeasons && (
                    <Tooltip content={`Temporadas: ${epa.temporadas?.join(", ")}`}>
                        <div className="flex items-center gap-1 text-xs text-default-500">
                            <Calendar size={14} className="text-success-500" />
                            <span className="truncate max-w-[80px]">{epa.temporadas?.[0]}</span>
                            {epa.temporadas && epa.temporadas.length > 1 && <span>+{epa.temporadas.length - 1}</span>}
                        </div>
                    </Tooltip>
                )}
                {hasRiskMonths && (
                    <div className="flex items-center gap-1 text-xs text-default-500 ml-auto">
                        <AlertTriangle size={14} className="text-warning-500" />
                        <span>Riesgo activo</span>
                    </div>
                )}
            </div>
        )}
      </CardBody>

      <CardFooter className="p-3 pt-0 gap-2">
        <Button
          fullWidth
          variant="light"
          size="sm"
          onPress={() => onViewDetail(epa)}
          className="font-medium text-default-600 hover:text-default-900"
        >
          Ver Detalle
        </Button>
        <Button
          isIconOnly
          variant="flat"
          color="primary"
          size="sm"
          onPress={() => onEdit(epa)}
          className="min-w-[32px]"
        >
          <Edit size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}