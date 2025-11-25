import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindAllVentasDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clienteId?: number;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaInicio?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaFin?: Date;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}