import { IsOptional, IsNumber, IsArray, ValidateNested, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVentaDetalleDto {
  @IsNumber()
  @IsPositive()
  loteProduccionId: number;

  @IsNumber()
  @Min(0.01)
  cantidadKg: number;

  @IsNumber()
  @Min(0)
  precioUnitarioKg: number;
}

export class CreateVentaPagoDto {
  @IsString()
  metodoPago: string;

  @IsNumber()
  @Min(0.01)
  monto: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  detalles: CreateVentaDetalleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaPagoDto)
  pagos: CreateVentaPagoDto[];
}