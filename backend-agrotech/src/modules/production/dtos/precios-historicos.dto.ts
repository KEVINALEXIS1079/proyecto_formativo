import { IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PreciosHistoricosDto {
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
  cultivoId?: number;

  @IsOptional()
  @IsEnum(['dia', 'semana', 'mes'])
  agregacion?: 'dia' | 'semana' | 'mes';

  @IsOptional()
  @IsEnum(['csv', 'xls'])
  export?: 'csv' | 'xls';
}

export interface PrecioHistoricoItem {
  fecha: string;
  precioPromedioKg: number;
}