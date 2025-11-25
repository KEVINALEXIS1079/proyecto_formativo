import { Insumo } from '../entities/insumo.entity';
import { MovimientoInsumo } from '../entities/movimiento-insumo.entity';
import { Almacen } from '../entities/almacen.entity';
import { Proveedor } from '../entities/proveedor.entity';
import { Categoria } from '../entities/categoria.entity';

export type InventoryFindAllInsumosResultDto = Insumo[];

export type InventoryFindInsumoByIdResultDto = Insumo;

export type InventoryCreateInsumoResultDto = Insumo;

export type InventoryUpdateInsumoResultDto = Insumo;

export type InventoryRemoveInsumoResultDto = Insumo;

export type InventoryCreateMovimientoResultDto = MovimientoInsumo;

export type InventoryFindMovimientosByInsumoResultDto = MovimientoInsumo[];

export type InventoryFindAllAlmacenesResultDto = Almacen[];

export type InventoryFindAllProveedoresResultDto = Proveedor[];

export type InventoryFindAllCategoriasResultDto = Categoria[];