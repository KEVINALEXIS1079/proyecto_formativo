import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateActivoFijoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsNumber()
    @IsNotEmpty()
    categoriaId: number;

    @IsNumber()
    @IsNotEmpty()
    almacenId: number;

    @IsNumber()
    @IsOptional()
    proveedorId?: number;

    @IsNumber()
    @IsNotEmpty()
    costoAdquisicion: number;

    @IsNumber()
    @IsNotEmpty()
    valorResidual: number;

    @IsNumber()
    @IsNotEmpty()
    vidaUtilHoras: number;

    @IsDateString()
    @IsNotEmpty()
    fechaAdquisicion: Date;

    @IsString()
    @IsOptional()
    fotoUrl?: string;
}
