import { IsOptional, IsNumber, IsString, IsDateString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class VentasReportDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  from?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  to?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productoAgroId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clienteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cultivoId?: number;

  @IsOptional()
  @IsEnum(['cliente', 'producto', 'cultivo'])
  groupBy?: 'cliente' | 'producto' | 'cultivo';

  @IsOptional()
  @IsEnum(['csv', 'xls'])
  export?: 'csv' | 'xls';
}