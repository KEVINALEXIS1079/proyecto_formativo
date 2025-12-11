import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { Calendar, Download } from "lucide-react";
import { useLotesList } from "../../cultivos/hooks/useLotes";
import { useReporteCostosRentabilidad } from "../hooks/useReportes";
import { ReporteChart } from "../ui/widgets/ReporteChart";

export default function ReporteLotePage() {
  const [loteId, setLoteId] = useState<number | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const { data: lotes = [] } = useLotesList();

  const { data: reporte, isLoading, error } = useReporteCostosRentabilidad({
    id_lote: loteId,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
  });

  const loteOptions = [
    { key: "", label: "Seleccionar lote" },
    ...lotes.map((l) => ({ key: l.id.toString(), label: l.nombre })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Reporte de Costos y Rentabilidad por Lote</h2>
        <Button
          color="primary"
          startContent={<Download className="h-4 w-4" />}
          onPress={() => window.print()}
        >
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Filtros</h3>
        </CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            items={loteOptions}
            selectedKeys={new Set(loteId ? [loteId.toString()] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setLoteId(k === "" ? undefined : Number(k));
            }}
            placeholder="Seleccionar lote"
            variant="bordered"
            label="Lote"
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
            <p>Selecciona un lote y rango de fechas para generar el reporte.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}