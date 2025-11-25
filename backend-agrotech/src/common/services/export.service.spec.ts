import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportService],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportToExcel', () => {
    it('should export data to Excel buffer', async () => {
      const testData = [
        { nombre: 'Producto A', precio: 100, cantidad: 10 },
        { nombre: 'Producto B', precio: 200, cantidad: 5 },
      ];

      const result = await service.exportToExcel(testData, 'TestSheet');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty data array', async () => {
      const result = await service.exportToExcel([]);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format headers correctly', async () => {
      const testData = [
        { nombreProducto: 'Test', precioUnitario: 50 },
      ];

      const result = await service.exportToExcel(testData);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should adjust column widths automatically', async () => {
      const testData = [
        { nombre: 'Producto con nombre muy largo que debería ajustar el ancho', precio: 100 },
        { nombre: 'Corto', precio: 200 },
      ];

      const result = await service.exportToExcel(testData);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV string', async () => {
      const testData = [
        { nombre: 'Producto A', precio: 100, cantidad: 10 },
        { nombre: 'Producto B', precio: 200, cantidad: 5 },
      ];

      const result = await service.exportToCSV(testData);

      expect(typeof result).toBe('string');
      expect(result).toContain('Nombre,Precio,Cantidad');
      expect(result).toContain('Producto A,100,10');
      expect(result).toContain('Producto B,200,5');
    });

    it('should handle empty data array', async () => {
      const result = await service.exportToCSV([]);

      expect(result).toBe('');
    });

    it('should escape commas and quotes in CSV', async () => {
      const testData = [
        { descripcion: 'Producto, con coma', notas: 'Nota "con" comillas' },
      ];

      const result = await service.exportToCSV(testData);

      expect(result).toContain('"Producto, con coma"');
      expect(result).toContain('"Nota ""con"" comillas"');
    });

    it('should handle null and undefined values', async () => {
      const testData = [
        { nombre: 'Producto A', precio: null, cantidad: undefined },
      ];

      const result = await service.exportToCSV(testData);

      expect(result).toContain('Producto A,,');
    });
  });

  describe('formatHeader', () => {
    it('should convert camelCase to Title Case', () => {
      const result = (service as any).formatHeader('nombreProducto');
      expect(result).toBe('Nombre Producto');
    });

    it('should handle single word', () => {
      const result = (service as any).formatHeader('nombre');
      expect(result).toBe('Nombre');
    });

    it('should handle empty string', () => {
      const result = (service as any).formatHeader('');
      expect(result).toBe('');
    });

    it('should capitalize first letter', () => {
      const result = (service as any).formatHeader('test');
      expect(result).toBe('Test');
    });
  });
});