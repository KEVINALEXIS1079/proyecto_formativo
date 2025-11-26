import { IsNumber, IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLoteProduccionDto {
  @IsNumber()
  @IsNotEmpty()
  productoAgroId: number;

  @IsNumber()
  @IsNotEmpty()
  cultivoId: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsDateString()
  @IsNotEmpty()
  fechaCosecha: Date;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: Date;

  @IsNumber()
  @IsOptional()
  actividadCosechaId?: number;

  @IsString()
  @IsOptional()
  calidad?: string;
}
