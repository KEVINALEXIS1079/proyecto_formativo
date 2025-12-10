import {
  Card,
  CardBody,
  Chip,
  Button,
  CardHeader,
  Divider,
  CardFooter,
} from "@heroui/react";
import {
  Calendar,
  Clock4,
  DollarSign,
  HandCoins,
  MapPin,
  Settings,
  Users,
  Package,
} from "lucide-react";
import type { Actividad } from "../models/types";

interface ActividadCardProps {
  actividad: Actividad;
  onGestionar: (actividad: Actividad) => void;
}

export default function ActividadCard({
  actividad,
  onGestionar,
}: ActividadCardProps) {
  const totalInputsCost =
    actividad.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0;
  const totalServicesCost =
    actividad.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0;
  const numParticipants = actividad.responsables?.length || 0;

  // costoManoObra already includes the cost for all participants (calculated by backend)
  const calculatedTotal =
    (actividad.costoManoObra || 0) + totalInputsCost + totalServicesCost;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FINALIZADA":
        return "success";
      case "EN_PROGRESO":
        return "warning";
      case "PENDIENTE":
        return "default";
      default:
        return "default";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "CREACION":
        return "success";
      case "MANTENIMIENTO":
        return "primary";
      case "FINALIZACION":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card
      shadow="sm"
      className="border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white"
    >
      <CardHeader className="flex justify-between items-start gap-3 pb-3 pt-4 px-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {actividad.nombre}
            </h3>
            <Chip
              size="sm"
              color={getStatusColor(actividad.estado || "PENDIENTE")}
              variant="flat"
              className="capitalize shrink-0"
            >
              {actividad.estado || "Pendiente"}
            </Chip>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Chip
              size="sm"
              color={getTipoColor(actividad.tipo)}
              variant="flat"
              className="text-xs"
            >
              {actividad.tipo}
            </Chip>
            <Chip
              size="sm"
              color="default"
              variant="bordered"
              className="text-xs"
            >
              {actividad.subtipo}
            </Chip>
          </div>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="py-3 px-4 gap-3">
        {actividad.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-1">
            {actividad.descripcion}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-700 truncate">
              {new Date(actividad.fecha).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>

          {/* Location */}
          {actividad.lote && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-700 truncate">
                {actividad.lote.nombre}
              </span>
            </div>
          )}

          {/* Hours */}
          <div className="flex items-center gap-2 text-sm">
            <Clock4 className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-gray-700 font-medium">
              {actividad.horasActividad || 0}h
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="text-gray-700 font-medium">
              {numParticipants} {numParticipants === 1 ? "persona" : "personas"}
            </span>
          </div>
        </div>

        <Divider className="my-1" />

        {/* Cost Breakdown */}
        <div className="space-y-2">
          {/* Labor Cost */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Mano de Obra</span>
            </div>
            <span className="font-semibold text-green-700">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(actividad.costoManoObra || 0)}
            </span>
          </div>

          {/* Inputs Cost (if any) */}
          {totalInputsCost > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600">Insumos</span>
              </div>
              <span className="font-semibold text-orange-700">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(totalInputsCost)}
              </span>
            </div>
          )}

          {/* Total Cost */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-800">Total</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(calculatedTotal)}
            </span>
          </div>
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="justify-end pt-3 pb-3 px-4 bg-gray-50">
        <Button
          size="sm"
          color="success"
          variant="flat"
          startContent={<Settings className="w-4 h-4" />}
          onPress={() => onGestionar(actividad)}
          className="font-semibold"
        >
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
