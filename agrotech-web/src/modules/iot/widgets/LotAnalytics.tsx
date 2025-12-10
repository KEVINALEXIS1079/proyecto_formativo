import React from 'react';
import type { Sensor } from "../model/iot.types";
import { useIoTLotCharts } from "../hooks/useIoTLotCharts";
import { SensorCharts } from "../widgets/SensorCharts";

interface LotAnalyticsProps {
  sensors: Sensor[];
  selectedLoteId: number | null;
  selectedSubLoteId: number | null;
}

export const LotAnalytics: React.FC<LotAnalyticsProps> = ({ sensors, selectedLoteId, selectedSubLoteId }) => {
  const { timeSeriesData, sensorSummaryData, loading, metrics, isLive } = useIoTLotCharts(
    sensors,
    selectedLoteId,
    selectedSubLoteId
  );

  // Only show analytics if a lot is selected
  if (!selectedLoteId) {
    return (
      <div className="mt-8 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500">Seleccione un lote para ver la analítica</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Analítica de Lotes</h2>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Promedio</p>
            <p className="text-2xl font-bold text-blue-600">{metrics.avg}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Mín</p>
            <p className="text-2xl font-bold text-green-600">{metrics.min}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Máx</p>
            <p className="text-2xl font-bold text-red-600">{metrics.max}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Lecturas</p>
            <p className="text-2xl font-bold text-gray-600">{metrics.count}</p>
          </div>
        </div>
      )}

      <SensorCharts
        timeSeriesData={timeSeriesData}
        sensorSummaryData={sensorSummaryData}
        loading={loading}
        isLive={isLive}
        sensors={sensors}
      />
    </div>
  );
};
