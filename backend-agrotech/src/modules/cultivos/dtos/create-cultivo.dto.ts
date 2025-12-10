import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCultivoDto {
  @IsNotEmpty({ message: 'El nombre del cultivo es requerido' })
  @IsString({ message: 'El nombre del cultivo debe ser un texto' })
  nombreCultivo: string;

  @IsOptional()
  @IsString({ message: 'El tipo de cultivo debe ser un texto' })
  tipoCultivo?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  // XOR: loteId O subLoteId
  @ValidateIf((o) => !o.subLoteId)
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  loteId?: number;

  @ValidateIf((o) => !o.loteId)
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del sublote debe ser un número' })
  subLoteId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de siembra debe ser una fecha válida (YYYY-MM-DD)' })
  fechaSiembra?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de finalización debe ser una fecha válida (YYYY-MM-DD)' })
  fechaFinalizacion?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL' })
  imgCultivo?: string;
}
