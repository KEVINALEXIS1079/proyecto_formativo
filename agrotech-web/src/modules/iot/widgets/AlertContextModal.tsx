import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react";
import { IoTApi } from '../api/iot.api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: number | null;
}

export const AlertContextModal: React.FC<AlertContextModalProps> = ({ isOpen, onClose, alertId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ alert: any; context: any[] } | null>(null);

  useEffect(() => {
    if (isOpen && alertId) {
      fetchContext();
    } else {
      setData(null);
    }
  }, [isOpen, alertId]);

  const fetchContext = async () => {
    if (!alertId) return;
    setLoading(true);
    try {
      const res = await IoTApi.getAlertContext(alertId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.context.map(c => ({
    ...c,
    time: format(new Date(c.fechaLectura), 'HH:mm:ss'),
    fullDate: format(new Date(c.fechaLectura), 'dd MMM HH:mm:ss'),
    val: c.valor
  }));

  const alertPoint = data ? {
    x: format(new Date(data.alert.fechaAlerta), 'HH:mm:ss'),
    y: data.alert.valor
  } : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Análisis de Incidente
              <span className="text-small font-normal text-default-500">
                Contexto de la alerta #{alertId}
              </span>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="h-60 flex justify-center items-center">
                  <Spinner label="Cargando contexto..." />
                </div>
              ) : data ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm p-3 bg-default-100 rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground/80">Sensor: {data.alert.sensor?.nombre || 'Desconocido'}</p>
                      <p className="text-default-500">{data.alert.tipo} | Umbral: {data.alert.umbral}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-danger">{data.alert.valor}</p>
                      <p className="text-xs text-default-400">{format(new Date(data.alert.fechaAlerta), 'dd MMM yyyy HH:mm:ss')}</p>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ color: '#666' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="val"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        {/* Highlight the Alert Point */}
                        {alertPoint && (
                          <ReferenceDot x={alertPoint.x} y={alertPoint.y} r={6} fill="red" stroke="white" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-default-400">
                    Mostrando 15 lecturas antes y después del evento.
                  </p>
                </div>
              ) : (
                <div className="text-center text-default-500 py-10">
                  No se encontró información del contexto.
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
