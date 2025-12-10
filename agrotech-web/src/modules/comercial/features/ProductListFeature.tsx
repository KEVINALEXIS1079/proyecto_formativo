import { useState, forwardRef, useImperativeHandle } from 'react';
import { useProductos } from '../hooks/useProduction';
import { ProductTable } from '../widgets/ProductTable';
import { ProductForm } from '../widgets/ProductForm';
import { Modal } from '@/shared/components/ui/Modal';
import type { ProductoAgro } from '../models/types/production.types';

export interface ProductListRef {
    openCreateModal: () => void;
}

export const ProductListFeature = forwardRef<ProductListRef>((_, ref) => {
    const { data: products = [], isLoading } = useProductos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductoAgro | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useImperativeHandle(ref, () => ({
        openCreateModal: () => {
            setSelectedProduct(null);
            setIsEditMode(true);
            setIsModalOpen(true);
        },
    }));

    const handleManage = (product: ProductoAgro) => {
        setSelectedProduct(product);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col">
            <ProductTable
                products={products}
                isLoading={isLoading}
                onEdit={handleManage}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                    setIsEditMode(false);
                }}
                title={selectedProduct
                    ? (isEditMode ? `Editar Producto: ${selectedProduct.nombre}` : `Gestionar Producto: ${selectedProduct.nombre}`)
                    : 'Nuevo Producto Agrícola'}
                size="lg"
            >
                <ProductForm
                    product={selectedProduct}
                    readOnly={!isEditMode && !!selectedProduct}
                    onToggleEdit={() => setIsEditMode(true)}
                    onCancel={() => {
                        if (isEditMode && selectedProduct) {
                            setIsEditMode(false);
                        } else {
                            setIsModalOpen(false);
                            setSelectedProduct(null);
                        }
                    }}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
});

ProductListFeature.displayName = 'ProductListFeature';
