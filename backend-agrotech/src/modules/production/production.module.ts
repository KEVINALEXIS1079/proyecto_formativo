import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './services/production.service';
import { ProductionGateway } from './gateways/production.gateway';
import { ProductionController } from './controllers/production.controller';
import { ProductoAgro } from './entities/producto-agro.entity';
import { LoteProduccion } from './entities/lote-produccion.entity';
import { MovimientoProduccion } from './entities/movimiento-produccion.entity';
import { Cliente } from './entities/cliente.entity';
import { Venta } from './entities/venta.entity';
import { VentaDetalle } from './entities/venta-detalle.entity';
import { Pago } from './entities/pago.entity';
import { Factura } from './entities/factura.entity';
import { HistorialPrecioLote } from './entities/historial-precio-lote.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ImageUploadService } from '../../common/services/image-upload.service';

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
      HistorialPrecioLote,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService, ProductionGateway, ProductionController, ImageUploadService],
  exports: [ProductionService],
})
export class ProductionModule {}
