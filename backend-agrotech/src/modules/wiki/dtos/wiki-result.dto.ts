import { EPA } from '../entities/epa.entity';
import { TipoCultivoWiki } from '../entities/tipo-cultivo-wiki.entity';

export type WikiCreateResultDto = EPA;

export type WikiFindAllResultDto = EPA[];

export type WikiFindOneResultDto = EPA;

export type WikiUpdateResultDto = EPA;

export type WikiRemoveResultDto = EPA;

export type WikiFindAllTiposCultivoResultDto = TipoCultivoWiki[];