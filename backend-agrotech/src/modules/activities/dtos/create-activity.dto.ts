import { 
  IsString, 
  IsOptional, 
  IsNotEmpty, 
  IsNumber, 
  IsDateString, 
  IsEnum,
  Min,
  ValidateIf
} from 'class-validator';

export enum TipoActividad {
  CREACION = 'CREACION',
  MANTENIMIENTO = 'MANTENIMIENTO',
  FINALIZACION = 'FINALIZACION',
}

export enum SubtipoActividad {
  SIEMBRA = 'SIEMBRA',
  RIEGO = 'RIEGO',
  FERTILIZACION = 'FERTILIZACION',
  CONTROL_PLAGAS = 'CONTROL_PLAGAS',
  PODA = 'PODA',
  COSECHA = 'COSECHA',
  FINALIZACION = 'FINALIZACION',
  OTRA = 'OTRA',
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

  @IsNotEmpty({ message: 'El ID del cultivo es requerido' })
  @IsNumber({}, { message: 'El ID del cultivo debe ser un número' })
  cultivoId: number;

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
  kgRecolectados?: number;

  // SIEMBRA (RF21)
  @ValidateIf((o) => o.subtipo === SubtipoActividad.SIEMBRA)
  @IsDateString({}, { message: 'La fecha de siembra debe ser válida' })
  fechaSiembra?: string;

  // SERVICIOS (RF18)
  @IsOptional()
  servicios?: {
    nombreServicio: string;
    horas: number;
    precioHora: number;
  }[];

  // EVIDENCIAS (RF19)
  @IsOptional()
  evidencias?: {
    descripcion: string;
  }[];

  // INSUMOS (RF20)
  @IsOptional()
  insumos?: {
    insumoId: number;
    cantidadUso: number;
    precioUnitarioUso: number;
  }[];
}
