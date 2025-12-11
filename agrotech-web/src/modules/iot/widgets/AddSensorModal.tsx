import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Switch, Card, CardBody } from "@heroui/react";
import { IoTApi } from '../api/iot.api';
import { GeoApi, type Lote, type SubLote } from '../../../shared/api/geo.api';
import type { Sensor, TipoSensor, IoTConfig } from '../model/iot.types';
import { toast } from 'react-hot-toast'; // Using hot-toast for better consistency
import { Podcast, Server, Settings, Activity, Cpu } from 'lucide-react';

interface AddSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  sensorToEdit?: Sensor | null;
}

export const AddSensorModal: React.FC<AddSensorModalProps> = ({ isOpen, onClose, onSave, sensorToEdit }) => {
  const [formData, setFormData] = useState<Partial<Sensor>>({
    protocolo: 'MQTT',
    activo: true
  });
  const [sensorTypes, setSensorTypes] = useState<TipoSensor[]>([]);
  const [saving, setSaving] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [subLotes, setSubLotes] = useState<SubLote[]>([]);
  const [globalConfigs, setGlobalConfigs] = useState<IoTConfig[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    IoTApi.getSensorTypes().then(setSensorTypes).catch(console.error);
    IoTApi.getConfig().then((config) => {
      if (Array.isArray(config)) {
        setGlobalConfigs(config);
      } else {
        // Handle single config or null by wrapping or defaulting
        setGlobalConfigs(config ? [config] : []);
      }
    }).catch(console.error);
  }, []);

  // Fetch lotes when modal opens
  useEffect(() => {
    if (isOpen) {
      GeoApi.getLotes().then(setLotes).catch(err => {
        console.error('Error fetching lotes:', err);
        toast.error('Error al cargar lotes');
      });
    }
  }, [isOpen]);

  // Fetch sublotes when loteId changes
  useEffect(() => {
    if (formData.loteId) {
      GeoApi.getSubLotes(formData.loteId).then(setSubLotes).catch(err => {
        console.error('Error fetching sublotes:', err);
      });
    } else {
      setSubLotes([]);
    }
  }, [formData.loteId]);

  useEffect(() => {
    if (sensorToEdit) {
      const typeId = sensorToEdit.tipoSensorId || sensorToEdit.tipoSensor?.id;
      setFormData({
        ...sensorToEdit,
        tipoSensorId: typeId
      });
      setIsReadOnly(true);
    } else {
      setFormData({
        protocolo: 'MQTT',
        activo: true
      });
      setIsReadOnly(false);
    }
  }, [sensorToEdit, isOpen]);

  const handleChange = (key: keyof Sensor, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    toast.dismiss();
    toast.loading('Iniciando prueba...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Prueba simulada exitosa. (Funcionalidad completa en backend)');
    }, 1000);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.loteId && subLotes.length > 0 && !formData.subLoteId) {
      toast.error('Debe seleccionar un sublote');
      return;
    }

    setSaving(true);
    try {
      if (sensorToEdit) {
        await IoTApi.updateSensor(sensorToEdit.id, formData);
        toast.success('Sensor actualizado');
      } else {
        await IoTApi.createSensor(formData);
        toast.success('Sensor creado');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Error al guardar sensor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Cpu className="text-primary" />
            <h3 className="text-xl font-bold text-gray-800">{sensorToEdit ? (isReadOnly ? 'Detalles del Sensor' : 'Editar Sensor') : 'Agregar Nuevo Sensor'}</h3>
          </div>
          <p className="text-sm text-gray-500 font-normal ml-8">Configure los parámetros de conexión y umbrales de alerta.</p>
        </ModalHeader>
        <ModalBody className="p-6 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* General Info */}
            <Card shadow="sm" className="border border-gray-200">
              <CardBody className="gap-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-gray-700">
                  <Activity size={16} /> Información Básica
                </h4>
                <Input
                  label="Nombre"
                  placeholder="Ej: Sensor Humedad Norte"
                  value={formData.nombre || ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  isRequired
                  isDisabled={isReadOnly}
                  variant="bordered"
                />
                <Select
                  label="Tipo de Sensor"
                  placeholder="Seleccionar tipo"
                  selectedKeys={formData.tipoSensorId ? [String(formData.tipoSensorId)] : []}
                  onChange={(e) => handleChange('tipoSensorId', parseInt(e.target.value))}
                  isDisabled={isReadOnly}
                  variant="bordered"
                >
                  {sensorTypes.map(type => (
                    <SelectItem key={String(type.id)} textValue={type.nombre}>
                      {type.nombre} ({type.unidad})
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex gap-2">
                  <Select
                    label="Lote"
                    placeholder="Lote"
                    selectedKeys={formData.loteId ? [String(formData.loteId)] : []}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleChange('loteId', isNaN(val) ? null : val);
                      handleChange('subLoteId', null);
                    }}
                    isDisabled={isReadOnly}
                    variant="bordered"
                    className="flex-1"
                  >
                    {lotes.map(lote => (
                      <SelectItem key={String(lote.id)}>{lote.nombre}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="SubLote"
                    placeholder="SubLote"
                    selectedKeys={formData.subLoteId ? [String(formData.subLoteId)] : []}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleChange('subLoteId', isNaN(val) ? null : val);
                    }}
                    isDisabled={isReadOnly || !formData.loteId}
                    variant="bordered"
                    className="flex-1"
                  >
                    {subLotes.map(sublote => (
                      <SelectItem key={String(sublote.id)}>{sublote.nombre}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-100/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Estado del Sensor</span>
                  <Switch
                    isSelected={formData.activo}
                    onValueChange={(val) => handleChange('activo', val)}
                    isDisabled={isReadOnly}
                    color="success"
                    size="sm"
                  >
                    {formData.activo ? "Habilitado" : "Deshabilitado"}
                  </Switch>
                </div>
              </CardBody>
            </Card>

            {/* Thresholds */}
            <Card shadow="sm" className="border border-gray-200">
              <CardBody className="gap-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-gray-700">
                  <Settings size={16} /> Umbrales de Alerta
                </h4>
                <p className="text-xs text-gray-500">Defina los rangos operativos seguros.</p>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Mínimo"
                    placeholder="Ej: 10"
                    value={formData.umbralMin !== undefined && formData.umbralMin !== null ? String(formData.umbralMin) : ''}
                    onChange={(e) => handleChange('umbralMin', e.target.value === '' ? null : parseFloat(e.target.value))}
                    isDisabled={isReadOnly}
                    variant="bordered"
                    endContent={<span className="text-xs text-gray-400">Min</span>}
                  />
                  <Input
                    type="number"
                    label="Máximo"
                    placeholder="Ej: 90"
                    value={formData.umbralMax !== undefined && formData.umbralMax !== null ? String(formData.umbralMax) : ''}
                    onChange={(e) => handleChange('umbralMax', e.target.value === '' ? null : parseFloat(e.target.value))}
                    isDisabled={isReadOnly}
                    variant="bordered"
                    endContent={<span className="text-xs text-gray-400">Max</span>}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Select
                    label="Protocolo de Comunicación"
                    selectedKeys={formData.protocolo ? [formData.protocolo] : []}
                    onChange={(e) => handleChange('protocolo', e.target.value)}
                    isDisabled={isReadOnly}
                    variant="bordered"
                    startContent={<Podcast size={16} />}
                  >
                    <SelectItem key="MQTT">MQTT</SelectItem>
                    <SelectItem key="HTTP">HTTP</SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>

            {/* MQTT Specific */}
            {formData.protocolo === 'MQTT' && (
              <div className="lg:col-span-2">
                <Card shadow="sm" className="border border-indigo-100 bg-indigo-50/30">
                  <CardBody className="gap-4">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-700">
                      <Server size={16} /> Configuración MQTT
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Configuración Global"
                        placeholder="Seleccionar conexión"
                        selectedKeys={formData.globalConfigId ? [formData.globalConfigId.toString()] : []}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          handleChange('globalConfigId', isNaN(val) ? null : val);
                        }}
                        isRequired
                        isDisabled={isReadOnly}
                        variant="bordered"
                        className="bg-white rounded-lg"
                      >
                        {globalConfigs.map(config => (
                          <SelectItem key={config.id} textValue={config.name || `Config ${config.id}`}>
                            {config.name || `Config ${config.id}`} ({config.broker})
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Tópico (Sufijo)"
                        placeholder="Ej: temperatura/invernadero1"
                        value={formData.mqttTopic || ''}
                        onChange={(e) => handleChange('mqttTopic', e.target.value)}
                        isRequired
                        isDisabled={isReadOnly}
                        variant="bordered"
                        className="bg-white rounded-lg"
                        description={
                          <span className="text-xs text-gray-500">
                            Prefijo completo: <span className="font-mono bg-gray-200 px-1 rounded">{
                              formData.globalConfigId
                                ? `${globalConfigs.find(c => c.id === formData.globalConfigId)?.topicPrefix || ''}${formData.mqttTopic || '...'}`
                                : 'Seleccione config...'
                            }</span>
                          </span>
                        }
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 bg-gray-50/50">
          {isReadOnly ? (
            <>
              <Button variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button color="primary" variant="flat" onPress={() => setIsReadOnly(false)}>
                Editar Información
              </Button>
            </>
          ) : (
            <>
              <Button variant="light" onPress={() => {
                if (sensorToEdit) {
                  setIsReadOnly(true);
                } else {
                  onClose();
                }
              }}>
                Cancelar
              </Button>
              {formData.protocolo === 'MQTT' && (
                <Button color="warning" variant="flat" onPress={handleTest}>
                  Simular Conexión
                </Button>
              )}
              <Button color="success" className="font-medium text-black shadow-md" onPress={handleSave} isLoading={saving}>
                {sensorToEdit ? 'Guardar Cambios' : 'Registrar Sensor'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
