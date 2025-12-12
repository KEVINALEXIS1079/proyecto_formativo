import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
} from "@heroui/react";
import { Eye } from "lucide-react";
import VerActividadModal from "../ui/VerActividadModal";

interface HistorialActividadesTableProps {
  actividades: any[];
}

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function HistorialActividadesTable({
  actividades,
}: HistorialActividadesTableProps) {
  const [selectedActividad, setSelectedActividad] = useState<any>(null);

  const columns = [
    { key: "nombre", label: "Nombre Actividad" },
    { key: "descripcion", label: "Descripción" },
    { key: "lote", label: "Lote" },
    { key: "sublote", label: "Sublote" },
    { key: "cultivo", label: "Cultivo" },
    { key: "creador", label: "Creador" },
    { key: "responsables", label: "N° Responsables" },
    { key: "horas", label: "Horas" },
    { key: "valorMO", label: "Valor MO ($/h)" },
    { key: "totalMO", label: "Total MO" },
    { key: "insumos", label: "Insumos" },
    { key: "cantidadInsumos", label: "Cantidad" },
    { key: "valorInsumos", label: "Valor Insumos" },
    { key: "totalInsumos", label: "Total Insumos" },
    { key: "herramientas", label: "Herramientas" },
    { key: "servicios", label: "Servicios" },
    { key: "horasServicios", label: "Horas Servicio" },
    { key: "valorServicios", label: "Servicio ($/h)" },
    { key: "totalServicios", label: "Total Servicios" },
    { key: "totalActividad", label: "Total Actividad" },
    { key: "fecha", label: "Fecha" },
    { key: "acciones", label: "Detalles" },
  ];

  const renderCell = (actividad: any, columnKey: string) => {
    const responsablesCount = actividad.responsables?.length || 0;
    const totalLaborCost = actividad.costoManoObra || 0;
    const totalInputsCost =
      actividad.insumosUso?.reduce(
        (sum: number, i: any) => sum + i.costoTotal,
        0
      ) || 0;
    const totalServicesCost =
      actividad.servicios?.reduce((sum: number, s: any) => sum + s.costo, 0) ||
      0;
    const grandTotal = totalLaborCost + totalInputsCost + totalServicesCost;

    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex flex-col">
            <p className="font-semibold text-sm">{actividad.nombre}</p>
            <div className="flex gap-1 mt-1">
              <Chip size="sm" color="success" variant="flat">
                {actividad.tipo}
              </Chip>
              <Chip size="sm" color="primary" variant="flat">
                {actividad.subtipo}
              </Chip>
            </div>
          </div>
        );

      case "descripcion":
        return (
          <p className="text-sm text-gray-600 max-w-xs truncate">
            {actividad.descripcion || "Sin descripción"}
          </p>
        );

      case "lote":
        return (
          <p className="text-sm font-medium">
            {actividad.lote?.nombre || "N/A"}
          </p>
        );

      case "sublote":
        return <p className="text-sm">{actividad.subLote?.nombre || "N/A"}</p>;

      case "cultivo":
        return (
          <p className="text-sm">{actividad.cultivo?.nombre || "N/A"}</p>
        );

      case "creador":
        return (
          <div className="text-sm">
            <p className="font-medium">
              {actividad.creadoPorUsuario?.nombre}{" "}
              {actividad.creadoPorUsuario?.apellido}
            </p>
            <p className="text-xs text-gray-500">
              {actividad.creadoPorUsuario?.identificacion ||
                actividad.creadoPorUsuarioId}
            </p>
          </div>
        );

      case "responsables":
        return (
          <Chip size="sm" color="secondary" variant="flat">
            {responsablesCount}
          </Chip>
        );

      case "horas":
        return <p className="text-sm">{actividad.horasActividad || 0} hrs</p>;

      case "valorMO":
        return (
          <p className="text-sm">
            {COP.format(actividad.precioHoraActividad || 0)}
          </p>
        );

      case "totalMO":
        return (
          <p className="text-sm font-semibold text-green-700">
            {COP.format(totalLaborCost)}
          </p>
        );

      case "insumos":
        const insumosNames =
          actividad.insumosUso
            ?.map((i: any) => i.insumo?.nombre)
            .filter(Boolean)
            .join(", ") || "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={insumosNames}>
            {insumosNames}
          </p>
        );

      case "cantidadInsumos":
        const cantidades =
          actividad.insumosUso
            ?.map(
              (i: any) => `${i.cantidadUso} ${i.insumo?.unidadUso || "unid"}`
            )
            .join(", ") || "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={cantidades}>
            {cantidades}
          </p>
        );

      case "valorInsumos":
        const valores =
          actividad.insumosUso
            ?.map((i: any) => COP.format(i.costoTotal))
            .join(", ") || "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={valores}>
            {valores}
          </p>
        );

      case "totalInsumos":
        return (
          <p className="text-sm font-semibold text-orange-700">
            {COP.format(totalInputsCost)}
          </p>
        );

      case "herramientas":
        const uniqueTools = new Set<string>();
        // Add planned tools
        actividad.herramientas?.forEach((h: any) => {
          if (h.activoFijo?.nombre) uniqueTools.add(`${h.activoFijo.nombre} (Plan)`);
        });
        // Add used tools
        actividad.usosHerramientas?.forEach((u: any) => {
          if (u.insumo?.nombre) uniqueTools.add(`${u.insumo.nombre} (Uso)`);
        });
        
        const toolsList = Array.from(uniqueTools).join(", ");
        const toolsCount = uniqueTools.size;

        return (
          <div title={toolsList}>
            {toolsCount > 0 ? (
              <Chip size="sm" color="warning" variant="flat">
                {toolsCount} Und
              </Chip>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );

      case "servicios":
        const serviciosNames =
          actividad.servicios?.map((s: any) => s.nombreServicio).join(", ") ||
          "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={serviciosNames}>
            {serviciosNames}
          </p>
        );

      case "horasServicios":
        const horasServ =
          actividad.servicios?.map((s: any) => `${s.horas} hrs`).join(", ") ||
          "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={horasServ}>
            {horasServ}
          </p>
        );

      case "valorServicios":
        const preciosServ =
          actividad.servicios
            ?.map((s: any) => COP.format(s.precioHora))
            .join(", ") || "N/A";
        return (
          <p className="text-sm max-w-xs truncate" title={preciosServ}>
            {preciosServ}
          </p>
        );

      case "totalServicios":
        return (
          <p className="text-sm font-semibold text-blue-700">
            {COP.format(totalServicesCost)}
          </p>
        );

      case "totalActividad":
        return (
          <p className="text-sm font-bold text-green-600">
            {COP.format(grandTotal)}
          </p>
        );

      case "fecha":
        return (
          <p className="text-sm">
            {new Date(actividad.fecha).toLocaleDateString("es-CO")}
          </p>
        );

      case "acciones":
        return (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={() => setSelectedActividad(actividad)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table
          aria-label="Historial de actividades"
          className="min-w-full"
          classNames={{
            wrapper: "shadow-sm border border-gray-200",
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className="bg-gray-50 text-xs font-semibold uppercase"
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={actividades} emptyContent="No hay actividades">
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VerActividadModal
        isOpen={!!selectedActividad}
        onClose={() => setSelectedActividad(null)}
        actividad={selectedActividad}
      />
    </>
  );
}
