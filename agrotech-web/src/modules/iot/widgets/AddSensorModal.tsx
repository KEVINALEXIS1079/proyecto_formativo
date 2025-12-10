import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Switch } from "@heroui/react";
import { IoTApi } from '../api/iot.api';
import { GeoApi, type Lote, type SubLote } from '../../../shared/api/geo.api';
import type { Sensor, TipoSensor, IoTConfig } from '../model/iot.types';
import { toast } from 'react-toastify';

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
  // const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [subLotes, setSubLotes] = useState<SubLote[]>([]);
  const [globalConfigs, setGlobalConfigs] = useState<IoTConfig[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    IoTApi.getSensorTypes().then(setSensorTypes).catch(console.error);
    IoTApi.getConfig().then(setGlobalConfigs).catch(console.error);
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
      // Default to MQTT
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
    // Testing logic needs to be updated to use backend endpoint with global config
    // For now, we can just show a toast or implement a new test endpoint call
    // if the backend supports testing a specific sensor config.
    // Since we removed broker fields, we can't test connection parameters directly here easily
    // without sending the globalConfigId to the backend.

    // TODO: Implement new test logic if needed.
    toast.info('La prueba de conexión se realiza al guardar el sensor.');
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    // Validate: if lote has sublotes, one must be selected
    if (formData.loteId && subLotes.length > 0 && !formData.subLoteId) {
      toast.error('Debe seleccionar un sublote para este lote');
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {sensorToEdit ? (isReadOnly ? 'Detalles del Sensor' : 'Editar Sensor') : 'Agregar Nuevo Sensor'}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Nombre del Sensor"
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              isRequired
              isDisabled={isReadOnly}
            />
            <Select
              label="Tipo de Sensor (Opcional - Auto-detectable)"
              placeholder="Seleccionar o dejar vacío para auto-detectar"
              selectedKeys={formData.tipoSensorId ? [String(formData.tipoSensorId)] : []}
              onChange={(e) => handleChange('tipoSensorId', parseInt(e.target.value))}
              isDisabled={isReadOnly}
            >
              {sensorTypes.map(type => (
                <SelectItem key={String(type.id)}>
                  {type.nombre} ({type.unidad})
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Lote (Opcional)"
              placeholder="Seleccionar lote"
              selectedKeys={formData.loteId ? [String(formData.loteId)] : []}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                handleChange('loteId', isNaN(val) ? null : val);
                handleChange('subLoteId', null); // Reset sublot
              }}
              isDisabled={isReadOnly}
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
                isRequired
                isDisabled={isReadOnly}
              >
                {subLotes.map(sublote => (
                  <SelectItem key={String(sublote.id)}>{sublote.nombre}</SelectItem>
                ))}
              </Select>
            )}

            <Select
              label="Protocolo"
              selectedKeys={formData.protocolo ? [formData.protocolo] : []}
              onChange={(e) => handleChange('protocolo', e.target.value)}
              isDisabled={isReadOnly}
            >
              <SelectItem key="MQTT">MQTT</SelectItem>
              <SelectItem key="HTTP">HTTP</SelectItem>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                isSelected={formData.activo}
                onValueChange={(val) => handleChange('activo', val)}
                isDisabled={isReadOnly}
              >
                Habilitado
              </Switch>
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
              <h4 className="text-sm font-bold mb-2">Umbrales de alerta</h4>
              <p className="text-xs text-gray-500">
                Configura los valores mínimo y máximo para generar alertas fuera de rango por sensor.
              </p>
            </div>
            <Input
              type="number"
              label="Umbral mínimo"
              placeholder="Ej: 10"
              value={formData.umbralMin !== undefined && formData.umbralMin !== null ? String(formData.umbralMin) : ''}
              onChange={(e) => handleChange('umbralMin', e.target.value === '' ? null : parseFloat(e.target.value))}
              isDisabled={isReadOnly}
            />
            <Input
              type="number"
              label="Umbral máximo"
              placeholder="Ej: 90"
              value={formData.umbralMax !== undefined && formData.umbralMax !== null ? String(formData.umbralMax) : ''}
              onChange={(e) => handleChange('umbralMax', e.target.value === '' ? null : parseFloat(e.target.value))}
              isDisabled={isReadOnly}
            />
            <p className="text-xs text-amber-600 col-span-1 md:col-span-2">
              Las alertas se generan cuando una lectura está fuera de estos límites configurados en el sensor.
            </p>

            {formData.protocolo === 'MQTT' && (
              <>
                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-bold mb-2">Configuración MQTT</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Seleccione una configuración global para conectar este sensor.
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Select
                    label="Configuración Global"
                    placeholder="Seleccionar configuración"
                    selectedKeys={formData.globalConfigId ? [formData.globalConfigId.toString()] : []}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const configId = isNaN(val) ? null : val;
                      handleChange('globalConfigId', configId);
                    }}
                    isRequired
                    isDisabled={isReadOnly}
                  >
                    {globalConfigs.map(config => (
                      <SelectItem key={config.id} textValue={config.name || `Config ${config.id}`}>
                        {config.name || `Config ${config.id}`} ({config.broker})
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Tópico MQTT (Sufijo)"
                    placeholder="Ej: temperatura/invernadero1"
                    description={
                      formData.globalConfigId
                        ? `Prefijo: ${globalConfigs.find(c => c.id === formData.globalConfigId)?.topicPrefix || ''}`
                        : 'Seleccione una configuración para ver el prefijo'
                    }
                    value={formData.mqttTopic || ''}
                    onChange={(e) => handleChange('mqttTopic', e.target.value)}
                    isRequired
                    isDisabled={isReadOnly}
                  />
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          {isReadOnly ? (
            <>
              <Button variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button color="success" className="font-medium text-black" onPress={() => setIsReadOnly(false)}>
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button variant="flat" onPress={() => {
                if (sensorToEdit) {
                  setIsReadOnly(true);
                  // Optionally revert formData here if needed
                } else {
                  onClose();
                }
              }}>
                Cancelar
              </Button>
              {formData.protocolo === 'MQTT' && (
                <Button color="warning" variant="flat" onPress={handleTest}>
                  Probar Conexión
                </Button>
              )}
              <Button color="success" className="font-medium text-black" onPress={handleSave} isLoading={saving}>
                {sensorToEdit ? 'Guardar Cambios' : 'Guardar Sensor'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
