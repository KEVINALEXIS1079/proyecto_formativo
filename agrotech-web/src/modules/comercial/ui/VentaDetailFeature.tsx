import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useVentaById } from "../hooks";

interface VentaDetailFeatureProps {
  id: number;
}

export default function VentaDetailFeature({ id }: VentaDetailFeatureProps) {
  const { venta, loading, error } = useVentaById(id);

  if (loading) return (
    <div className="flex justify-center p-4">
      <Spinner color="success" label="Cargando venta..." />
    </div>
  );
  if (error) return <p className="text-red-500">{error}</p>;
  if (!venta) return <p>Venta no encontrada</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          to="/finanzas/ventas"
          variant="light"
          startContent={<ArrowLeft className="h-4 w-4" />}
        >
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalle de Venta</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información General</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Cliente:</strong> {venta.cliente_venta}</p>
              <p><strong>Fecha:</strong> {new Date(venta.fecha_venta).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ${venta.total_venta.toFixed(2)}</p>
            </div>
            {venta.id_cultivo_fk && (
              <div>
                <p><strong>ID Cultivo:</strong> {venta.id_cultivo_fk}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Productos Vendidos</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {venta.detalles.map((detalle: any) => (
              <div key={detalle.id_venta_detalle_pk} className="border rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p><strong>Producto:</strong> {detalle.producto?.nombre_producto || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Cantidad:</strong> {detalle.cantidad}</p>
                  </div>
                  <div>
                    <p><strong>Precio Unitario:</strong> ${detalle.precio_unitario.toFixed(2)}</p>
                  </div>
                  <div>
                    <p><strong>Subtotal:</strong> ${detalle.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}