import React, { useState } from 'react';
import { Tabs, Tab } from "@heroui/react";
import { Copy, Truck, Package } from "lucide-react";
import CategoriasPage from '../../pages/CategoriasPage';
import ProveedoresPage from '../../pages/ProveedoresPage';
import AlmacenesPage from '../../pages/AlmacenesPage';

const CatalogoTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('categorias');

  return (
    <div>
      <Tabs
        aria-label="Catálogo de inventario"
        variant="underlined"
        classNames={{
          tabList: "gap-6",
          tabContent: "text-base font-semibold",
          cursor: "w-full bg-success",
          tab: "max-w-fit px-0 h-12",
        }}
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        color="success"
      >
        <Tab
          key="categorias"
          title={
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>Categorías</span>
            </div>
          }
        >
          <div>
            <CategoriasPage />
          </div>
        </Tab>
        <Tab
          key="proveedores"
          title={
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Proveedores</span>
            </div>
          }
        >
          <div>
            <ProveedoresPage />
          </div>
        </Tab>
        <Tab
          key="almacenes"
          title={
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Almacenes</span>
            </div>
          }
        >
          <div>
            <AlmacenesPage />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CatalogoTabs;