import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateTipoSensorDto {
  @IsString()
  nombre: string;

  @IsString()
  unidad: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  decimales?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  ttlMinutos?: number;
}