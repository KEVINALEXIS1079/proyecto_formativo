import { IsArray, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FinalizeActivityInsmoRealDto {
  @IsNumber()
  insumoId: number;

  @IsNumber()
  @Min(0)
  cantidad: number;
}

export class FinalizeActivityHerramientaDto {
  @IsNumber()
  activoFijoId: number;

  @IsNumber()
  @Min(0)
  horasUso: number;
}

export class FinalizeActivityResponsableDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  @Min(0)
  horas: number;
}

export class FinalizeActivityProduccionDto {
    @IsNumber()
    @Min(0)
    cantidad: number;

    @IsString()
    unidad: string;
}

export class FinalizeActivityEvidenciaDto {
    @IsString()
    descripcion: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imagenes: string[];
}

export class FinalizeActivityDto {
  @IsOptional()
  @IsDateString()
  fechaReal?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeActivityInsmoRealDto)
  insumosReales?: FinalizeActivityInsmoRealDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeActivityHerramientaDto)
  herramientas?: FinalizeActivityHerramientaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeActivityResponsableDto)
  responsables?: FinalizeActivityResponsableDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FinalizeActivityProduccionDto)
  produccion?: FinalizeActivityProduccionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalizeActivityEvidenciaDto)
  evidencias?: FinalizeActivityEvidenciaDto[];
}
