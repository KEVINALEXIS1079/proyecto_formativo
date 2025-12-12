import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { CreateLoteProduccionDto } from './create-lote-produccion.dto';

export class UpdateLoteProduccionDto extends PartialType(CreateLoteProduccionDto) {
  @IsString()
  @IsOptional()
  calidad?: string;

  @IsNumber()
  @IsOptional()
  precioSugeridoKg?: number;
}