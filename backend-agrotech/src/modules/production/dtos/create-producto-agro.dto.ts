import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductoAgroDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;
}
