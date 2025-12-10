import { useState } from "react";
import { Button, Input, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { useProductoList } from "../hooks";
import type { CreateVentaDTO, CreateVentaDetalleDTO } from "../model/types";

interface VentaFormProps {
  onSubmit: (data: CreateVentaDTO) => void;
  loading?: boolean;
}

export default function VentaForm({ onSubmit, loading }: VentaFormProps) {
  const { productos } = useProductoList();
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [idCultivo, setIdCultivo] = useState<number | undefined>();
  const [detalles, setDetalles] = useState<CreateVentaDetalleDTO[]>([]);

  const addDetalle = () => {
    setDetalles([...detalles, { id_producto_fk: 0, cantidad: 1, precio_unitario: 0 }]);
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const updateDetalle = (index: number, field: keyof CreateVentaDetalleDTO, value: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };

    // Si cambia el producto, actualizar precio
    if (field === 'id_producto_fk') {
      const producto = productos.find(p => p.id_producto_pk === value);
      if (producto) {
        newDetalles[index].precio_unitario = producto.precio_producto;
      }
    }

    setDetalles(newDetalles);
  };

  const calculateSubtotal = (detalle: CreateVentaDetalleDTO) => {
    return detalle.cantidad * detalle.precio_unitario;
  };

  const calculateTotal = () => {
    return detalles.reduce((total, detalle) => total + calculateSubtotal(detalle), 0);
  };

  const handleSubmit = () => {
    if (!cliente || detalles.length === 0) return;

    const data: CreateVentaDTO = {
      fecha_venta: fecha,
      cliente_venta: cliente,
      id_cultivo_fk: idCultivo,
      detalles,
    };
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
            />
            <Input
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
            <Input
              label="ID Cultivo (opcional)"
              type="number"
              value={idCultivo?.toString() || ""}
              onChange={(e) => setIdCultivo(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Productos</h3>
            <Button onClick={addDetalle} color="primary" startContent={<Plus className="h-4 w-4" />}>
              Agregar producto
            </Button>
          </div>

          <Table aria-label="Tabla de productos" isVirtualized={false}>
            <TableHeader>
              <TableColumn>Producto</TableColumn>
              <TableColumn>Cantidad</TableColumn>
              <TableColumn>Precio Unitario</TableColumn>
              <TableColumn>Subtotal</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>
            <TableBody items={detalles}>
              {(detalle) => {
                const index = detalles.indexOf(detalle);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        placeholder="Seleccionar producto"
                        selectedKeys={detalle.id_producto_fk ? [detalle.id_producto_fk.toString()] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          updateDetalle(index, 'id_producto_fk', parseInt(selected));
                        }}
                      >
                        {productos.map((producto) => (
                          <SelectItem key={producto.id_producto_pk.toString()}>
                            {producto.nombre_producto}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={detalle.cantidad.toString()}
                        onChange={(e) => updateDetalle(index, 'cantidad', parseInt(e.target.value) || 1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={detalle.precio_unitario.toString()}
                        onChange={(e) => updateDetalle(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>${calculateSubtotal(detalle).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => removeDetalle(index)}
                        color="danger"
                        variant="light"
                        isIconOnly
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <div className="text-right">
              <p className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          color="success"
          isLoading={loading}
          disabled={!cliente || detalles.length === 0}
        >
          Crear Venta
        </Button>
      </div>
    </div>
  );
}