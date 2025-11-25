import { IsNumber, IsString, IsOptional } from 'class-validator';
import { CreateInsumoDto } from './create-insumo.dto';
import { UpdateInsumoDto } from './update-insumo.dto';

export class InventoryFindAllInsumosDoDto {
  @IsOptional()
  @IsNumber()
  categoriaId?: number;

  @IsOptional()
  @IsNumber()
  almacenId?: number;

  @IsOptional()
  @IsString()
  q?: string;
}

export class InventoryFindInsumoByIdDoDto {
  @IsNumber()
  id: number;
}

export class InventoryCreateInsumoDoDto extends CreateInsumoDto {}

export class InventoryUpdateInsumoDoDto {
  @IsNumber()
  id: number;

  data: UpdateInsumoDto;
}

export class InventoryRemoveInsumoDoDto {
  @IsNumber()
  id: number;
}

export class InventoryCreateMovimientoDoDto {
  @IsNumber()
  insumoId: number;

  @IsString()
  tipo: string;

  @IsOptional()
  @IsNumber()
  cantidadPresentacion?: number;

  @IsNumber()
  cantidadUso: number;

  @IsNumber()
  costoUnitarioUso: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  actividadId?: number;
}

export class InventoryFindMovimientosByInsumoDoDto {
  @IsNumber()
  insumoId: number;
}

export class InventoryFindAllAlmacenesDoDto {}

export class InventoryFindAllProveedoresDoDto {}

export class InventoryFindAllCategoriasDoDto {}