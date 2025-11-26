import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreateLoteProduccionDto } from './create-lote-produccion.dto';

export class UpdateLoteProduccionDto extends PartialType(CreateLoteProduccionDto) {
  @IsString()
  @IsOptional()
  calidad?: string;
}