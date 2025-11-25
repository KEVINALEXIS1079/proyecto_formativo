import { 
  IsString, 
  IsOptional, 
  IsNotEmpty, 
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max
} from 'class-validator';

export enum TipoEpa {
  ENFERMEDAD = 'ENFERMEDAD',
  PLAGA = 'PLAGA',
  ARVENCE = 'ARVENCE',
}

export class CreateEpaDto {
  @IsNotEmpty({ message: 'El nombre de la EPA es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El tipo de EPA es requerido' })
  @IsEnum(TipoEpa, { 
    message: 'El tipo debe ser uno de: ENFERMEDAD, PLAGA, ARVENCE' 
  })
  tipoEpa: TipoEpa;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'Los síntomas deben ser un texto' })
  sintomas?: string;

  @IsOptional()
  @IsString({ message: 'El manejo debe ser un texto' })
  manejo?: string;

  @IsOptional()
  @IsArray({ message: 'Los meses probables deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada mes debe ser un número' })
  @Min(1, { each: true, message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { each: true, message: 'El mes debe estar entre 1 y 12' })
  mesesProbables?: number[];

  @IsOptional()
  @IsArray({ message: 'Las temporadas deben ser un array' })
  @IsString({ each: true, message: 'Cada temporada debe ser un texto' })
  temporadas?: string[];


  @IsOptional()
  @IsArray({ message: 'Los tags deben ser un array' })
  @IsString({ each: true, message: 'Cada tag debe ser un texto' })
  tags?: string[];

  @IsOptional()
  @IsArray({ message: 'Los tipos de cultivo deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de tipo de cultivo debe ser un número' })
  tiposCultivoIds?: number[];
}
