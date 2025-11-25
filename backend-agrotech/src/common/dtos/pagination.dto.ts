import { IsOptional, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO común para paginación en todos los listados
 * RF65: Estandarizar filtros y paginación
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser >= 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser >= 1' })
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'orderBy debe ser un string' })
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: 'orderDir debe ser ASC o DESC' })
  orderDir?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

  @IsOptional()
  @IsString({ message: 'q debe ser un string' })
  q?: string; // Búsqueda general de texto
}

/**
 * DTO para filtros de fecha
 */
export class DateRangeFilterDto {
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  to?: Date;
}

/**
 * DTO combinado: Paginación + Rango de fechas
 */
export class PaginationWithDateRangeDto extends PaginationDto {
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  to?: Date;
}
