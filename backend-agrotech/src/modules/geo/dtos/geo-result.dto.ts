import { Lote } from '../entities/lote.entity';
import { SubLote } from '../entities/sublote.entity';
import { Cultivo } from '../entities/cultivo.entity';

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

export type GeoFindAllCultivosResultDto = Cultivo[];

export type GeoFindCultivoByIdResultDto = Cultivo;

export type GeoCreateCultivoResultDto = Cultivo;

export type GeoUpdateCultivoResultDto = Cultivo;

export type GeoRemoveCultivoResultDto = Cultivo;