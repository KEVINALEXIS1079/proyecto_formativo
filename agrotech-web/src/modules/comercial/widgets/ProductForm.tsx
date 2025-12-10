import { useState, useEffect } from 'react';
import type { ProductoAgro, CreateProductoAgroDto } from '../models/types/production.types';
import { useCreateProducto } from '../hooks/useProduction';
import { Input, Select, SelectItem, Button, Textarea } from "@heroui/react";

interface ProductFormProps {
    product?: ProductoAgro | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProductForm = ({ product, onClose, onSuccess }: ProductFormProps) => {
    const createMutation = useCreateProducto();
    // TODO: Add update mutation once implemented in hook

    const [formData, setFormData] = useState<CreateProductoAgroDto>({
        nombre: '',
        unidadBase: 'kg',
        descripcion: '',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre,
                unidadBase: product.unidadBase,
                descripcion: product.descripcion || '',
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (product) {
                // Update logic here
                // await updateMutation.mutateAsync({ id: product.id, data: formData });
                console.log('Update not implemented yet');
            } else {
                await createMutation.mutateAsync(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const isLoading = createMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <Input
                    label="Nombre del Producto"
                    placeholder="Ej: Tomate Chonto"
                    value={formData.nombre}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, nombre: v }))}
                    isRequired
                />

                <Select
                    label="Unidad Base"
                    selectedKeys={[formData.unidadBase]}
                    onSelectionChange={(keys) => setFormData(prev => ({ ...prev, unidadBase: Array.from(keys)[0] as string }))}
                    isRequired
                >
                    <SelectItem key="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem key="g">Gramos (g)</SelectItem>
                    <SelectItem key="lb">Libras (lb)</SelectItem>
                    <SelectItem key="ton">Toneladas (ton)</SelectItem>
                    <SelectItem key="un">Unidades (un)</SelectItem>
                </Select>

                <Textarea
                    label="Descripción"
                    placeholder="Detalles adicionales del producto..."
                    value={formData.descripcion}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, descripcion: v }))}
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="light" onPress={onClose}>
                    Cancelar
                </Button>
                <Button color="success" type="submit" isLoading={isLoading}>
                    Guardar
                </Button>
            </div>
        </form>
    );
};
