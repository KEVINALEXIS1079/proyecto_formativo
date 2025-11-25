import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './services/production.service';
import { ProductionGateway } from './gateways/production.gateway';
import { ProductionController } from './controllers/production.controller';
import { ProductoAgro } from './entities/producto-agro.entity';
import { LoteProduccion } from './entities/lote-produccion.entity';
import { MovimientoProduccion } from './entities/movimiento-produccion.entity';
import { Cliente } from './entities/cliente.entity';
import { Cultivo } from '../cultivos/entities/cultivo.entity';
import { Lote } from '../geo/entities/lote.entity';
import { SubLote } from '../geo/entities/sublote.entity';
import { Venta } from './entities/venta.entity';
import { VentaDetalle } from './entities/venta-detalle.entity';
import { Pago } from './entities/pago.entity';
import { Factura } from './entities/factura.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ReportsModule } from '../reports/reports.module';
import { CultivosModule } from '../cultivos/cultivos.module';
import { GeoModule } from '../geo/geo.module';
import { ExportService } from '../../common/services/export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoAgro,
      LoteProduccion,
      MovimientoProduccion,
      Cliente,
      Venta,
      VentaDetalle,
      Pago,
      Factura,
      Cultivo,
      Lote,
      SubLote,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ReportsModule,
    CultivosModule,
    GeoModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService, ProductionGateway, ExportService],
  exports: [ProductionService],
})
export class ProductionModule {}
