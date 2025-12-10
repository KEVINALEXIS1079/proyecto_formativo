import { useState, useEffect } from 'react';
import type { LoteProduccion, CreateLoteProduccionDto } from '../models/types/production.types';
import { useCreateLoteProduccion, useProductos, useUpdateLoteProduccion } from '../hooks/useProduction';
import { useCultivosList } from '../../cultivos/hooks/useCultivos';
import { Input, Select, SelectItem, Button } from "@heroui/react";

interface LoteFormProps {
    lote?: LoteProduccion | null;
    onClose: () => void;
    onSuccess: () => void;
    readOnly?: boolean;
    onToggleEdit?: () => void;
    onCancel?: () => void;
}

export const LoteForm = ({ lote, onClose, onSuccess, readOnly = false, onToggleEdit, onCancel }: LoteFormProps) => {
    const createMutation = useCreateLoteProduccion();
    const updateMutation = useUpdateLoteProduccion();

    const { data: products = [] } = useProductos();
    const { data: cultivos = [] } = useCultivosList();

    const [formData, setFormData] = useState<CreateLoteProduccionDto>({
        productoAgroId: 0,
        cultivoId: undefined,
        calidad: 'Segunda',
        cantidadKg: 0,
        costoUnitarioKg: 0,
        precioSugeridoKg: 0,
    });

    useEffect(() => {
        if (lote) {
            setFormData({
                productoAgroId: lote.productoAgroId,
                cultivoId: lote.cultivoId,
                calidad: lote.calidad || 'Segunda',
                cantidadKg: lote.cantidadKg,
                costoUnitarioKg: lote.costoUnitarioKg,
                precioSugeridoKg: lote.precioSugeridoKg,
            });
        }
    }, [lote]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (lote) {
                await updateMutation.mutateAsync({
                    id: lote.id,
                    data: {
                        calidad: formData.calidad,
                        precioSugeridoKg: formData.precioSugeridoKg
                        // Note: stock/quantity usually handled by movements, but allowed here if API supports
                    }
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving lote:', error);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const handleCancel = () => {
        if (onCancel) onCancel();
        else onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Producto Agrícola"
                    selectedKeys={formData.productoAgroId ? [String(formData.productoAgroId)] : []}
                    onSelectionChange={(keys) => setFormData(prev => ({ ...prev, productoAgroId: Number(Array.from(keys)[0]) }))}
                    isRequired
                    isDisabled={!!lote || readOnly}
                >
                    {products.map(p => (
                        <SelectItem key={p.id}>{p.nombre}</SelectItem>
                    ))}
                </Select>

                <Select
                    label="Cultivo Origen (Opcional)"
                    selectedKeys={formData.cultivoId ? [String(formData.cultivoId)] : []}
                    onSelectionChange={(keys) => setFormData(prev => ({ ...prev, cultivoId: Number(Array.from(keys)[0]) }))}
                    isDisabled={!!lote || readOnly}
                >
                    {cultivos.map(c => (
                        <SelectItem key={c.id}>{c.nombre || `Cultivo ${c.id}`}</SelectItem>
                    ))}
                </Select>

                <Select
                    label="Calidad"
                    selectedKeys={[formData.calidad || 'Segunda']}
                    onSelectionChange={(keys) => setFormData(prev => ({ ...prev, calidad: Array.from(keys)[0] as string }))}
                    isRequired
                    isDisabled={readOnly}
                >
                    <SelectItem key="Primera">Primera</SelectItem>
                    <SelectItem key="Segunda">Segunda</SelectItem>
                    <SelectItem key="Tercera">Tercera</SelectItem>
                </Select>

                <Input
                    type="number"
                    label="Cantidad (Kg)"
                    value={String(formData.cantidadKg)}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, cantidadKg: Number(v) }))}
                    isRequired
                    isDisabled={!!lote || readOnly} // Usually stock is adjusted via movements
                />

                <Input
                    type="number"
                    label="Costo Unitario (x Kg)"
                    startContent="$"
                    value={String(formData.costoUnitarioKg)}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, costoUnitarioKg: Number(v) }))}
                    isRequired
                    isDisabled={!!lote || readOnly}
                />

                <Input
                    type="number"
                    label="Precio Sugerido (x Kg)"
                    startContent="$"
                    value={String(formData.precioSugeridoKg)}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, precioSugeridoKg: Number(v) }))}
                    isRequired
                    isDisabled={readOnly}
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                {readOnly ? (
                    <>
                        <Button variant="light" onPress={handleCancel}>
                            Cerrar
                        </Button>
                        <Button color="success" className="font-medium text-black" onPress={onToggleEdit}>
                            Editar
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="flat" onPress={handleCancel}>
                            Cancelar
                        </Button>
                        <Button color="success" className="font-medium text-black" type="submit" isLoading={isLoading}>
                            {lote ? "Guardar Cambios" : "Guardar"}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
