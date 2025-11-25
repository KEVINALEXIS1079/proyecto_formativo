import { IsOptional, IsNumber, IsString, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs for WebSocket message bodies in production gateway

export class ProductionFindAllLotesProduccionDoDto {
  @IsOptional()
  @IsNumber()
  productoAgroId?: number;

  @IsOptional()
  @IsNumber()
  cultivoId?: number;
}

export class ProductionCreateVentaDetalleDoDto {
  @IsNumber()
  loteProduccionId: number;

  @IsNumber()
  cantidadKg: number;

  @IsNumber()
  precioUnitarioKg: number;
}

export class ProductionCreateVentaPagoDoDto {
  @IsString()
  metodoPago: string;

  @IsNumber()
  monto: number;
}

export class ProductionCreateVentaDoDto {
  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionCreateVentaDetalleDoDto)
  detalles: ProductionCreateVentaDetalleDoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionCreateVentaPagoDoDto)
  pagos: ProductionCreateVentaPagoDoDto[];
}

export class ProductionFindAllVentasDoDto {
  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class ProductionFindVentaByIdDoDto {
  @IsNumber()
  id: number;
}

export class ProductionAnularVentaDoDto {
  @IsNumber()
  ventaId: number;
}

export class ProductionCreateClienteDoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  identificacion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  correo?: string;
}