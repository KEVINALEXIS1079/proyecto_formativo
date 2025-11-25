import {
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateTipoCultivoWikiDto {
  @IsNotEmpty({ message: 'El nombre del tipo de cultivo es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}