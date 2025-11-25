import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialReportsService } from './services/financial-reports.service';
import { FinancialReportsController } from './controllers/financial-reports.controller';
import { CropReportsService } from './services/crop-reports.service';
import { CropReportsController } from './controllers/crop-reports.controller';
import { IotReportsService } from './services/iot-reports.service';
import { IotReportsController } from './controllers/iot-reports.controller';
import { Venta } from '../production/entities/venta.entity';
import { VentaDetalle } from '../production/entities/venta-detalle.entity';
import { Actividad } from '../activities/entities/actividad.entity';
import { ActividadServicio } from '../activities/entities/actividad-servicio.entity';
import { ActividadInsumoUso } from '../activities/entities/actividad-insumo-uso.entity';
import { ActividadResponsable } from '../activities/entities/actividad-responsable.entity';
import { MovimientoInsumo } from '../inventory/entities/movimiento-insumo.entity';
import { Cultivo } from '../geo/entities/cultivo.entity';
import { Sensor } from '../iot/entities/sensor.entity';
import { SensorLectura } from '../iot/entities/sensor-lectura.entity';

@Module({
  imports: [
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
      SensorLectura
    ])
  ],
  controllers: [FinancialReportsController, CropReportsController, IotReportsController],
  providers: [FinancialReportsService, CropReportsService, IotReportsService],
  exports: [FinancialReportsService, CropReportsService, IotReportsService]
})
export class ReportsModule {}
