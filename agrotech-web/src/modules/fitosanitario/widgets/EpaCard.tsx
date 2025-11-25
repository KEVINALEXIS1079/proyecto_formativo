import { Card, CardBody, CardFooter, CardHeader, Chip, Button } from "@heroui/react";
import { Eye, Edit } from "lucide-react";
import type { Epa } from "../model/types";
import ImagePreview from "../../iot/TipoSensor/ui/ImagePreview";

export default function EpaCard({
  epa,
  onViewDetail,
  onEdit,
}: {
  epa: Epa;
  onViewDetail: (epa: Epa) => void;
  onEdit: (epa: Epa) => void;
}) {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 w-full">
          <ImagePreview src={epa.imagenesUrls?.[0]} size={48} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{epa.nombre}</h3>
            <p className="text-sm text-default-500 truncate">
              {truncateText(epa.descripcion)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Chip color="primary" variant="flat" size="sm">
            {epa.tipoEpa.nombre}
          </Chip>
          <Chip color="secondary" variant="flat" size="sm">
            {epa.tipoCultivoEpa.nombre}
          </Chip>
        </div>
      </CardBody>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="flat"
            size="sm"
            startContent={<Eye size={16} />}
            onPress={() => onViewDetail(epa)}
            className="flex-1"
          >
            Ver detalle
          </Button>
          <Button
            variant="flat"
            color="primary"
            size="sm"
            startContent={<Edit size={16} />}
            onPress={() => onEdit(epa)}
            className="flex-1"
          >
            Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}