import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './services/inventory.service';
import { InventoryGateway } from './gateways/inventory.gateway';
import { InventoryController } from './controllers/inventory.controller';
import { Insumo } from './entities/insumo.entity';
import { MovimientoInsumo } from './entities/movimiento-insumo.entity';
import { Almacen } from './entities/almacen.entity';
import { Proveedor } from './entities/proveedor.entity';
import { Categoria } from './entities/categoria.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Insumo, Almacen, Proveedor, Categoria, MovimientoInsumo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  providers: [InventoryService, InventoryGateway, InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
