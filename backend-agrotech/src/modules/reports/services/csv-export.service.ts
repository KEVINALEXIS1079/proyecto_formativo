import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvExportService {
  generateCsv(data: any[], columns: string[]): string {
    if (!data || data.length === 0) {
      return columns.join(',') + '\n';
    }

    const header = columns.join(',');
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col] !== undefined && row[col] !== null ? row[col] : '';
        // Escape quotes and wrap in quotes if necessary
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }
}
