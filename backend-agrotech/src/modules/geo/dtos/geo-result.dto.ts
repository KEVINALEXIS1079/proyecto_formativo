import { Lote } from '../entities/lote.entity';
import { SubLote } from '../entities/sublote.entity';

export class GeoFindAllLotesResultDto {
  lotes: Lote[];
}

export class GeoFindLoteByIdResultDto {
  lote: Lote;
}

export class GeoCreateLoteResultDto {
  lote: Lote;
}

export class GeoUpdateLoteResultDto {
  lote: Lote;
}

export class GeoRemoveLoteResultDto {
  lote: Lote;
}

export class GeoFindAllSubLotesResultDto {
  sublotes: SubLote[];
}

export class GeoFindSubLoteByIdResultDto {
  sublote: SubLote;
}

export class GeoCreateSubLoteResultDto {
  sublote: SubLote;
}

export class GeoUpdateSubLoteResultDto {
  sublote: SubLote;
}

export class GeoRemoveSubLoteResultDto {
  sublote: SubLote;
}