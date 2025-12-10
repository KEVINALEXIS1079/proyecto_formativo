import React, { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react';
import { IoTApi } from '../api/iot.api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertContextModal } from './AlertContextModal';

interface PendingAlertsListProps {
  loteId: number | null;
}

export const PendingAlertsList: React.FC<PendingAlertsListProps> = ({ loteId }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch last 50 alerts for the selected lot (or global)
      // Default to last 7 days to ensure we see something if dev env is stale
      const from = new Date();
      from.setDate(from.getDate() - 7);
      
      const res = await IoTApi.getAlerts({ 
        loteId: loteId ?? undefined,
        from: from.toISOString()
      });
      setAlerts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [loteId]);

  return (
    <>
      <Card className="shadow-lg border-0 bg-white">
        <CardBody className="p-0">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Recientes
            </h3>
            <Button size="sm" variant="light" isIconOnly onPress={fetchAlerts} isLoading={loading}>
              <RefreshCw size={16} />
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {loading && alerts.length === 0 ? (
               <div className="p-8 flex justify-center">
                 <Spinner size="sm" />
               </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">No hay alertas recientes.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="p-3 hover:bg-gray-50 transition-colors cursor-pointer group flex items-center justify-between"
                    onClick={() => setSelectedAlertId(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${alert.tipo === 'HIGH' || alert.tipo === 'MAX' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {alert.sensor?.nombre || `Sensor ${alert.sensorId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(alert.fechaAlerta), 'dd MMM HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className="text-right">
                          <p className="text-sm font-bold text-gray-700">{alert.valor}</p>
                          <p className="text-[10px] text-gray-400">Umbral: {alert.umbral}</p>
                       </div>
                       <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <AlertContextModal 
        isOpen={!!selectedAlertId} 
        onClose={() => setSelectedAlertId(null)}
        alertId={selectedAlertId} 
      />
    </>
  );
};
