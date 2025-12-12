import { useState, useRef } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Surface from '../../users/ui/Surface';
import InventarioPillToggle from '../ui/InventarioPillToggle';
// import { StockAlertBell } from '../ui/StockAlertBell';
import { InsumoListFeature } from '../features/InsumoListFeature';
import { MovimientoListFeature } from '../features/MovimientoListFeature';
import { ActivosFijosListFeature } from '../features/ActivosFijosListFeature';
import { ReservaListFeature } from '../features/ReservaListFeature';
import type { InsumoListRef } from '../features/InsumoListFeature';
import type { MovimientoListRef } from '../features/MovimientoListFeature';
import type { ActivosFijosListRef } from '../features/ActivosFijosListFeature';
import CatalogoTabs from '../ui/widgets/CatalogoTabs';

type Tab = 'insumos' | 'movimientos' | 'activos-fijos' | 'catalogos' | 'reservas';

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('insumos');
  const insumoListRef = useRef<InsumoListRef>(null);
  const movimientoListRef = useRef<MovimientoListRef>(null);
  const activosFijosListRef = useRef<ActivosFijosListRef>(null);

  const handleCreate = () => {
    if (activeTab === 'insumos' && insumoListRef.current) {
      insumoListRef.current.openCreateModal();
    } else if (activeTab === 'movimientos' && movimientoListRef.current) {
      movimientoListRef.current.openCreateModal();
    } else if (activeTab === 'activos-fijos' && activosFijosListRef.current) {
      activosFijosListRef.current.openCreateModal();
    }
  };

  const getButtonLabel = () => {
    if (activeTab === 'insumos') return 'Nuevo Insumo';
    if (activeTab === 'movimientos') return 'Nuevo Movimiento';
    if (activeTab === 'activos-fijos') return 'Nuevo Activo';
    return 'Nuevo';
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Inventario</h1>
        <p className="text-sm opacity-70">Gestión completa de insumos, activos y movimientos de inventario</p>
      </div>

      {/* PillToggle y botón de acción en la misma fila */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InventarioPillToggle value={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-2">
          {/* <StockAlertBell /> Removed as it is now in main header */}
          {(activeTab === 'insumos' || activeTab === 'movimientos' || activeTab === 'activos-fijos') && (
            <Button
              color="success"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleCreate}
            >
              {getButtonLabel()}
            </Button>
          )}
        </div>
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
              {activeTab === 'insumos' && (
                <InsumoListFeature ref={insumoListRef} />
              )}

              {activeTab === 'activos-fijos' && (
                <ActivosFijosListFeature ref={activosFijosListRef} />
              )}

              {activeTab === 'reservas' && (
                <ReservaListFeature />
              )}

              {activeTab === 'movimientos' && (
                <MovimientoListFeature ref={movimientoListRef} />
              )}

              {activeTab === 'catalogos' && (
                <CatalogoTabs />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div >
  );
}
