import { useState, useRef } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Surface from '../ui/Surface';
import PillToggle, { type ComercialTab } from '../ui/PillToggle';
import { SalesListFeature } from '../features/SalesListFeature';
import type { SalesListRef } from '../features/SalesListFeature';
import { ClientListFeature } from '../features/ClientListFeature';
import type { ClientListRef } from '../features/ClientListFeature';
import { ProductListFeature } from '../features/ProductListFeature';
import type { ProductListRef } from '../features/ProductListFeature';
import { LoteListFeature } from '../features/LoteListFeature';
import type { LoteListRef } from '../features/LoteListFeature';

export default function ComercialPage() {
  const [activeTab, setActiveTab] = useState<ComercialTab>('ventas');

  const salesListRef = useRef<SalesListRef>(null);
  const clientListRef = useRef<ClientListRef>(null);
  const productListRef = useRef<ProductListRef>(null);
  const loteListRef = useRef<LoteListRef>(null);

  const handleAddClick = () => {
    switch (activeTab) {
      case 'ventas':
        salesListRef.current?.openCreateModal();
        break;
      case 'clientes':
        clientListRef.current?.openCreateModal();
        break;
      case 'productos':
        productListRef.current?.openCreateModal();
        break;
      case 'lotes':
        loteListRef.current?.openCreateModal();
        break;
    }
  };

  const getButtonLabel = () => {
    switch (activeTab) {
      case 'ventas': return 'Nueva Venta';
      case 'clientes': return 'Nuevo Cliente';
      case 'productos': return 'Nuevo Producto';
      case 'lotes': return 'Nuevo Lote';
      default: return 'Agregar';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestión Financiera y Comercial</h1>
        <p className="text-sm opacity-70">Administra ventas, producción, clientes y recursos financieros</p>
      </div>

      {/* PillToggle y botón de acción */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillToggle value={activeTab} onChange={setActiveTab} />
        <Button
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleAddClick}
          className="font-medium text-black shadow-lg shadow-success/20"
        >
          {getButtonLabel()}
        </Button>
      </div>

      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <div className={activeTab === 'ventas' ? 'block' : 'hidden'}>
                <SalesListFeature ref={salesListRef} />
              </div>
              <div className={activeTab === 'clientes' ? 'block' : 'hidden'}>
                <ClientListFeature ref={clientListRef} />
              </div>
              <div className={activeTab === 'productos' ? 'block' : 'hidden'}>
                <ProductListFeature ref={productListRef} />
              </div>
              <div className={activeTab === 'lotes' ? 'block' : 'hidden'}>
                <LoteListFeature ref={loteListRef} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div>
  );
}
