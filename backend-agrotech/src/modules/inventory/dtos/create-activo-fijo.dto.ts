import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivoFijoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    categoriaId: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    almacenId: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    proveedorId?: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    costoAdquisicion: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    valorResidual: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    vidaUtilHoras: number;

    @IsDateString()
    @IsNotEmpty()
    fechaAdquisicion: Date;

    @IsString()
    @IsOptional()
    fotoUrl?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    cantidad?: number;
}
