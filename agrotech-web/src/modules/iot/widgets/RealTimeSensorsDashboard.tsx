import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Thermometer, Droplets, Sprout, Zap, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';
import type { Sensor } from '../model/iot.types';

interface RealTimeSensorsDashboardProps {
  sensors: Sensor[];
  onTogglePump?: (sensorId: number) => void;
}

export const RealTimeSensorsDashboard: React.FC<RealTimeSensorsDashboardProps> = ({
  sensors,
  onTogglePump
}) => {
  const { connectionStatus, getFormattedSensorData, realTimeSensors } = useIoTRealTimeSensors(sensors);
  const sensorsToRender = realTimeSensors.length > 0 ? realTimeSensors : sensors;

  // Categorize sensors
  const temperatureSensors = sensorsToRender.filter(s =>
    s.tipoSensor?.nombre?.toLowerCase().includes('temperatura') ||
    s.nombre?.toLowerCase().includes('temperatura')
  );

  const humidityAirSensors = sensorsToRender.filter(s =>
    (s.tipoSensor?.nombre?.toLowerCase().includes('humedad') &&
     s.tipoSensor?.nombre?.toLowerCase().includes('aire')) ||
    s.nombre?.toLowerCase().includes('humedad aire')
  );

  const humiditySoilSensors = sensorsToRender.filter(s =>
    (s.tipoSensor?.nombre?.toLowerCase().includes('humedad') &&
     s.tipoSensor?.nombre?.toLowerCase().includes('suelo')) ||
    s.nombre?.toLowerCase().includes('humedad suelo')
  );

  const pumpSensors = sensorsToRender.filter(s =>
    s.tipoSensor?.nombre?.toLowerCase().includes('bomba') ||
    s.nombre?.toLowerCase().includes('bomba')
  );

  const SensorCard: React.FC<{ sensor: Sensor; icon: React.ReactNode; color: string }> = ({
    sensor,
    icon,
    color
  }) => {
    const realTimeData = getFormattedSensorData(sensor.id);
    const isPump = sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') ||
                    sensor.nombre?.toLowerCase().includes('bomba');
    const connectionState = realTimeData?.estadoConexion || sensor.estadoConexion;
    const isConnected = connectionState === 'CONECTADO';
    const currentPumpState = realTimeData?.value ?? (sensor.ultimoValor !== undefined ? Number(sensor.ultimoValor) : null);
    const pumpStateText = Number(currentPumpState) === 1 ? 'Prendido' : 'Apagado';
    const pumpStateColor = Number(currentPumpState) === 1 ? 'text-green-600' : 'text-red-600';
    const isDeactivated = (realTimeData?.estado || sensor.estado)?.toLowerCase() === 'desactivado';
    const showValue = isConnected
      ? (isDeactivated ? 'Desactivado' : (isPump ? pumpStateText : realTimeData?.formattedValue ?? (currentPumpState ?? '--')))
      : 'Desconectado';
    const timeLabel = realTimeData ? realTimeData.timeAgo :
      (sensor.ultimaLectura ? new Date(sensor.ultimaLectura).toLocaleTimeString() : 'Sin datos');

    return (
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isPump ? (Number(currentPumpState) === 1 ? 'bg-green-500' : 'bg-gray-500') : color}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{sensor.nombre}</p>
                <p className="text-xs text-gray-500">{sensor.tipoSensor?.nombre}</p>
                {isPump && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${Number(currentPumpState) === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-medium ${pumpStateColor}`}>{pumpStateText}</span>
                  </div>
                )}
              </div>
            </div>
            {sensor.protocolo === 'MQTT' || sensor.protocolo === 'WEBSOCKET' ? (
              isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )
            ) : null}
          </div>

          <div className="space-y-1">
            {realTimeData ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {showValue}
                </p>
                <p className="text-xs text-gray-500">{timeLabel}</p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-gray-500">
                  Estado: {sensor.estadoConexion === 'CONECTADO' ? 'Conectado' :
                          sensor.estadoConexion === 'DESCONECTADO' ? 'Desconectado' :
                          sensor.estadoConexion === 'ERROR' ? 'Error' : 'Sin datos'}
                </p>
              </div>
            )}

          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
        {connectionStatus === 'connected' ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : connectionStatus === 'connecting' ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm text-gray-700 capitalize">
          {connectionStatus === 'connecting' ? 'Conectando...' :
           connectionStatus === 'connected' ? 'Conectado' :
           connectionStatus === 'disconnected' ? 'Desconectado' : 'Error de conexion'}
        </span>
      </div>

      {/* Temperature Sensors */}
      {temperatureSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-500" />
            Temperatura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {temperatureSensors.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                icon={<Thermometer className="w-5 h-5 text-white" />}
                color="bg-red-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Humidity Air Sensors */}
      {humidityAirSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Humedad del Aire
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {humidityAirSensors.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                icon={<Droplets className="w-5 h-5 text-white" />}
                color="bg-blue-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Humidity Soil Sensors */}
      {humiditySoilSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-500" />
            Humedad del Suelo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {humiditySoilSensors.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                icon={<Sprout className="w-5 h-5 text-white" />}
                color="bg-green-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Pump Sensors */}
      {pumpSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Bombas y Válvulas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pumpSensors.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                icon={<Zap className="w-5 h-5 text-white" />}
                color="bg-yellow-500"
              />
            ))}
          </div>
        </div>
      )}

      {sensorsToRender.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay sensores configurados</p>
        </div>
      )}
    </div>
  );
};

