import React, { useState } from 'react';
import { Tabs, Tab } from "@heroui/react";
import CategoriasPage from '../pages/CategoriasPage';
import ProveedoresPage from '../pages/ProveedoresPage';
import AlmacenesPage from '../pages/AlmacenesPage';

const CatalogoTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('categorias');

  return (
    <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
      <Tab key="categorias" title="Categorías">
        <CategoriasPage />
      </Tab>
      <Tab key="proveedores" title="Proveedores">
        <ProveedoresPage />
      </Tab>
      <Tab key="almacenes" title="Almacenes">
        <AlmacenesPage />
      </Tab>
    </Tabs>
  );
};

export default CatalogoTabs;