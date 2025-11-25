import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { EPA } from './epa.entity';
import { TipoCultivoWiki } from './tipo-cultivo-wiki.entity';

@Entity('epa_tipos_cultivos_wiki')
export class EPA_TipoCultivoWiki {
  @PrimaryColumn()
  epaId: number;

  @PrimaryColumn()
  tipoCultivoWikiId: number;

  @ManyToOne(() => EPA, (epa) => epa.epaTipoCultivos)
  epa: EPA;

  @ManyToOne(() => TipoCultivoWiki, (tipo) => tipo.epaTipoCultivos)
  tipoCultivoWiki: TipoCultivoWiki;
}
