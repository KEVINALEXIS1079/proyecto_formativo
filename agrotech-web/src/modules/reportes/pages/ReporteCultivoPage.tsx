import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import { useCultivosList } from "../../cultivos/hooks/useCultivos";
import { useReporteCostosRentabilidad } from "../hooks/useReportes";
import { ReporteChart } from "../ui/widgets/ReporteChart";
import { downloadCSV } from "@/shared/utils/csvExport";

export default function ReporteCultivoPage() {
  const [cultivoId, setCultivoId] = useState<number | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const { data: cultivos = [] } = useCultivosList({ limit: 100 }); // Obtener todos los cultivos para el select

  const { data: reporte, isLoading, error } = useReporteCostosRentabilidad({
    id_cultivo: cultivoId,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
  });

  const cultivoOptions = [
    { key: "", label: "Seleccionar cultivo" },
    ...cultivos.map((c) => ({ key: c.id.toString(), label: c.nombre })),
  ];

  const handleExportCSV = () => {
    if (!reporte) return;

    const csvData = [{
      cultivo: cultivos.find(c => c.id === cultivoId)?.nombre || 'N/A',
      fecha_desde: fechaDesde || 'N/A',
      fecha_hasta: fechaHasta || 'N/A',
      costo_insumos: reporte.costo_insumos,
      costo_mano_obra: reporte.costo_mano_obra,
      costo_maquinaria: reporte.costo_maquinaria,
      costo_total: reporte.costo_insumos + reporte.costo_mano_obra + reporte.costo_maquinaria,
      ingresos_ventas: reporte.ingresos_ventas,
      utilidad: reporte.utilidad,
      margen_porcentaje: reporte.ingresos_ventas > 0
        ? ((reporte.utilidad / reporte.ingresos_ventas) * 100).toFixed(2)
        : '0'
    }];

    downloadCSV(csvData, `reporte-cultivo-${cultivoId || 'todos'}`);
  };


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Reporte de Costos y Rentabilidad por Cultivo</h2>
        <div className="flex gap-2">
          <Button
            color="success"
            variant="flat"
            startContent={<FileSpreadsheet className="h-4 w-4" />}
            onPress={handleExportCSV}
            isDisabled={!reporte}
          >
            Exportar CSV
          </Button>
          <Button
            color="primary"
            startContent={<Download className="h-4 w-4" />}
            onPress={() => window.print()}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Filtros</h3>
        </CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            items={cultivoOptions}
            selectedKeys={new Set(cultivoId ? [cultivoId.toString()] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setCultivoId(k === "" ? undefined : Number(k));
            }}
            placeholder="Seleccionar cultivo"
            variant="bordered"
            label="Cultivo"
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>

          <Input
            type="date"
            label="Fecha desde"
            placeholder="Fecha desde"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            variant="bordered"
            startContent={<Calendar className="h-4 w-4" />}
          />

          <Input
            type="date"
            label="Fecha hasta"
            placeholder="Fecha hasta"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            variant="bordered"
            startContent={<Calendar className="h-4 w-4" />}
          />
        </CardBody>
      </Card>

      {/* Reporte */}
      {isLoading ? (
        <Card>
          <CardBody>
            <div className="flex justify-center py-4">
              <Spinner color="success" label="Cargando reporte..." />
            </div>
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <CardBody>
            <p className="text-red-500">Error al cargar el reporte: {error.message}</p>
          </CardBody>
        </Card>
      ) : reporte ? (
        <div className="space-y-5">
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card shadow="sm">
              <CardBody>
                <p className="text-sm text-foreground-500">Costo Insumos</p>
                <p className="text-xl font-bold">${reporte.costo_insumos.toLocaleString()}</p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody>
                <p className="text-sm text-foreground-500">Costo Mano de Obra</p>
                <p className="text-xl font-bold">${reporte.costo_mano_obra.toLocaleString()}</p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody>
                <p className="text-sm text-foreground-500">Costo Maquinaria</p>
                <p className="text-xl font-bold">${reporte.costo_maquinaria.toLocaleString()}</p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody>
                <p className="text-sm text-foreground-500">Ingresos Ventas</p>
                <p className="text-xl font-bold text-green-600">${reporte.ingresos_ventas.toLocaleString()}</p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody>
                <p className="text-sm text-foreground-500">Utilidad</p>
                <p className={`text-xl font-bold ${reporte.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reporte.utilidad.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Gráficas */}
          <ReporteChart reporte={reporte} />
        </div>
      ) : (
        <Card>
          <CardBody>
            <p>Selecciona un cultivo y rango de fechas para generar el reporte.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}