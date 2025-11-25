import { IsNumber, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

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
}
