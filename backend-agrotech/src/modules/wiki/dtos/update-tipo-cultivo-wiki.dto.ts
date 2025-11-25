import {
  IsString,
  IsOptional,
} from 'class-validator';

export class UpdateTipoCultivoWikiDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}