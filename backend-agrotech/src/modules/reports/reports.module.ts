import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialReportsService } from './services/financial-reports.service';
import { FinancialReportsController } from './controllers/financial-reports.controller';
import { CropReportsService } from './services/crop-reports.service';
import { CropReportsController } from './controllers/crop-reports.controller';
import { IotReportsService } from './services/iot-reports.service';
import { IotReportsController } from './controllers/iot-reports.controller';
import { N8nReportsService } from './services/n8n-reports.service';
import { N8nReportsController } from './controllers/n8n-reports.controller';
import { CsvExportService } from './services/csv-export.service';
import { Venta } from '../production/entities/venta.entity';
import { VentaDetalle } from '../production/entities/venta-detalle.entity';
import { Actividad } from '../activities/entities/actividad.entity';
import { ActividadServicio } from '../activities/entities/actividad-servicio.entity';
import { ActividadInsumoUso } from '../activities/entities/actividad-insumo-uso.entity';
import { ActividadResponsable } from '../activities/entities/actividad-responsable.entity';
import { MovimientoInsumo } from '../inventory/entities/movimiento-insumo.entity';
import { Cultivo } from '../cultivos/entities/cultivo.entity';
import { Sensor } from '../iot/entities/sensor.entity';
import { SensorLectura } from '../iot/entities/sensor-lectura.entity';
import { SensorAlerta } from '../iot/entities/sensor-alert.entity';
import { IotGlobalConfig } from '../iot/entities/iot-global-config.entity';
import { AuthModule } from '../auth/auth.module';
import { LoteProduccion } from '../production/entities/lote-produccion.entity';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    AuthModule,
    ActivitiesModule,
    TypeOrmModule.forFeature([
      Venta,
      VentaDetalle,
      Actividad,
      ActividadServicio,
      ActividadInsumoUso,
      ActividadResponsable,
      MovimientoInsumo,
      Cultivo,
      Sensor,
      SensorLectura,
      SensorAlerta,
      IotGlobalConfig,
      LoteProduccion,
    ]),
  ],
  controllers: [
    FinancialReportsController,
    CropReportsController,
    IotReportsController,
    N8nReportsController,
  ],
  providers: [
    FinancialReportsService,
    CropReportsService,
    IotReportsService,
    N8nReportsService,
    CsvExportService,
  ],
  exports: [
    FinancialReportsService,
    CropReportsService,
    IotReportsService,
    N8nReportsService,
    CsvExportService,
  ],
})
export class ReportsModule {}
