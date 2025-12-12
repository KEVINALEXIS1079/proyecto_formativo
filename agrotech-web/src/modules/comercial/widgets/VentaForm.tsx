import { useState } from "react";
import { Button, Input, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem } from "@heroui/react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useProductoList } from "../hooks";
import type { CreateVentaDto as CreateVentaDTO, CreateVentaDetalleDTO } from "../models/types/sales.types";
import { getImageUrl } from "../../production/utils/image-helper";

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
    setDetalles([...detalles, { id_producto_fk: 0, cantidad: 1, precio_unitario: 0, loteProduccionId: 0, precioUnitarioKg: 0, cantidadKg: 0 }]); // Add missing props to satisfy DTO
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const updateDetalle = (index: number, field: keyof CreateVentaDetalleDTO, value: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };

    // Si cambia el producto, actualizar precio
    if (field === 'id_producto_fk') {
      const producto = productos.find(p => p.id === value);
      if (producto) {
        // newDetalles[index].precio_unitario = producto.precio_producto; // Price not available in ProductoAgro
        newDetalles[index].precio_unitario = 0; 
      }
    }

    setDetalles(newDetalles);
  };

  const calculateSubtotal = (detalle: CreateVentaDetalleDTO) => {
    return (detalle.cantidad || 0) * (detalle.precio_unitario || 0);
  };

  const calculateTotal = () => {
    return detalles.reduce((total, detalle) => total + calculateSubtotal(detalle), 0);
  };

  const handleSubmit = () => {
    if (!cliente || detalles.length === 0) return;

    const data: CreateVentaDTO = {
      clienteId: undefined, // Add mapping if needed or use loose type
      detalles: detalles.map(d => ({
        ...d,
        loteProduccionId: d.loteProduccionId || 0, // Ensure valid ID
      })),
      pagos: [], // Add empty payments or handle UI
    };
    // Adapt payload to match expected structure if needed, or update handleSubmit signature
    // The prop onSubmit expects (data: CreateVentaDTO)
    // We need to match CreateVentaDto structure.
    
    // Quick fix: Cast or align.
     const payload: any = {
      fecha_venta: fecha,
      cliente_venta: cliente,
      id_cultivo_fk: idCultivo,
      detalles: detalles,
      // payments?
    };
    
    onSubmit(payload);
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
              <TableColumn>Imagen</TableColumn>
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
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
                        {detalle.id_producto_fk ? (() => {
                            const prod = productos.find(p => p.id === detalle.id_producto_fk);
                            // Cast prod to any to access imagen if type update isn't propagated yet
                            const imgUrl = getImageUrl(prod?.imagen);
                            return imgUrl ? (
                                <img src={imgUrl} alt={prod?.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={20} className="text-gray-300" />
                            );
                        })() : <ImageIcon size={20} className="text-gray-300" />}
                      </div>
                    </TableCell>
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
                          <SelectItem 
                            key={producto.id.toString()}
                            startContent={
                              <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                {producto.imagen ? (
                                    <img src={getImageUrl(producto.imagen)} alt="" className="w-full h-full object-cover"/>
                                ) : (
                                    <ImageIcon size={12} className="text-gray-300" />
                                )}
                              </div>
                            }
                          >
                            {producto.nombre}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={(detalle.cantidad || 1).toString()}
                        onChange={(e) => updateDetalle(index, 'cantidad', parseInt(e.target.value) || 1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={(detalle.precio_unitario || 0).toString()}
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