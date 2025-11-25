import { IsString, IsOptional, IsNotEmpty, MaxLength, IsObject } from 'class-validator';

export class CreateLoteDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsObject({ message: 'La geometría debe ser un objeto GeoJSON válido' })
  @IsNotEmpty({ message: 'La geometría es requerida' })
  geom: any; // GeoJSON Polygon
}
