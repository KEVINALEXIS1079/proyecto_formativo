import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum TipoMateria {
  LIQUIDO = 'liquido',
  SOLIDO = 'solido',
}

export class CreateInsumoDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsEnum(TipoMateria, { message: 'El tipo de materia debe ser: SEMILLA, FERTILIZANTE, PLAGUICIDA, HERRAMIENTA u OTRO' })
  tipoMateria: TipoMateria;

  @IsString({ message: 'La unidad de uso debe ser un texto válido' })
  @IsNotEmpty({ message: 'La unidad de uso es requerida' })
  @MaxLength(20, { message: 'La unidad de uso no puede exceder 20 caracteres' })
  unidadUso: string;

  @IsNumber({}, { message: 'El stock de uso debe ser un número válido' })
  @Min(0, { message: 'El stock de uso no puede ser negativo' })
  stockUso: number;

  @IsNumber({}, { message: 'El precio unitario de uso debe ser un número válido' })
  @Min(0, { message: 'El precio unitario de uso no puede ser negativo' })
  precioUnitarioUso: number;

  @IsOptional()
  @IsString({ message: 'La unidad de presentación debe ser un texto válido' })
  @MaxLength(20, { message: 'La unidad de presentación no puede exceder 20 caracteres' })
  presentacionUnidad?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad de presentación debe ser un número válido' })
  @Min(0, { message: 'La cantidad de presentación no puede ser negativa' })
  presentacionCantidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stock de presentación debe ser un número válido' })
  @Min(0, { message: 'El stock de presentación no puede ser negativo' })
  stockPresentacion?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El factor de conversión debe ser un número válido' })
  @Min(0, { message: 'El factor de conversión no puede ser negativo' })
  factorConversionUso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El almacén ID debe ser un número válido' })
  almacenId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El proveedor ID debe ser un número válido' })
  proveedorId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La categoría ID debe ser un número válido' })
  categoriaId?: number;
}
