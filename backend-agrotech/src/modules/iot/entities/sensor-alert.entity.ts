import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Sensor } from './sensor.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';

export type AlertaTipo = 'LOW' | 'HIGH';

@Entity('sensor_alertas')
export class SensorAlerta extends BaseEntity {
  @Column({ name: 'sensor_id' })
  sensorId: number;

  @ManyToOne(() => Sensor)
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;

  @Column('float')
  valor: number;

  @Column('float', { nullable: true })
  umbral: number | null;

  @Column({ type: 'varchar', length: 10 })
  tipo: AlertaTipo;

  @Column({ name: 'fecha_alerta' })
  fechaAlerta: Date;

  @Column({ name: 'lote_id', nullable: true })
  loteId: number | null;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote | null;

  @Column({ name: 'sub_lote_id', nullable: true })
  subLoteId: number | null;

  @ManyToOne(() => SubLote, { nullable: true })
  @JoinColumn({ name: 'sub_lote_id' })
  subLote: SubLote | null;
}
