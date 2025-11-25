export interface Cultivo {
  id_cultivo_pk: number;
  nombre_cultivo: string;
  descripcion_cultivo: string;
  img_cultivo?: string;
  estado_cultivo: string;
  fecha_inicio_cultivo: string;
  fecha_fin_cultivo?: string;
  id_sublote_fk: number;
  id_tipo_cultivo_fk: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
