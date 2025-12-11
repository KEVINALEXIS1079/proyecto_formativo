import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Checkbox, Tabs, Tab, Card, CardBody } from "@heroui/react";
import { IoTApi } from '../api/iot.api';
import { GeoApi, type Lote } from '../../../shared/api/geo.api';
import type { IoTConfig, TipoSensor } from '../model/iot.types';
import { useGlobalConfigs } from '../hooks/useGlobalConfigs';
import { useSensorTypes } from '../hooks/useSensorTypes';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Server, Thermometer, Radio, Wifi, Globe, MapPin, Hash, User, Lock, Activity, ArrowLeft } from 'lucide-react';

interface GlobalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Refresh parent
}

const defaultConfig: Partial<IoTConfig> = {
  name: '',
  broker: 'test.mosquitto.org',
  port: 1883,
  protocol: 'mqtt',
  topicPrefix: 'agrotech/',
  defaultTopics: ['temperatura', 'humedadAire'],
  customTopics: []
};

export const GlobalConfigModal: React.FC<GlobalConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'configs' | 'sensorTypes'>('configs');
  const [mode, setMode] = useState<'LIST' | 'EDIT'>('LIST');
  const [formData, setFormData] = useState<Partial<IoTConfig>>(defaultConfig);
  const [sensorTypeForm, setSensorTypeForm] = useState<Partial<TipoSensor>>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);

  // Hooks
  const { configs, loading: configsLoading, error: configsError, createConfig, updateConfig, deleteConfig } = useGlobalConfigs();
  const { sensorTypes, loading: typesLoading, createSensorType, updateSensorType, deleteSensorType } = useSensorTypes();

  // Fetch lotes when modal opens
  useEffect(() => {
    if (isOpen) {
      GeoApi.getLotes().then(setLotes).catch(console.error);
    }
  }, [isOpen]);

  const handleAddNew = () => {
    setFormData(defaultConfig);
    setMode('EDIT');
  };

  const handleEdit = (config: IoTConfig) => {
    setFormData(config);
    setMode('EDIT');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro? Esto eliminará todos los sensores asociados a esta configuración.')) return;

    try {
      await deleteConfig(id);
      onSave();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleChange = (key: keyof IoTConfig, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await IoTApi.testConfig(formData);
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Prueba de conexión fallida');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      if (formData.id) {
        await updateConfig(formData.id, formData);
      } else {
        await createConfig(formData);
      }
      setMode('LIST');
      onSave();
    } catch (error) {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  // Sensor Types handlers
  const handleAddNewSensorType = () => {
    setSensorTypeForm({});
    setMode('EDIT');
  };

  const handleEditSensorType = (sensorType: TipoSensor) => {
    setSensorTypeForm(sensorType);
    setMode('EDIT');
  };

  const handleDeleteSensorType = async (id: number) => {
    if (!confirm('¿Está seguro? Esto puede afectar sensores existentes.')) return;

    try {
      await deleteSensorType(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSaveSensorType = async () => {
    if (!sensorTypeForm.nombre || !sensorTypeForm.unidad) {
      toast.error('Nombre y unidad son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (sensorTypeForm.id) {
        await updateSensorType(sensorTypeForm.id, sensorTypeForm);
      } else {
        await createSensorType(sensorTypeForm);
      }
      setMode('LIST');
    } catch (error) {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  // --- Render Lists ---

  const renderConfigsList = () => {
    const loteMap = lotes.reduce((acc, lote) => {
      acc[lote.id] = lote.nombre;
      return acc;
    }, {} as Record<number, string>);

    return (
      <div className="space-y-4">
        {configsError && (
          <div className="text-red-500 p-3 bg-red-50 rounded-lg text-sm border border-red-200">
            Error al cargar configuraciones: {configsError}
          </div>
        )}

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600">Gestione conexiones MQTT y Brokers</p>
          <Button color="success" className="font-medium text-black shadow-sm" startContent={<Plus size={16} />} onPress={handleAddNew} size="sm">
            Nueva Configuración
          </Button>
        </div>

        <Table aria-label="Global Configs" classNames={{ wrapper: "shadow-none border border-gray-200 rounded-lg" }}>
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>BROKER</TableColumn>
            <TableColumn>LOTE</TableColumn>
            <TableColumn align="end">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay configuraciones. Cree una nueva." isLoading={configsLoading}>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <Server size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{config.name || 'Sin Nombre'}</p>
                      <p className="text-tiny text-gray-500">{config.protocol.toUpperCase()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-small font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{config.broker}:{config.port}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {config.loteId ? (
                    <Chip size="sm" variant="flat" color="secondary" startContent={<MapPin size={12} className="ml-1" />}>
                      {loteMap[config.loteId] || `Lote ${config.loteId}`}
                    </Chip>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button isIconOnly size="sm" variant="light" color="default" onPress={() => handleEdit(config)}>
                      <Edit size={16} />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(config.id!)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderSensorTypesList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-600">Defina qué tipos de sensores soporta su sistema</p>
        <Button color="success" className="text-black font-medium shadow-sm" variant="flat" size="sm" startContent={<Plus size={16} />} onPress={handleAddNewSensorType}>
          Nuevo Tipo
        </Button>
      </div>

      <Table aria-label="Sensor Types" classNames={{ wrapper: "shadow-none border border-gray-200 rounded-lg" }}>
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>UNIDAD</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn align="end">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay tipos de sensor." isLoading={typesLoading}>
          {sensorTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Thermometer size={18} />
                  </div>
                  <span className="font-semibold text-gray-900">{type.nombre}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="bordered" className="font-mono font-bold text-gray-600">{type.unidad}</Chip>
              </TableCell>
              <TableCell>
                <span className="text-small text-gray-500">{type.descripcion || '-'}</span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button isIconOnly size="sm" variant="light" color="default" onPress={() => handleEditSensorType(type)}>
                    <Edit size={16} />
                  </Button>
                  <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteSensorType(type.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // --- Render Forms ---

  const [newDefaultTopic, setNewDefaultTopic] = useState('');
  const [newCustomTopic, setNewCustomTopic] = useState('');

  const addTopic = (type: 'default' | 'custom') => {
    if (type === 'default') {
      if (newDefaultTopic && !formData.defaultTopics?.includes(newDefaultTopic)) {
        handleChange('defaultTopics', [...(formData.defaultTopics || []), newDefaultTopic]);
        setNewDefaultTopic('');
      }
    } else {
      if (newCustomTopic && !formData.customTopics?.includes(newCustomTopic)) {
        handleChange('customTopics', [...(formData.customTopics || []), newCustomTopic]);
        setNewCustomTopic('');
      }
    }
  };

  const removeTopic = (type: 'default' | 'custom', topic: string) => {
    if (type === 'default') {
      handleChange('defaultTopics', formData.defaultTopics?.filter(t => t !== topic) || []);
    } else {
      handleChange('customTopics', formData.customTopics?.filter(t => t !== topic) || []);
    }
  };

  const renderConfigForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
      <div className="lg:col-span-2">
        <Input
          label="Nombre de la Configuración"
          placeholder="Ej: Broker Principal"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          isRequired
          variant="bordered"
          labelPlacement="outside"
        />
      </div>

      <div className="space-y-4 lg:col-span-1">
        <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-500" /> Configuración de Conexión
        </h4>
        <Input
          label="URL del Broker (Host)"
          placeholder="test.mosquitto.org"
          value={formData.broker}
          onChange={(e) => handleChange('broker', e.target.value)}
          variant="bordered"
          startContent={<Globe className="text-gray-400 w-4 h-4" />}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Puerto"
            type="number"
            placeholder="1883"
            value={formData.port?.toString()}
            onChange={(e) => handleChange('port', parseInt(e.target.value))}
            variant="bordered"
            startContent={<Hash className="text-gray-400 w-4 h-4" />}
          />
          <Select
            label="Protocolo"
            selectedKeys={formData.protocol ? [formData.protocol] : []}
            onChange={(e) => handleChange('protocol', e.target.value)}
            variant="bordered"
            startContent={<Activity className="text-gray-400 w-4 h-4" />}
          >
            <SelectItem key="mqtt">MQTT</SelectItem>
            <SelectItem key="http">HTTP</SelectItem>
            <SelectItem key="websocket">WebSocket</SelectItem>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Autenticación (Opcional)</h5>
          <Input
            label="Usuario"
            value={formData.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            variant="bordered"
            size="sm"
            startContent={<User className="text-gray-400 w-3 h-3" />}
          />
          <Input
            label="Contraseña"
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            variant="bordered"
            size="sm"
            startContent={<Lock className="text-gray-400 w-3 h-3" />}
          />
        </div>
      </div>

      <div className="space-y-4 lg:col-span-1">
        <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-500" /> Tópicos y Ubicación
        </h4>

        <Input
          label="Prefijo Base (Topic Prefix)"
          placeholder="agrotech/"
          value={formData.topicPrefix}
          onChange={(e) => handleChange('topicPrefix', e.target.value)}
          variant="bordered"
        />

        <Select
          label="Lote Asociado (Opcional)"
          placeholder="Seleccionar lote"
          selectedKeys={formData.loteId ? [String(formData.loteId)] : []}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            handleChange('loteId', isNaN(val) ? null : val);
            handleChange('subLoteId', null);
          }}
          variant="bordered"
          startContent={<MapPin className="text-gray-400 w-4 h-4" />}
        >
          {lotes.map(lote => (
            <SelectItem key={String(lote.id)}>{lote.nombre}</SelectItem>
          ))}
        </Select>
        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <Checkbox
            isSelected={formData.autoDiscover}
            onValueChange={(val) => handleChange('autoDiscover', val)}
            classNames={{ label: "text-sm text-gray-700" }}
          >
            Activar Auto-Discovery
          </Checkbox>
          <p className="text-xs text-gray-500 mt-1 ml-7">Permitir crear sensores automáticamente al recibir datos.</p>
        </div>
      </div>

      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-gray-100">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Tópicos por Defecto</h4>
          <div className="flex gap-2 mb-2">
            <Input size="sm" variant="bordered" placeholder="Nuevo tópico..." value={newDefaultTopic} onChange={(e) => setNewDefaultTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopic('default')} />
            <Button size="sm" isIconOnly onPress={() => addTopic('default')}><Plus size={16} /></Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.defaultTopics?.map(t => (
              <Chip key={t} onClose={() => removeTopic('default', t)} size="sm" variant="flat" color="default">{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Tópicos Personalizados</h4>
          <div className="flex gap-2 mb-2">
            <Input size="sm" variant="bordered" placeholder="Nuevo tópico..." value={newCustomTopic} onChange={(e) => setNewCustomTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopic('custom')} />
            <Button size="sm" isIconOnly onPress={() => addTopic('custom')}><Plus size={16} /></Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.customTopics?.map(t => (
              <Chip key={t} onClose={() => removeTopic('custom', t)} size="sm" variant="flat" color="secondary">{t}</Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSensorTypeForm = () => (
    <div className="flex flex-col gap-6 max-w-lg mx-auto py-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Thermometer className="w-8 h-8 text-success-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Define un Tipo de Sensor</h3>
        <p className="text-sm text-gray-500">Esto permite agrupar y visualizar sensores de la misma naturaleza.</p>
      </div>

      <Card shadow="sm" className="border border-gray-200">
        <CardBody className="gap-4">
          <Input
            label="Nombre"
            placeholder="e.g. Temperatura Ambiente"
            value={sensorTypeForm.nombre || ''}
            onChange={(e) => setSensorTypeForm(prev => ({ ...prev, nombre: e.target.value }))}
            isRequired
            variant="bordered"
          />
          <Input
            label="Unidad"
            placeholder="e.g. °C, %"
            value={sensorTypeForm.unidad || ''}
            onChange={(e) => setSensorTypeForm(prev => ({ ...prev, unidad: e.target.value }))}
            isRequired
            variant="bordered"
          />
          <Input
            label="Descripción"
            placeholder="Detalle opcional..."
            value={sensorTypeForm.descripcion || ''}
            onChange={(e) => setSensorTypeForm(prev => ({ ...prev, descripcion: e.target.value }))}
            variant="bordered"
          />
        </CardBody>
      </Card>
    </div>
  );

  const getHeaderTitle = () => {
    if (mode === 'EDIT') {
      if (activeTab === 'configs') return formData.id ? 'Editar Configuración' : 'Nueva Configuración';
      return sensorTypeForm.id ? 'Editar Tipo de Sensor' : 'Nuevo Tipo de Sensor';
    }
    return 'Administración IoT';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" backdrop="blur">
      <ModalContent className="max-h-[90vh]">
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pb-4">
          {mode === 'EDIT' && (
            <div className="mb-2">
              <Button size="sm" variant="light" startContent={<ArrowLeft size={14} />} onPress={() => setMode('LIST')} className="-ml-2 text-gray-500">Volver a la lista</Button>
            </div>
          )}
          <span className="text-xl font-bold">{getHeaderTitle()}</span>
        </ModalHeader>

        <ModalBody className="p-0 bg-gray-50/30">
          {mode === 'LIST' ? (
            <div className="p-6">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'configs' | 'sensorTypes')}
                variant="underlined"
                color="success"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-success-500",
                  tab: "max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-success-600 font-medium"
                }}
              >
                <Tab key="configs" title={
                  <div className="flex items-center space-x-2">
                    <Server size={18} />
                    <span>Configuraciones</span>
                  </div>
                }>
                  <div className="pt-4">
                    {renderConfigsList()}
                  </div>
                </Tab>
                <Tab key="sensorTypes" title={
                  <div className="flex items-center space-x-2">
                    <Thermometer size={18} />
                    <span>Tipos de Sensor</span>
                  </div>
                }>
                  <div className="pt-4">
                    {renderSensorTypesList()}
                  </div>
                </Tab>
              </Tabs>
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'configs' ? renderConfigForm() : renderSensorTypeForm()}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 bg-white">
          {mode === 'EDIT' ? (
            <>
              <Button color="danger" variant="light" onPress={() => setMode('LIST')}>
                Cancelar
              </Button>
              {activeTab === 'configs' && (
                <Button color="warning" variant="flat" onPress={handleTest} isLoading={testing}>
                  Probar Conexión
                </Button>
              )}
              <Button color="success" className="font-medium text-black shadow-md" onPress={activeTab === 'configs' ? handleSave : handleSaveSensorType} isLoading={saving}>
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button onPress={onClose} variant="flat">
              Cerrar Administrador
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
