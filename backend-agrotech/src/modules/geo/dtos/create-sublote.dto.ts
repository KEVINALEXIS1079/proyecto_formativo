import { IsString, IsNumber, IsOptional, IsNotEmpty, MaxLength, IsObject } from 'class-validator';

export class CreateSubLoteDto {
  @IsNumber({}, { message: 'El ID del lote debe ser un número válido' })
  @IsNotEmpty({ message: 'El ID del lote es requerido' })
  loteId: number;

  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsObject({ message: 'La geometría debe ser un objeto GeoJSON válido' })
  @IsNotEmpty({ message: 'La geometría es requerida' })
  geom: any; // GeoJSON Polygon
}
