import { useState, useEffect } from 'react';
import type { ProductoAgro, CreateProductoAgroDto } from '../models/types/production.types';
import { useCreateProducto, useUploadProductoImagen, useUpdateProducto } from '../hooks/useProduction';
import { Input, Select, SelectItem, Button, Textarea } from "@heroui/react";
import { getImageUrl } from "../../production/utils/image-helper";

interface ProductFormProps {
    product?: ProductoAgro | null;
    onClose: () => void;
    onSuccess: () => void;
    readOnly?: boolean;
    onToggleEdit?: () => void;
    onCancel?: () => void;
}

export const ProductForm = ({ product, onClose, onSuccess, readOnly, onToggleEdit, onCancel }: ProductFormProps) => {
    const createMutation = useCreateProducto();
    const updateMutation = useUpdateProducto();
    const uploadMutation = useUploadProductoImagen();

    const [formData, setFormData] = useState<CreateProductoAgroDto>({
        nombre: '',
        unidadBase: 'kg',
        descripcion: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            let productId = product?.id;
            if (product) {
                await updateMutation.mutateAsync({ id: product.id, data: formData });
            } else {
                const newProduct = await createMutation.mutateAsync(formData);
                productId = newProduct.id;
            }

            if (productId && selectedFile) {
                await uploadMutation.mutateAsync({ id: productId, file: selectedFile });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const isLoading = createMutation.isPending || uploadMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {/* Image Preview / Current Image */}
                <div className="flex justify-center mb-4">
                     {product?.imagen ? (
                        <div className="relative">
                            <img 
                                src={getImageUrl(product.imagen)} 
                                alt={product.nombre} 
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            {!readOnly && <p className="text-xs text-center text-gray-500 mt-1">Imagen actual</p>}
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400">
                             Sin imagen
                        </div>
                    )}
                </div>

                <Input
                    label="Nombre del Producto"
                    placeholder="Ej: Tomate Chonto"
                    value={formData.nombre}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, nombre: v }))}
                    isRequired
                    isDisabled={readOnly}
                />

                <Select
                    label="Unidad Base"
                    selectedKeys={[formData.unidadBase]}
                    onSelectionChange={(keys) => setFormData(prev => ({ ...prev, unidadBase: Array.from(keys)[0] as string }))}
                    isRequired
                    isDisabled={readOnly}
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
                    isDisabled={readOnly}
                />
                
                {!readOnly && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Imagen del Producto {product?.imagen ? '(Subir nueva para reemplazar)' : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100
                            "
                        />
                         {selectedFile && <p className="text-xs text-green-600">Archivo seleccionado: {selectedFile.name}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
                {readOnly ? (
                    <>
                        <Button variant="light" onPress={onClose}>
                            Cerrar
                        </Button>
                        <Button color="primary" onPress={onToggleEdit}>
                            Editar
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="light" onPress={onCancel || onClose}>
                            Cancelar
                        </Button>
                        <Button color="success" type="submit" isLoading={isLoading}>
                            Guardar
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
