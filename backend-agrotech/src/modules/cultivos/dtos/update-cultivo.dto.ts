import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCultivoDto } from './create-cultivo.dto';

export class UpdateCultivoDto extends PartialType(CreateCultivoDto) {
  @IsNotEmpty({ message: 'El motivo del cambio es obligatorio' })
  @IsString({ message: 'El motivo debe ser texto' })
  motivo: string;
}
