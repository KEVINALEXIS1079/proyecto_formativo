import { useState } from 'react';
import type { CreateVentaDto } from '../models/types/sales.types';
import { useCreateVenta, useClientes } from '../hooks/useSales';
import { useLotesProduccion } from '../hooks/useProduction';
import { Input, Select, SelectItem, Button, Card, CardBody, Divider } from "@heroui/react";
import { Plus, Trash, ShoppingCart } from 'lucide-react';

interface SalesFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const SalesForm = ({ onClose, onSuccess }: SalesFormProps) => {
    const createMutation = useCreateVenta();
    const { data: clientes = [] } = useClientes();
    const { data: lotes = [] } = useLotesProduccion(); // All lotes for now

    const [clienteId, setClienteId] = useState<number | undefined>(undefined);

    // Cart Item State
    const [selectedLoteId, setSelectedLoteId] = useState<number | undefined>(undefined);
    const [cantidad, setCantidad] = useState<number>(1);
    const [precio, setPrecio] = useState<number>(0);

    // Cart
    const [cart, setCart] = useState<Array<{
        loteProduccionId: number;
        nombreProducto: string;
        cantidadKg: number;
        precioUnitarioKg: number;
        subtotal: number;
    }>>([]);

    const handleLoteChange = (id: number) => {
        setSelectedLoteId(id);
        const lote = lotes.find(l => l.id === id);
        if (lote) {
            setPrecio(lote.precioSugeridoKg);
        }
    };

    const addToCart = () => {
        if (!selectedLoteId || cantidad <= 0 || precio < 0) return;

        const lote = lotes.find(l => l.id === selectedLoteId);
        if (!lote) return;

        if (lote.stockDisponibleKg < cantidad) {
            alert(`Stock insuficiente. Disponible: ${lote.stockDisponibleKg} kg`);
            return;
        }

        setCart(prev => [...prev, {
            loteProduccionId: selectedLoteId,
            nombreProducto: lote.productoAgro?.nombre || `Lote ${selectedLoteId}`,
            cantidadKg: cantidad,
            precioUnitarioKg: precio,
            subtotal: cantidad * precio
        }]);

        // Reset item inputs
        setSelectedLoteId(undefined);
        setCantidad(1);
        setPrecio(0);
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = subtotal * 0.19; // 19%
    const total = subtotal + iva;

    const handleSubmit = async () => {
        if (cart.length === 0) return;

        try {
            const payload: CreateVentaDto = {
                clienteId,
                detalles: cart.map(item => ({
                    loteProduccionId: item.loteProduccionId,
                    cantidadKg: item.cantidadKg,
                    precioUnitarioKg: item.precioUnitarioKg
                })),
                pagos: [
                    {
                        metodoPago: 'efectivo', // Default for now
                        monto: total
                    }
                ]
            };

            await createMutation.mutateAsync(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error processing sale:', error);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-4">
                <Select
                    label="Cliente"
                    placeholder="Seleccionar cliente (Opcional)"
                    selectedKeys={clienteId ? [String(clienteId)] : []}
                    onSelectionChange={(keys) => setClienteId(Number(Array.from(keys)[0]))}
                >
                    {clientes.map(c => (
                        <SelectItem key={c.id}>{c.nombre}</SelectItem>
                    ))}
                </Select>

                <Card className="bg-gray-50 dark:bg-zinc-800/50">
                    <CardBody className="gap-4">
                        <div className="font-semibold text-sm text-gray-600">Agregar Producto</div>
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-12 md:col-span-5">
                                <Select
                                    label="Producto / Lote"
                                    placeholder="Buscar lote..."
                                    selectedKeys={selectedLoteId ? [String(selectedLoteId)] : []}
                                    onSelectionChange={(keys) => handleLoteChange(Number(Array.from(keys)[0]))}
                                >
                                    {lotes
                                        .filter(l => l.stockDisponibleKg > 0)
                                        .map(l => (
                                            <SelectItem key={l.id} textValue={`${l.productoAgro?.nombre} [${(l.cultivo as any)?.nombre || (l.cultivo as any)?.nombreCultivo || 'Cultivo ' + (l.cultivoId || '?')}] - Stock: ${l.stockDisponibleKg}kg`}>
                                                {l.productoAgro?.nombre} <span className="text-xs text-gray-500">({(l.cultivo as any)?.nombre || (l.cultivo as any)?.nombreCultivo || 'ID:' + l.cultivoId})</span> (Stock: {l.stockDisponibleKg}kg) - ${l.precioSugeridoKg}/kg
                                            </SelectItem>
                                        ))}
                                </Select>
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Input
                                    type="number"
                                    label="Cantidad (Kg)"
                                    value={String(cantidad)}
                                    onValueChange={(v) => setCantidad(Number(v))}
                                />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Input
                                    type="number"
                                    label="Precio/Kg"
                                    startContent="$"
                                    value={String(precio)}
                                    onValueChange={(v) => setPrecio(Number(v))}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-1">
                                <Button isIconOnly color="primary" onPress={addToCart} isDisabled={!selectedLoteId}>
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[200px] border rounded-lg p-2">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ShoppingCart size={40} />
                        <p>El carrito está vacío</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-700">
                                <div>
                                    <div className="font-medium">{item.nombreProducto}</div>
                                    <div className="text-sm text-gray-500">{item.cantidadKg} kg x ${item.precioUnitarioKg.toLocaleString()}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-semibold">${item.subtotal.toLocaleString()}</div>
                                    <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => removeFromCart(index)}>
                                        <Trash size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>IVA (19%):</span>
                    <span>${iva.toLocaleString()}</span>
                </div>
                <Divider />
                <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="light" onPress={onClose}>
                    Cancelar
                </Button>
                <Button
                    color="success"
                    onPress={handleSubmit}
                    isLoading={createMutation.isPending}
                    isDisabled={cart.length === 0}
                    className="w-full md:w-auto font-semibold shadow-md shadow-success/20"
                >
                    Confirmar Venta (${total.toLocaleString()})
                </Button>
            </div>
        </div>
    );
};
