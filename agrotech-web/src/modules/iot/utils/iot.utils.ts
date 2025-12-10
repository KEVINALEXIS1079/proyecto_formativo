import type { ComparisonRow, LotMetrics, SensorLectura } from "../model/iot.types";

export const buildLotReportCsv = (lotMetrics: LotMetrics[], readings: SensorLectura[]): string => {
  // Header for Metrics
  let csv = "Lot Metrics\n";
  csv += "Lot ID,Lot Name,SubLot ID,SubLot Name,Average,Min,Max,Count\n";
  
  lotMetrics.forEach(m => {
    csv += `${m.loteId},"${m.loteNombre}",${m.subLoteId || ''},"${m.subLoteNombre || ''}",${m.avg},${m.min},${m.max},${m.count}\n`;
  });

  csv += "\nReadings Detail\n";
  csv += "Reading ID,Sensor ID,Value,Date\n";
  
  readings.forEach(r => {
    csv += `${r.id},${r.sensorId},${r.valor},"${r.fechaLectura}"\n`;
  });

  return csv;
};

export const buildComparisonCsv = (rows: ComparisonRow[]): string => {
  let csv = "Lot Comparison\n";
  csv += "Lot ID,Lot Name,Metric Value,Is Best,Is Worst\n";
  
  rows.forEach(r => {
    csv += `${r.loteId},"${r.loteNombre}",${r.metric},${r.isBest ? 'Yes' : 'No'},${r.isWorst ? 'Yes' : 'No'}\n`;
  });

  return csv;
};

export const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
