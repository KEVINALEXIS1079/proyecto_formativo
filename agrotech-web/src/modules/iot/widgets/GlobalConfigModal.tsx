import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Checkbox, Divider, Tabs, Tab } from "@heroui/react";
import { IoTApi } from '../api/iot.api';
import { GeoApi, type Lote, type SubLote } from '../../../shared/api/geo.api';
import type { IoTConfig, TipoSensor } from '../model/iot.types';
import { useGlobalConfigs } from '../hooks/useGlobalConfigs';
import { useSensorTypes } from '../hooks/useSensorTypes';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Server, Thermometer } from 'lucide-react';

interface GlobalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Refresh parent
}

const defaultConfig: Partial<IoTConfig> = {
  name: 'Nueva Configuración',
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
  const [subLotes, setSubLotes] = useState<SubLote[]>([]);

  // Hooks
  const { configs, loading: configsLoading, error: configsError, createConfig, updateConfig, deleteConfig } = useGlobalConfigs();
  const { sensorTypes, loading: typesLoading, createSensorType, updateSensorType, deleteSensorType } = useSensorTypes();

  // Fetch lotes when modal opens
  useEffect(() => {
    if (isOpen) {
      GeoApi.getLotes().then(setLotes).catch(console.error);
    }
  }, [isOpen]);

  // Fetch sublotes when loteId changes
  useEffect(() => {
    if (formData.loteId) {
      GeoApi.getSubLotes(formData.loteId).then(setSubLotes).catch(console.error);
    } else {
      setSubLotes([]);
    }
  }, [formData.loteId]);

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
      onSave(); // Notify parent to refresh sensors if needed
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

  const renderConfigsList = () => {
    const loteMap = lotes.reduce((acc, lote) => {
      acc[lote.id] = lote.nombre;
      return acc;
    }, {} as Record<number, string>);

    return (
      <>
        {configsError && (
          <div className="text-red-500 p-4 mb-4 bg-red-50 rounded-lg">
            Error al cargar configuraciones: {configsError}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">Gestione las conexiones a brokers MQTT y configuraciones globales.</p>
          <Button color="success" className="font-medium text-black" startContent={<Plus size={16} />} onPress={handleAddNew}>
            Nueva Configuración
          </Button>
        </div>

        <Table aria-label="Global Configs Table">
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>BROKER</TableColumn>
            <TableColumn>LOTE</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay configuraciones creadas." isLoading={configsLoading}>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-gray-500" />
                    <span className="font-semibold">{config.name || 'Sin Nombre'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-small">{config.broker}:{config.port}</span>
                    <span className="text-tiny text-gray-400">{config.protocol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {config.loteId ? (
                    <Chip size="sm" variant="flat" color="secondary">{loteMap[config.loteId] || `Lote ${config.loteId}`}</Chip>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content="Editar">
                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(config)}>
                        <Edit size={18} />
                      </span>
                    </Tooltip>
                    <Tooltip content="Eliminar (Cuidado!)" color="danger">
                      <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(config.id!)}>
                        <Trash2 size={18} />
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  };

  const renderSensorTypesList = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Gestione los tipos de sensores disponibles en el sistema.</p>
        <Button color="primary" startContent={<Plus size={16} />} onPress={handleAddNewSensorType}>
          Nuevo Tipo de Sensor
        </Button>
      </div>

      <Table aria-label="Sensor Types Table">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>UNIDAD</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay tipos de sensor creados." isLoading={typesLoading}>
          {sensorTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Thermometer size={16} className="text-gray-500" />
                  <span className="font-semibold">{type.nombre}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">{type.unidad}</Chip>
              </TableCell>
              <TableCell>
                <span className="text-small">{type.descripcion || '-'}</span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Editar">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEditSensorType(type)}>
                      <Edit size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip content="Eliminar" color="danger">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDeleteSensorType(type.id)}>
                      <Trash2 size={18} />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );

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

  const renderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1 md:col-span-2">
        <Input
          label="Nombre de la Configuración"
          placeholder="e.g. Broker Principal, Lote Norte"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          isRequired
        />
      </div>
      <Input
        label="URL del Broker"
        placeholder="e.g. test.mosquitto.org"
        value={formData.broker}
        onChange={(e) => handleChange('broker', e.target.value)}
      />
      <Input
        label="Puerto"
        type="number"
        placeholder="1883"
        value={formData.port?.toString()}
        onChange={(e) => handleChange('port', parseInt(e.target.value))}
      />
      <Select
        label="Protocolo"
        selectedKeys={formData.protocol ? [formData.protocol] : []}
        onChange={(e) => handleChange('protocol', e.target.value)}
      >
        <SelectItem key="mqtt">MQTT</SelectItem>
        <SelectItem key="http">HTTP</SelectItem>
        <SelectItem key="websocket">WebSocket</SelectItem>
      </Select>
      <Input
        label="Prefijo del Tópico"
        placeholder="agrotech/"
        value={formData.topicPrefix}
        onChange={(e) => handleChange('topicPrefix', e.target.value)}
      />

      {/* Lot Selection */}
      <Select
        label="Lote Asociado (Opcional)"
        placeholder="Seleccionar lote"
        selectedKeys={formData.loteId ? [String(formData.loteId)] : []}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          handleChange('loteId', isNaN(val) ? null : val);
          handleChange('subLoteId', null); // Reset sublot
        }}
      >
        {lotes.map(lote => (
          <SelectItem key={String(lote.id)}>{lote.nombre}</SelectItem>
        ))}
      </Select>

      {formData.loteId && subLotes.length > 0 && (
        <Select
          label="SubLote"
          placeholder="Seleccionar sublote"
          selectedKeys={formData.subLoteId ? [String(formData.subLoteId)] : []}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            handleChange('subLoteId', isNaN(val) ? null : val);
          }}
        >
          {subLotes.map(sublote => (
            <SelectItem key={String(sublote.id)}>{sublote.nombre}</SelectItem>
          ))}
        </Select>
      )}

      <Input
        label="Usuario MQTT (Opcional)"
        value={formData.username || ''}
        onChange={(e) => handleChange('username', e.target.value)}
      />
      <Input
        label="Contraseña MQTT (Opcional)"
        type="password"
        value={formData.password || ''}
        onChange={(e) => handleChange('password', e.target.value)}
      />

      <div className="col-span-1 md:col-span-2 flex gap-4 mt-2">
        <Checkbox
          isSelected={formData.autoDiscover}
          onValueChange={(val) => handleChange('autoDiscover', val)}
        >
          Auto-Discovery (Crear sensores automáticamente al recibir mensajes)
        </Checkbox>
        <Checkbox
          isSelected={formData.activo !== false}
          onValueChange={(val) => handleChange('activo', val)}
        >
          Activo
        </Checkbox>
      </div>

      <Divider className="col-span-1 md:col-span-2 my-2" />

      {/* Default Topics */}
      <div className="col-span-1">
        <h4 className="text-small font-bold mb-2">Tópicos por Defecto</h4>
        <div className="flex gap-2 mb-2">
          <Input
            size="sm"
            placeholder="Nuevo tópico..."
            value={newDefaultTopic}
            onChange={(e) => setNewDefaultTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTopic('default')}
          />
          <Button size="sm" isIconOnly onClick={() => addTopic('default')}><Plus size={16} /></Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.defaultTopics?.map(t => (
            <Chip key={t} onClose={() => removeTopic('default', t)} size="sm" variant="flat">{t}</Chip>
          ))}
        </div>
      </div>

      {/* Custom Topics */}
      <div className="col-span-1">
        <h4 className="text-small font-bold mb-2">Tópicos Personalizados</h4>
        <div className="flex gap-2 mb-2">
          <Input
            size="sm"
            placeholder="Nuevo tópico..."
            value={newCustomTopic}
            onChange={(e) => setNewCustomTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTopic('custom')}
          />
          <Button size="sm" isIconOnly onClick={() => addTopic('custom')}><Plus size={16} /></Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.customTopics?.map(t => (
            <Chip key={t} onClose={() => removeTopic('custom', t)} size="sm" variant="flat" color="secondary">{t}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSensorTypeForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <Input
        label="Nombre del Tipo de Sensor"
        placeholder="e.g. Temperatura, Humedad"
        value={sensorTypeForm.nombre || ''}
        onChange={(e) => setSensorTypeForm(prev => ({ ...prev, nombre: e.target.value }))}
        isRequired
      />
      <Input
        label="Unidad de Medida"
        placeholder="e.g. °C, %, lux"
        value={sensorTypeForm.unidad || ''}
        onChange={(e) => setSensorTypeForm(prev => ({ ...prev, unidad: e.target.value }))}
        isRequired
      />
      <Input
        label="Descripción (Opcional)"
        placeholder="Descripción del tipo de sensor"
        value={sensorTypeForm.descripcion || ''}
        onChange={(e) => setSensorTypeForm(prev => ({ ...prev, descripcion: e.target.value }))}
      />
    </div>
  );

  const renderContent = () => {
    if (mode === 'EDIT') {
      return activeTab === 'configs' ? renderForm() : renderSensorTypeForm();
    }

    return (
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as 'configs' | 'sensorTypes')}>
        <Tab key="configs" title="Configuraciones IoT">
          {renderConfigsList()}
        </Tab>
        <Tab key="sensorTypes" title="Tipos de Sensor">
          {renderSensorTypesList()}
        </Tab>
      </Tabs>
    );
  };

  const getHeaderTitle = () => {
    if (mode === 'EDIT') {
      if (activeTab === 'configs') {
        return formData.id ? 'Editar Configuración IoT' : 'Nueva Configuración IoT';
      } else {
        return sensorTypeForm.id ? 'Editar Tipo de Sensor' : 'Nuevo Tipo de Sensor';
      }
    }
    return 'Configuraciones Globales IoT';
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {getHeaderTitle()}
        </ModalHeader>
        <ModalBody>
          {renderContent()}
        </ModalBody>
        <ModalFooter>
          {mode === 'EDIT' ? (
            <>
              <Button color="danger" variant="light" onPress={() => setMode('LIST')}>
                Volver
              </Button>
              {activeTab === 'configs' && (
                <Button color="warning" variant="flat" onPress={handleTest} isLoading={testing}>
                  Probar Conexión
                </Button>
              )}
              <Button color="success" className="font-medium text-black" onPress={activeTab === 'configs' ? handleSave : handleSaveSensorType} isLoading={saving}>
                Guardar
              </Button>
            </>
          ) : (
            <Button onPress={onClose}>
              Cerrar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
