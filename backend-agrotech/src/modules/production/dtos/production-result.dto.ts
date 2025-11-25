import { ProductoAgro } from '../entities/producto-agro.entity';
import { LoteProduccion } from '../entities/lote-produccion.entity';
import { Venta } from '../entities/venta.entity';
import { Cliente } from '../entities/cliente.entity';

// Result types for WebSocket responses in production gateway

export type ProductionFindAllProductosResultDto = ProductoAgro[];

export type ProductionCreateProductoResultDto = ProductoAgro;

export type ProductionFindAllLotesProduccionResultDto = LoteProduccion[];

export type ProductionCreateVentaResultDto = Venta;

export type ProductionFindAllVentasResultDto = Venta[];

export type ProductionFindVentaByIdResultDto = Venta;

export type ProductionAnularVentaResultDto = Venta;

export type ProductionFindAllClientesResultDto = Cliente[];

export type ProductionCreateClienteResultDto = Cliente;