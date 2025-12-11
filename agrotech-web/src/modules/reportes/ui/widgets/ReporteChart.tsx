import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tabs, Tab } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import type { ReporteCostosRentabilidad } from "../../model/types";
import { Maximize2, BarChart2, PieChart as PieIcon, TrendingUp } from "lucide-react";

interface ReporteChartProps {
  reporte: ReporteCostosRentabilidad;
}

type ChartType = 'bar' | 'pie' | 'area';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ReporteChart({ reporte }: ReporteChartProps) {
  const [activeChart, setActiveChart] = useState<string | null>(null); // 'costos' | 'acumulado' | null
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Datos
  const dataCostos = [
    { name: "Insumos", value: reporte.costo_insumos },
    { name: "Mano de Obra", value: reporte.costo_mano_obra },
    { name: "Maquinaria", value: reporte.costo_maquinaria },
    { name: "Ventas", value: reporte.ingresos_ventas }, // Optional comparisons
  ];

  // Specific for Bar comparison
  const dataBarComparison = [
    {
      name: "Finanzas",
      Insumos: reporte.costo_insumos,
      ManoDeObra: reporte.costo_mano_obra,
      Maquinaria: reporte.costo_maquinaria,
      Ventas: reporte.ingresos_ventas
    }
  ];

  // Trend Data (Simulated for this example as we only have accumulated totals in the type)
  // In a real scenario, this would come from a history array.
  const dataTrend = [
    { periodo: "Ene", costos: 0, ingresos: 0 },
    { periodo: "Feb", costos: reporte.costo_insumos * 0.2, ingresos: reporte.ingresos_ventas * 0.1 },
    { periodo: "Mar", costos: reporte.costo_insumos * 0.5, ingresos: reporte.ingresos_ventas * 0.3 },
    { periodo: "Abr", costos: reporte.costo_insumos * 0.8, ingresos: reporte.ingresos_ventas * 0.6 },
    { periodo: "May", costos: reporte.costo_insumos + reporte.costo_mano_obra, ingresos: reporte.ingresos_ventas },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-semibold text-gray-800 mb-2">{label || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-mono font-medium">${Number(entry.value).toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (type: ChartType, height: number = 300) => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={dataCostos.filter(d => d.name !== 'Ventas')}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dataCostos.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={dataTrend}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="costos" name="Costos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCostos)" />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataBarComparison} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
              <Legend iconType="circle" />
              <Bar dataKey="Insumos" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="ManoDeObra" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Maquinaria" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Costos Breakdown / Comparison */}
        <Card shadow="sm" className="h-full">
          <CardHeader className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-700">Análisis Financiero</h3>
            </div>
            <div className="flex gap-2">
              <Select
                size="sm"
                className="w-32"
                selectedKeys={[chartType]}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                disallowEmptySelection
              >
                <SelectItem key="bar" textValue="Barras">Barras</SelectItem>
                <SelectItem key="pie" textValue="Pastel">Pastel</SelectItem>
              </Select>
              <Button isIconOnly size="sm" variant="light" onPress={() => setActiveChart('costos')}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {renderChart(chartType)}
          </CardBody>
        </Card>

        {/* Chart 2: Trends / Accumulated */}
        <Card shadow="sm" className="h-full">
          <CardHeader className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-700">Tendencia Acumulada</h3>
            </div>
            <Button isIconOnly size="sm" variant="light" onPress={() => setActiveChart('acumulado')}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="costos" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ingresos" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Full Screen Modal */}
      <Modal
        isOpen={!!activeChart}
        onClose={() => setActiveChart(null)}
        size="full"
        classNames={{
          base: "m-0",
          wrapper: "w-full h-full",
          body: "h-full"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b">
                {activeChart === 'costos' ? 'Detalle Completo: Análisis Financiero' : 'Detalle Completo: Tendencia Acumulada'}
              </ModalHeader>
              <ModalBody className="p-6 bg-gray-50">
                <div className="bg-white p-6 rounded-xl shadow-sm h-[80vh] w-full">
                  {activeChart === 'costos' ? (
                    <Tabs aria-label="Chart Types">
                      <Tab key="bar" title={<div className="flex items-center gap-2"><BarChart2 size={16} /> Barras</div>}>
                        <div className="mt-4 h-[70vh]">
                          {renderChart('bar', 600)}
                        </div>
                      </Tab>
                      <Tab key="pie" title={<div className="flex items-center gap-2"><PieIcon size={16} /> Distribución</div>}>
                        <div className="mt-4 h-[70vh]">
                          {renderChart('pie', 600)}
                        </div>
                      </Tab>
                    </Tabs>
                  ) : (
                    <div className="h-full">
                      <div className="flex justify-end mb-4">
                        <Select size="sm" label="Periodo" className="w-40" defaultSelectedKeys={['all']}>
                          <SelectItem key="all">Todo el año</SelectItem>
                          <SelectItem key="q1">Q1</SelectItem>
                        </Select>
                      </div>
                      <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={dataTrend}>
                          <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="periodo" />
                          <YAxis />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                          <Legend />
                          <Area type="monotone" dataKey="ingresos" stroke="#82ca9d" fillOpacity={1} fill="url(#colorIngresos)" />
                          <Area type="monotone" dataKey="costos" stroke="#8884d8" fillOpacity={1} fill="url(#colorCostos)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t bg-white">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar Vista Completa
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}