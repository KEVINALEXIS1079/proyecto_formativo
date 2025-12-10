import { PartialType } from '@nestjs/mapped-types';
import { CreateInsumoDto } from './create-insumo.dto';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class UpdateInsumoDto extends PartialType(CreateInsumoDto) {
  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser un texto válido' })
  fotoUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El stock de uso debe ser un número válido' })
  @Min(0, { message: 'El stock de uso no puede ser negativo' })
  stockUso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario de uso debe ser un número válido' })
  @Min(0, { message: 'El precio unitario de uso no puede ser negativo' })
  precioUnitarioUso?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stock de presentación debe ser un número válido' })
  @Min(0, { message: 'El stock de presentación no puede ser negativo' })
  stockPresentacion?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El valor del inventario debe ser un número válido' })
  @Min(0, { message: 'El valor del inventario no puede ser negativo' })
  valorInventario?: number;

  @IsOptional()
  @IsString({ message: 'La descripción de la operación debe ser un texto válido' })
  descripcionOperacion?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  fechaBaja?: Date;
}
