import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductoAgroDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  unidadBase: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;
}
