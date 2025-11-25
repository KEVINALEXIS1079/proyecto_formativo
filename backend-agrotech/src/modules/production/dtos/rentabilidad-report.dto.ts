import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RentabilidadReportDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  from?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  to?: Date;

  @IsEnum(['cultivo', 'lote', 'sublote'])
  entidad: 'cultivo' | 'lote' | 'sublote';

  @IsOptional()
  @IsEnum(['csv', 'xls'])
  export?: 'csv' | 'xls';
}