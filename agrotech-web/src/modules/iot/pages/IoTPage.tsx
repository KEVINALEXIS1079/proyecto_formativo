import React, { useState } from 'react';
import { useIoTConfig } from '../hooks/useIoTConfig';
import { GlobalConfigModal } from '../widgets/GlobalConfigModal';
import { AddSensorModal } from '../widgets/AddSensorModal';
import { IoTApi } from '../api/iot.api';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button, Spinner } from "@heroui/react";
import { Settings, Plus } from "lucide-react";
import PillToggle from '../ui/PillToggle';
import Surface from '../ui/Surface';

const IoTPage: React.FC = () => {
  const { sensors, loading, refreshSensors, reload } = useIoTConfig();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);
  const [sensorToEdit, setSensorToEdit] = useState<any>(null); // Type as any for now to avoid strict null checks on partials

  const navigate = useNavigate();
  const location = useLocation();

  // Config is now initialized automatically, no forced setup modal

  const handleToggleSensor = async (id: number) => {
    try {
      await IoTApi.toggleSensor(id);
      toast.success('Sensor alternado');
      refreshSensors();
    } catch (error) {
      toast.error('Error al alternar sensor');
    }
  };

  const handleEditSensor = (sensor: any) => {
    setSensorToEdit(sensor);
    setIsAddSensorOpen(true);
  };

  const handleTabChange = (key: "dashboard" | "analytics") => {
    if (key === 'analytics') navigate('/iot/analytics');
    else navigate('/iot');
  };

  // Determine active tab based on path
  // If path is /iot or /iot/, active tab is dashboard
  // If path is /iot/analytics, active tab is analytics
  const currentPath = location.pathname.replace(/\/$/, ''); // remove trailing slash
  const lastSegment = currentPath.split('/').pop();
  const activeTab = lastSegment === 'analytics' ? 'analytics' : 'dashboard';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="success" label="Cargando módulo IoT..." />
      </div>
    );
  }

  const handleDeleteSensor = async (id: number) => {
    try {
      if (!window.confirm('¿Estás seguro de eliminar este sensor? Esta acción también borrará su historial de lecturas.')) return;
      await IoTApi.deleteSensor(id);
      toast.success('Sensor eliminado correctamente');
      refreshSensors();
    } catch (error) {
      console.error('Error removing sensor:', error);
      toast.error('Error al eliminar sensor');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AgroTech – Módulo IoT</h1>
        <p className="text-sm opacity-70">Monitoreo y análisis en tiempo real</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillToggle value={activeTab} onChange={handleTabChange} />
        <div className="flex gap-2">
          {/* "boton de configuracion este a la izquierda" */}
          <Button
            startContent={<Settings size={18} />}
            variant="flat"
            onPress={() => setIsConfigOpen(true)}
          >
            Configuración
          </Button>
          {/* "y el otro [Agregar Sensor] a la derecha" */}
          <Button
            className="font-medium text-black shadow-lg shadow-success/20"
            color="success"
            startContent={<Plus size={18} />}
            onPress={() => {
              setSensorToEdit(null);
              setIsAddSensorOpen(true);
            }}
          >
            Agregar Sensor
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6">
          <Outlet context={{ sensors, refreshSensors, onToggleSensor: handleToggleSensor, onEditSensor: handleEditSensor, onDeleteSensor: handleDeleteSensor }} />
        </div>
      </Surface>

      <GlobalConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={() => {
          reload();
        }}
      />

      <AddSensorModal
        isOpen={isAddSensorOpen}
        onClose={() => setIsAddSensorOpen(false)}
        onSave={refreshSensors}
        sensorToEdit={sensorToEdit}
      />
    </div>
  );
};

export default IoTPage;
