import { Card, CardBody, CardHeader } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import type { ReporteCostosRentabilidad } from "../../model/types";

interface ReporteChartProps {
  reporte: ReporteCostosRentabilidad;
}

export function ReporteChart({ reporte }: ReporteChartProps) {
  // Datos para gráfica de barras: costos vs ingresos
  const dataBarras = [
    {
      name: "Costos",
      Insumos: reporte.costo_insumos,
      "Mano de Obra": reporte.costo_mano_obra,
      Maquinaria: reporte.costo_maquinaria,
    },
    {
      name: "Ingresos",
      Ventas: reporte.ingresos_ventas,
    },
  ];

  // Datos para gráfica de línea: costos acumulados (simulado con un punto)
  const dataLinea = [
    {
      periodo: "Actual",
      acumulado: reporte.costo_insumos + reporte.costo_mano_obra + reporte.costo_maquinaria,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Gráfica de Barras: Costos vs Ingresos */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Costos vs Ingresos</h3>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="Insumos" fill="#8884d8" />
              <Bar dataKey="Mano de Obra" fill="#82ca9d" />
              <Bar dataKey="Maquinaria" fill="#ffc658" />
              <Bar dataKey="Ventas" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Gráfica de Línea: Costos Acumulados */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Costos Acumulados</h3>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataLinea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Costos Acumulados"]} />
              <Legend />
              <Line type="monotone" dataKey="acumulado" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}