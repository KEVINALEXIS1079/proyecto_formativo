import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './services/inventory.service';
import { MovimientoInsumoService } from './services/movimiento-insumo.service';
import { InventoryGateway } from './gateways/inventory.gateway';
import { InventoryController } from './controllers/inventory.controller';
import { Insumo } from './entities/insumo.entity';
import { MovimientoInsumo } from './entities/movimiento-insumo.entity';
import { Almacen } from './entities/almacen.entity';
import { Proveedor } from './entities/proveedor.entity';
import { Categoria } from './entities/categoria.entity';
import { UsoHerramienta } from './entities/uso-herramienta.entity';
import { DepreciationService } from './services/depreciation.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Insumo,
      Almacen,
      Proveedor,
      Categoria,
      MovimientoInsumo,
      UsoHerramienta,
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
  controllers: [InventoryController],
  providers: [MovimientoInsumoService, InventoryService, InventoryGateway, DepreciationService],
  exports: [InventoryService, DepreciationService],
})
export class InventoryModule { }
