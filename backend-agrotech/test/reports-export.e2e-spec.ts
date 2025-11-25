import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Reports Export (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Crop Reports Export', () => {
    it('/reports/crops/:id/export (GET) - should export crop data as Excel', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/1/export')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
        .expect('Content-Disposition', /attachment; filename=cultivo-1-\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('/reports/crops/export (GET) - should export crops report as Excel', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/export')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
        .expect('Content-Disposition', /attachment; filename=reportes-cultivos-\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('/reports/crops/export (GET) - should export crops report as CSV', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/export?format=csv')
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect('Content-Disposition', /attachment; filename=reportes-cultivos-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('/reports/crops/export (GET) - should handle filtered export', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/export?cultivoId=1&fechaInicio=2023-01-01&fechaFin=2023-12-31')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
    });
  });

  describe('Financial Reports Export', () => {
    it('/reports/financial/export (GET) - should export financial report as Excel', () => {
      return request(app.getHttpServer())
        .get('/reports/financial/export')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
        .expect('Content-Disposition', /attachment; filename=reportes-financieros-\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('/reports/financial/export (GET) - should export financial report as CSV', () => {
      return request(app.getHttpServer())
        .get('/reports/financial/export?format=csv')
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect('Content-Disposition', /attachment; filename=reportes-financieros-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('/reports/financial/export (GET) - should handle filtered export', () => {
      return request(app.getHttpServer())
        .get('/reports/financial/export?from=2023-01-01&to=2023-12-31&clienteId=1')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
    });
  });

  describe('IoT Reports Export', () => {
    it('/reports/iot/export (GET) - should export IoT data as Excel', () => {
      return request(app.getHttpServer())
        .get('/reports/iot/export')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
        .expect('Content-Disposition', /attachment; filename=reporte-iot-\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('/reports/iot/export (GET) - should export IoT data as CSV', () => {
      return request(app.getHttpServer())
        .get('/reports/iot/export?format=csv')
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect('Content-Disposition', /attachment; filename=reporte-iot-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('/reports/iot/export (GET) - should handle filtered export', () => {
      return request(app.getHttpServer())
        .get('/reports/iot/export?sensorId=1&from=2023-01-01&to=2023-12-31&interval=day')
        .expect(200)
        .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
    });
  });

  describe('Error Handling', () => {
    it('/reports/crops/:id/export (GET) - should handle non-existent crop', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/99999/export')
        .expect(404);
    });

    it('/reports/crops/export (GET) - should handle invalid date format', () => {
      return request(app.getHttpServer())
        .get('/reports/crops/export?fechaInicio=invalid-date')
        .expect(400);
    });

    it('/reports/financial/export (GET) - should handle invalid format', () => {
      return request(app.getHttpServer())
        .get('/reports/financial/export?format=invalid')
        .expect(400);
    });
  });
});