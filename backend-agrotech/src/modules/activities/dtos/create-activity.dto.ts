import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoActividad {
  CREACION = 'CREACION',
  MANTENIMIENTO = 'MANTENIMIENTO',
  FINALIZACION = 'FINALIZACION',
}

export enum SubtipoActividad {
  SIEMBRA = 'SIEMBRA',
  PREPARACION_SUELO = 'PREPARACION_SUELO',
  RIEGO = 'RIEGO',
  FERTILIZACION = 'FERTILIZACION',
  CONTROL_PLAGAS = 'CONTROL_PLAGAS',

  PODA = 'PODA',
  DESYERBE = 'DESYERBE',
  COSECHA = 'COSECHA',
  FINALIZACION = 'FINALIZACION',
  OTRA = 'OTRA',
}

export class CreateActivityResponsableDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  horas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioHora?: number;
}

export class CreateActivityInsumoDto {
  @IsNotEmpty()
  @IsNumber()
  insumoId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cantidadUso: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  costoUnitarioUso: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CreateActivityServicioDto {
  @IsNotEmpty()
  @IsString()
  nombreServicio: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  horas: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precioHora: number;
}

export class CreateActivityEvidenciaDto {
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes: string[];
}

export class CreateActivityHerramientaDto {
  @IsNotEmpty()
  @IsNumber()
  activoFijoId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  horasUso: number;
}

export class CreateActivityDto {
  @IsNotEmpty({ message: 'El nombre de la actividad es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  // TIPO = Macroproceso (RF15)
  @IsNotEmpty({ message: 'El tipo es requerido' })
  @IsEnum(TipoActividad, { message: 'El tipo debe ser válido' })
  tipo: TipoActividad;

  // SUBTIPO = Acción concreta (RF15)
  @IsNotEmpty({ message: 'El subtipo es requerido' })
  @IsEnum(SubtipoActividad, { message: 'El subtipo debe ser válido' })
  subtipo: SubtipoActividad;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del cultivo debe ser un número' })
  cultivoId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  loteId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del sublote debe ser un número' })
  subLoteId?: number;

  @IsNotEmpty({ message: 'La fecha de la actividad es requerida' })
  @IsDateString({}, { message: 'La fecha debe ser válida (YYYY-MM-DD)' })
  fecha: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto' })
  estado?: string; // 'Pendiente' | 'Finalizada'

  // MANO DE OBRA (RF17)
  @IsOptional()
  @IsNumber({}, { message: 'Las horas de trabajo deben ser número' })
  @Min(0, { message: 'Las horas no pueden ser negativas' })
  horasActividad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio por hora debe ser número' })
  @Min(0, { message: 'El precio por hora no puede ser negativo' })
  precioHoraActividad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El costo de mano de obra debe ser un número' })
  costoManoObra?: number;

  // COSECHA (RF23)
  @ValidateIf((o) => o.subtipo === SubtipoActividad.COSECHA)
  @IsNumber({}, { message: 'Los kg recolectados deben ser un número' })
  @Min(0, { message: 'Los kg no pueden ser negativos' })
  @Min(0, { message: 'Los kg no pueden ser negativos' })
  kgRecolectados?: number;

  @ValidateIf((o) => o.subtipo === SubtipoActividad.COSECHA)
  @IsNumber({}, { message: 'El producto es requerido para cosecha' })
  productoAgroId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityResponsableDto)
  responsables?: CreateActivityResponsableDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityInsumoDto)
  insumos?: CreateActivityInsumoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityServicioDto)
  servicios?: CreateActivityServicioDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityEvidenciaDto)
  evidencias?: CreateActivityEvidenciaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityHerramientaDto)
  herramientas?: CreateActivityHerramientaDto[];
}
