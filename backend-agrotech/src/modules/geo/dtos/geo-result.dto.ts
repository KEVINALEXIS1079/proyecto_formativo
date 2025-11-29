import { Lote } from '../entities/lote.entity';
import { SubLote } from '../entities/sublote.entity';

export type GeoFindAllLotesResultDto = Lote[];

export type GeoFindLoteByIdResultDto = Lote;

export type GeoCreateLoteResultDto = Lote;

export type GeoUpdateLoteResultDto = Lote;

export type GeoRemoveLoteResultDto = Lote;

export type GeoFindAllSubLotesResultDto = SubLote[];

export type GeoFindSubLoteByIdResultDto = SubLote;

export type GeoCreateSubLoteResultDto = SubLote;

export type GeoUpdateSubLoteResultDto = SubLote;

export type GeoRemoveSubLoteResultDto = SubLote;

