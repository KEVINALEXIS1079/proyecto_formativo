import { useState } from "react";
import { Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import { Plus, Calendar, User, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

import { useVentaList } from "../hooks";
import type { VentaFilters } from "../model/types";

export default function VentasListFeature() {
  const { ventas, loading, error, refetch } = useVentaList();
  const [filters, setFilters] = useState<VentaFilters>({});

  const handleFilterChange = (key: keyof VentaFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    refetch(newFilters);
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Ventas</h2>
        <Button
          as={Link}
          to="/finanzas/ventas/crear"
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          className="shadow-sm"
          aria-label="Crear nueva venta"
        >
          Nueva venta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Fecha desde"
              type="date"
              startContent={<Calendar className="h-4 w-4" />}
              value={filters.fecha_desde || ""}
              onChange={(e) => handleFilterChange("fecha_desde", e.target.value)}
            />
            <Input
              label="Fecha hasta"
              type="date"
              startContent={<Calendar className="h-4 w-4" />}
              value={filters.fecha_hasta || ""}
              onChange={(e) => handleFilterChange("fecha_hasta", e.target.value)}
            />
            <Input
              label="Cliente"
              placeholder="Buscar por cliente"
              startContent={<User className="h-4 w-4" />}
              value={filters.cliente || ""}
              onChange={(e) => handleFilterChange("cliente", e.target.value)}
            />
            <Input
              label="ID Cultivo"
              type="number"
              placeholder="ID del cultivo"
              startContent={<Leaf className="h-4 w-4" />}
              value={filters.id_cultivo?.toString() || ""}
              onChange={(e) => handleFilterChange("id_cultivo", parseInt(e.target.value) || undefined)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Lista de Ventas */}
      {loading ? (
        <Card>
          <CardBody className="flex justify-center items-center py-8">
            <Spinner color="success" label="Cargando ventas..." />
          </CardBody>
        </Card>
      ) : ventas.length === 0 ? (
        <Card>
          <CardBody>No se encontraron ventas</CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ventas.map((venta) => (
            <Card key={venta.id_venta_pk} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{venta.cliente_venta}</h3>
                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(venta.fecha_venta).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ${venta.total_venta.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Productos: {venta.detalles.length}
                    </p>
                  </div>
                  <Button
                    as={Link}
                    to={`/finanzas/ventas/${venta.id_venta_pk}`}
                    color="primary"
                    variant="light"
                  >
                    Ver detalle
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}