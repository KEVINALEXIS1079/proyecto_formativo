import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Sensor } from '../../iot/entities/sensor.entity';
import { SensorLectura } from '../../iot/entities/sensor-lectura.entity';
import { SensorAlerta } from '../../iot/entities/sensor-alert.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { IotGlobalConfig } from '../../iot/entities/iot-global-config.entity';
import { CsvExportService } from './csv-export.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class IotReportsService {
  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura)
    private lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(SensorAlerta)
    private alertaRepo: Repository<SensorAlerta>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    @InjectRepository(IotGlobalConfig)
    private globalConfigRepo: Repository<IotGlobalConfig>,
    private csvService: CsvExportService,
  ) {}

  // RF44-RF46: Agregaciones de lecturas
  async getSensorAggregations(filters: {
    sensorId?: number;
    cultivoId?: number;
    loteId?: number;
    from?: Date;
    to?: Date;
    interval?: 'hour' | 'day' | 'week';
  }) {
    const query = this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('AVG(CAST(lectura.valor AS DECIMAL))', 'avg')
      .addSelect('MIN(CAST(lectura.valor AS DECIMAL))', 'min')
      .addSelect('MAX(CAST(lectura.valor AS DECIMAL))', 'max')
      .addSelect('COUNT(*)', 'count');

    // Intervalo de tiempo para agrupación
    if (filters.interval === 'hour') {
      query
        .addSelect("DATE_TRUNC('hour', lectura.fechaLectura)", 'time_bucket')
        .groupBy("DATE_TRUNC('hour', lectura.fechaLectura)");
    } else if (filters.interval === 'week') {
      query
        .addSelect("DATE_TRUNC('week', lectura.fechaLectura)", 'time_bucket')
        .groupBy("DATE_TRUNC('week', lectura.fechaLectura)");
    } else {
      // Default day
      query
        .addSelect('DATE(lectura.fechaLectura)', 'time_bucket')
        .groupBy('DATE(lectura.fechaLectura)');
    }

    query.orderBy('time_bucket', 'ASC');

    if (filters.sensorId) {
      query.andWhere('lectura.sensorId = :sensorId', {
        sensorId: filters.sensorId,
      });
    }

    if (filters.cultivoId) {
      query.andWhere('sensor.cultivoId = :cultivoId', {
        cultivoId: filters.cultivoId,
      });
    }

    if (filters.loteId) {
      query.andWhere('sensor.loteId = :loteId', {
        loteId: filters.loteId,
      });
    }

    if (filters.from) {
      query.andWhere('lectura.fechaLectura >= :from', { from: filters.from });
    }

    if (filters.to) {
      query.andWhere('lectura.fechaLectura <= :to', { to: filters.to });
    }

    return query.getRawMany();
  }

  // RF47: Estadísticas fuera de rango
  async getOutOfRangeStats(sensorId: number) {
    const sensor = await this.sensorRepo.findOne({ where: { id: sensorId } });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');

    if (sensor.umbralMin === null && sensor.umbralMax === null) {
      return { message: 'Sensor sin umbrales configurados' };
    }

    const totalLecturas = await this.lecturaRepo.count({ where: { sensorId } });

    const query = this.lecturaRepo
      .createQueryBuilder('lectura')
      .where('lectura.sensorId = :sensorId', { sensorId });

    const conditions = [];
    if (sensor.umbralMin !== null) {
      conditions.push(`lectura.valor < ${sensor.umbralMin}`);
    }
    if (sensor.umbralMax !== null) {
      conditions.push(`lectura.valor > ${sensor.umbralMax}`);
    }

    if (conditions.length > 0) {
      query.andWhere(`(${conditions.join(' OR ')})`);
    }

    const fueraDeRango = await query.getCount();
    const porcentaje =
      totalLecturas > 0 ? (fueraDeRango / totalLecturas) * 100 : 0;

    return {
      sensorId,
      totalLecturas,
      fueraDeRango,
      porcentaje: parseFloat(porcentaje.toFixed(2)),
      umbrales: { min: sensor.umbralMin, max: sensor.umbralMax },
    };
  }

  // RF48: Uptime (Disponibilidad)
  // Calculado como % de tiempo que el sensor ha estado reportando vs tiempo total esperado
  // Simplificación: Basado en la última vez visto vs ahora
  async getUptimeStats(sensorId: number) {
    const sensor = await this.sensorRepo.findOne({
      where: { id: sensorId },
      relations: ['tipoSensor'],
    });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');

    // Si nunca se ha visto, uptime 0
    if (!sensor.lastSeenAt) return { uptime: 0, status: 'NEVER_SEEN' };

    const now = new Date().getTime();
    const lastSeen = new Date(sensor.lastSeenAt).getTime();
    const diffMinutes = (now - lastSeen) / (1000 * 60);

    // TTL esperado (default 5 min)
    const ttl = sensor.tipoSensor?.ttlMinutos || 5;

    // Estado actual
    const isOnline = diffMinutes <= ttl;

    // Para un cálculo histórico real de uptime necesitaríamos un log de estados de conexión.
    // Por ahora retornamos el estado actual y el tiempo desde la última conexión.
    return {
      sensorId,
      isOnline,
      lastSeenAt: sensor.lastSeenAt,
      minutesSinceLastSeen: Math.round(diffMinutes),
      ttlExpected: ttl,
    };
  }

  // RF49: Sparklines para dashboard (últimas N lecturas)
  async getSparkline(sensorId: number, limit: number = 20) {
    return this.lecturaRepo.find({
      where: { sensorId },
      order: { fechaLectura: 'DESC' },
      take: limit,
      select: ['fechaLectura', 'valor'],
    });
  }

  // RF50: Dashboard General
  async getDashboardStats() {
    const totalSensores = await this.sensorRepo.count();
    const sensoresActivos = await this.sensorRepo.count({
      where: { activo: true },
    });

    // Sensores con alertas (estadoConexion contiene 'alerta')
    const alertas = await this.sensorRepo
      .createQueryBuilder('sensor')
      .where('sensor.estadoConexion LIKE :alerta', { alerta: '%alerta%' })
      .getCount();

    return {
      totalSensores,
      sensoresActivos,
      alertasActivas: alertas,
      timestamp: new Date(),
    };
  }

  // RF50: Comparativa de sensores
  async getSensorComparison(filters: {
    tipoSensorId?: number;
    cultivoId?: number;
    loteId?: number;
    from?: Date;
    to?: Date;
    metric: 'avg' | 'min' | 'max';
    limit?: number;
  }) {
    const metricFunc =
      filters.metric === 'min'
        ? 'MIN'
        : filters.metric === 'max'
          ? 'MAX'
          : 'AVG';

    const query = this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('sensor.id', 'sensorId')
      .addSelect('sensor.nombre', 'nombreSensor')
      .addSelect(`${metricFunc}(CAST(lectura.valor AS DECIMAL))`, 'value')
      .groupBy('sensor.id')
      .addGroupBy('sensor.nombre')
      .orderBy('value', 'DESC');

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.tipoSensorId) {
      query.andWhere('sensor.tipoSensorId = :tipoId', {
        tipoId: filters.tipoSensorId,
      });
    }
    if (filters.cultivoId) {
      query.andWhere('sensor.cultivoId = :cultId', {
        cultId: filters.cultivoId,
      });
    }
    if (filters.loteId) {
      query.andWhere('sensor.loteId = :loteId', {
        loteId: filters.loteId,
      });
    }
    if (filters.from) {
      query.andWhere('lectura.fechaLectura >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('lectura.fechaLectura <= :to', { to: filters.to });
    }

    return query.getRawMany();
  }

  // Resumen de lecturas por periodo (promedio, max, min con fechas)
  async getSummaryReport(filters: {
    tipoSensorId: number;
    cultivoId?: number;
    from: Date;
    to: Date;
  }) {
    // Build base query
    const query = this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .leftJoin('sensor.tipoSensor', 'tipo')
      .where('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId })
      .andWhere('lectura.fechaLectura >= :from', { from: filters.from })
      .andWhere('lectura.fechaLectura <= :to', { to: filters.to });

    // Filter by cultivo if provided
    if (filters.cultivoId) {
      query.andWhere('sensor.cultivoId = :cultivoId', {
        cultivoId: filters.cultivoId,
      });
    }

    // Get aggregate statistics
    const stats = await this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('AVG(CAST(lectura.valor AS DECIMAL))', 'promedio')
      .addSelect('COUNT(*)', 'totalLecturas')
      .where('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId })
      .andWhere('lectura.fechaLectura >= :from', { from: filters.from })
      .andWhere('lectura.fechaLectura <= :to', { to: filters.to })
      .andWhere(
        filters.cultivoId ? 'sensor.cultivoId = :cultivoId' : '1=1',
        filters.cultivoId ? { cultivoId: filters.cultivoId } : {},
      )
      .andWhere("NOT (lectura.valor LIKE '{%}')")
      .andWhere("NOT (lectura.valor ~ '^[a-zA-Z]+$')")
      .getRawOne();

    // Get max reading with details
    const maxReading = await this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('lectura.valor', 'valor')
      .addSelect('lectura.fechaLectura', 'fecha')
      .addSelect('sensor.nombre', 'sensorNombre')
      .where('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId })
      .andWhere('lectura.fechaLectura >= :from', { from: filters.from })
      .andWhere('lectura.fechaLectura <= :to', { to: filters.to })
      .andWhere(
        filters.cultivoId ? 'sensor.cultivoId = :cultivoId' : '1=1',
        filters.cultivoId ? { cultivoId: filters.cultivoId } : {},
      )
      .andWhere("NOT (lectura.valor LIKE '{%}')")
      .andWhere("NOT (lectura.valor ~ '^[a-zA-Z]+$')")
      .orderBy('CAST(lectura.valor AS DECIMAL)', 'DESC')
      .limit(1)
      .getRawOne();

    // Get min reading with details
    const minReading = await this.lecturaRepo
      .createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('lectura.valor', 'valor')
      .addSelect('lectura.fechaLectura', 'fecha')
      .addSelect('sensor.nombre', 'sensorNombre')
      .where('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId })
      .andWhere('lectura.fechaLectura >= :from', { from: filters.from })
      .andWhere('lectura.fechaLectura <= :to', { to: filters.to })
      .andWhere(
        filters.cultivoId ? 'sensor.cultivoId = :cultivoId' : '1=1',
        filters.cultivoId ? { cultivoId: filters.cultivoId } : {},
      )
      .andWhere("NOT (lectura.valor LIKE '{%}')")
      .andWhere("NOT (lectura.valor ~ '^[a-zA-Z]+$')")
      .orderBy('CAST(lectura.valor AS DECIMAL)', 'ASC')
      .limit(1)
      .getRawOne();

    // Get tipo sensor info
    const tipoSensor = await this.sensorRepo
      .createQueryBuilder('sensor')
      .leftJoin('sensor.tipoSensor', 'tipo')
      .select('tipo.nombre', 'nombre')
      .addSelect('tipo.unidad', 'unidad')
      .where('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId })
      .getRawOne();

    return {
      periodo: {
        desde: filters.from,
        hasta: filters.to,
      },
      tipoSensor: tipoSensor?.nombre || 'Desconocido',
      unidad: tipoSensor?.unidad || 'N/A',
      promedio: stats?.promedio
        ? parseFloat(parseFloat(stats.promedio).toFixed(2))
        : 0,
      totalLecturas: parseInt(stats?.totalLecturas || '0'),
      lecturaMaxima: maxReading
        ? {
            valor: parseFloat(maxReading.valor),
            fecha: maxReading.fecha,
            sensor: maxReading.sensorNombre,
          }
        : null,
      lecturaMinima: minReading
        ? {
            valor: parseFloat(minReading.valor),
            fecha: minReading.fecha,
            sensor: minReading.sensorNombre,
          }
        : null,
    };
  }

  async getIotReportCsv(
    type: 'aggregation' | 'comparison',
    filters: any,
  ): Promise<string> {
    let data = [];
    let columns = [];

    if (type === 'aggregation') {
      data = await this.getSensorAggregations(filters);
      columns = ['time_bucket', 'avg', 'min', 'max', 'count'];
    } else {
      data = await this.getSensorComparison(filters);
      columns = ['sensorId', 'nombreSensor', 'value'];
    }

    return this.csvService.generateCsv(data, columns);
  }

  async generateLotPdf(filters: {
    loteId?: number;
    sensorId?: number;
    from?: Date;
    to?: Date;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));

    const primary = '#0ea5e9';
    const secondary = '#1e293b';
    const success = '#22c55e';
    const purple = '#8b5cf6';
    const slate = '#64748b';
    const light = '#f8fafc';
    const mutedBorder = '#e2e8f0';
    const headerBg = '#ffffff';
    const headerText = '#16a34a';
    const divider = '#e5e7eb';
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const formatDate = (d?: Date) => (d ? d.toISOString().slice(0, 10) : 'N/A');
    const logoPath = path.join(process.cwd(), '..', 'agrotech-web', 'public', 'LogoTic.png');

    const sensores = await this.sensorRepo.find({
      where: {
        ...(filters.loteId ? { loteId: filters.loteId } : {}),
        ...(filters.sensorId ? { id: filters.sensorId } : {}),
        activo: true,
      },
      relations: ['tipoSensor', 'globalConfig'],
    });

    const dateFrom = filters.from ? new Date(filters.from) : undefined;
    if (dateFrom) {
      dateFrom.setHours(0, 0, 0, 0);
    }
    const dateTo = filters.to ? new Date(filters.to) : undefined;
    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }

    const sensorIds = sensores.map((s) => s.id);
    const alertsRaw = await this.alertaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.sensor', 'sensor')
      .where('1=1')
      .andWhere(
        filters.loteId
          ? '(a.loteId = :loteId OR sensor.loteId = :loteId)'
          : '1=1',
        { loteId: filters.loteId },
      )
      .andWhere(sensorIds.length > 0 ? 'a.sensorId IN (:...sensorIds)' : '1=1', {
        sensorIds,
      })
      .andWhere(filters.sensorId ? 'a.sensorId = :sensorId' : '1=1', {
        sensorId: filters.sensorId,
      })
      .andWhere(dateFrom ? 'a.fechaAlerta >= :from' : '1=1', { from: dateFrom })
      .andWhere(dateTo ? 'a.fechaAlerta <= :to' : '1=1', { to: dateTo })
      .orderBy('a.fechaAlerta', 'DESC')
      .getMany();
    // Limitar a máximo 5 alertas por sensor
    const alerts: SensorAlerta[] = [];
    const countBySensor: Record<number, number> = {};
    for (const a of alertsRaw) {
      const key = a.sensorId;
      if ((countBySensor[key] || 0) >= 5) continue;
      alerts.push(a);
      countBySensor[key] = (countBySensor[key] || 0) + 1;
    }

    const sensorDetails = await Promise.all(
      sensores.map(async (sensor) => {
        const lecturas = await this.lecturaRepo
          .createQueryBuilder('lectura')
          .where('lectura.sensorId = :id', { id: sensor.id })
          .andWhere(filters.from ? 'lectura.fechaLectura >= :from' : '1=1', { from: filters.from })
          .andWhere(filters.to ? 'lectura.fechaLectura <= :to' : '1=1', { to: filters.to })
          .orderBy('lectura.fechaLectura', 'ASC')
          .getMany();
        const values = lecturas
          .map((l) => Number(l.valor))
          .filter((v) => Number.isFinite(v));
        const ultimo = Number(sensor.ultimoValor);
        if (values.length === 0 && Number.isFinite(ultimo)) {
          values.push(ultimo);
        }
        const max = values.length ? Math.max(...values) : null;
        const min = values.length ? Math.min(...values) : null;
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
        return { sensor, values, max, min, avg, lastDate: lecturas.at(-1)?.fechaLectura };
      }),
    );

    const allValues = sensorDetails.flatMap((s) => s.values);
    const globalMax = allValues.length ? Math.max(...allValues) : 0;
    const globalMin = allValues.length ? Math.min(...allValues) : 0;
    const globalAvg = allValues.length
      ? allValues.reduce((a, b) => a + b, 0) / allValues.length
      : 0;
    const tipoCount = sensorDetails.reduce<Record<string, number>>((acc, s) => {
      const t = s.sensor.tipoSensor?.nombre || 'N/A';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const tipoPrincipal = Object.entries(tipoCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

    const sectionTitle = (title: string) => {
      doc.fillColor(secondary).fontSize(12).text(title.toUpperCase(), left, doc.y + 4);
      doc.moveDown(0.6);
    };

    const spacer = (h = 12) => {
      doc.y += h;
    };

    const kpiSensorCards = () => {
      const cardW = (pageWidth - 12) / 2;
      const cardH = 90;
      let toggle = false;
      sensorDetails.forEach((s) => {
        if (doc.y > doc.page.height - 140) {
          doc.addPage();
          toggle = false;
        }
        const x = toggle ? left + cardW + 12 : left;
        const y = doc.y;
        toggle = !toggle;
        const promVal =
          s.avg !== null && s.avg !== undefined
            ? Number(s.avg).toFixed(2)
            : s.values.length
              ? Number(s.values.at(-1)).toFixed(2)
              : '--';
        const minVal = s.min !== null && s.min !== undefined ? s.min.toFixed(2) : '--';
        const maxVal = s.max !== null && s.max !== undefined ? s.max.toFixed(2) : '--';
        const lastVal = Number.isFinite(Number(s.sensor.ultimoValor)) ? Number(s.sensor.ultimoValor).toFixed(2) : '--';
        const alertaCount = alerts.filter((a) => a.sensorId === s.sensor.id).length;

        doc.roundedRect(x, y, cardW, cardH, 8).strokeColor(mutedBorder).lineWidth(1).stroke();
        doc.fillColor(secondary).fontSize(11).text(s.sensor.nombre, x + 10, y + 8, { width: cardW - 20 });
        doc.fillColor(slate).fontSize(9).text(s.sensor.tipoSensor?.nombre || '', x + 10, y + 22);
        doc.fillColor(secondary).fontSize(12).text(`Prom: ${promVal}`, x + 10, y + 38);
        doc.fillColor(slate).fontSize(9).text(`Min/Max: ${minVal} / ${maxVal}`, x + 10, y + 54);
        doc.text(`Ultima: ${lastVal}`, x + 10, y + 66);
        doc.text(`Alertas: ${alertaCount}`, x + 120, y + 66);

        if (!toggle) {
          doc.y = y + cardH + 10;
        }
      });
      if (toggle) {
        doc.y += cardH + 10;
      }
    };

    const drawTable = () => {
      const columns = [
        { label: 'ID', width: 40 },
        { label: 'Nombre', width: 170 },
        { label: 'Prom', width: 60 },
        { label: 'Min/Max', width: 100 },
        { label: 'Ultima', width: 60 },
        { label: 'Estado', width: 80 },
        { label: 'UmbralMin', width: 70 },
        { label: 'UmbralMax', width: 70 },
      ];
      const startX = left;
      const fullW = pageWidth;
      const rowH = 22;
      const drawRow = (values: string[], isHeader = false, shaded = false) => {
        const y = doc.y;
        if (shaded) {
          doc.rect(startX, y, fullW, rowH).fill(light);
        }
        doc.fillColor(isHeader ? secondary : slate).fontSize(isHeader ? 10 : 9);
        values.forEach((val, idx) => {
          const x = startX + columns.slice(0, idx).reduce((acc, c) => acc + c.width, 0) + 6;
          doc.text(val, x, y + 6, { width: columns[idx].width - 12, ellipsis: true });
        });
        doc.y = y + rowH;
      };
      drawRow(columns.map((c) => c.label), true, true);
      sensorDetails.forEach((s, idx) => {
        const lastVal = Number.isFinite(Number(s.sensor.ultimoValor)) ? Number(s.sensor.ultimoValor).toFixed(2) : '--';
        const promVal =
          s.avg !== null && s.avg !== undefined
            ? Number(s.avg).toFixed(2)
            : s.values.length
              ? Number(s.values.at(-1)).toFixed(2)
              : '--';
        const minMax = `${s.min !== null && s.min !== undefined ? s.min.toFixed(2) : '--'} / ${s.max !== null && s.max !== undefined ? s.max.toFixed(2) : '--'}`;
        drawRow(
          [
            `#${s.sensor.id}`,
            s.sensor.nombre,
            promVal,
            minMax,
            lastVal,
            s.sensor.estadoConexion ?? '--',
            s.sensor.umbralMin !== null && s.sensor.umbralMin !== undefined ? String(s.sensor.umbralMin) : '--',
            s.sensor.umbralMax !== null && s.sensor.umbralMax !== undefined ? String(s.sensor.umbralMax) : '--',
          ],
          false,
          idx % 2 === 0,
        );
      });
    };

    // Header
    const headerH = 80;
    const headerTop = doc.y;
    doc.rect(left, headerTop, pageWidth, headerH).fill(headerBg).strokeColor(mutedBorder).lineWidth(1).stroke();
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, left + 12, headerTop + 12, { fit: [90, 32] });
      } catch (_) {
        // ignore image errors to avoid breaking report
      }
    }
    const textX = left + 120;
    doc.fillColor(headerText).fontSize(18).text(`REPORTE DE LOTE: ${filters.loteId ?? 'Todos'}`, textX, headerTop + 16);
    doc.fontSize(10).text(`Periodo: ${formatDate(filters.from)} - ${formatDate(filters.to)}`, textX, headerTop + 36);
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-ES')}`, textX, headerTop + 52);
    doc.y = headerTop + headerH + 12;

    // Resumen
    sectionTitle('Resumen de sensores registrados');
    doc.roundedRect(left, doc.y, pageWidth, 52, 6).fill(light);
    doc.fillColor(secondary).fontSize(10).text(`Sensores activos: ${sensorDetails.length} de ${sensorDetails.length}`, left + 12, doc.y + 10);
    doc.fillColor(slate).fontSize(9).text(`Tipo principal: ${tipoPrincipal}`, left + 12, doc.y + 26);
    doc.fillColor(slate).fontSize(9).text(`Alertas en rango: ${alerts.length}`, left + 240, doc.y + 26);
    doc.y += 70;
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(divider).lineWidth(1).stroke();
    spacer(6);

    // Configuración global
    const configIds = Array.from(new Set(sensores.map((s) => s.globalConfigId).filter(Boolean)));
    const configs =
      configIds.length > 0
        ? await this.globalConfigRepo.find({ where: { id: In(configIds) } })
        : await this.globalConfigRepo.find({ where: { activo: true } });
    sectionTitle('Configuración de conexión (MQTT)');
    if (configs.length === 0) {
      doc.fillColor(slate).fontSize(9).text('Sin configuraciones encontradas.', left, doc.y + 6);
      doc.moveDown(1.5);
    } else {
      const columnsCfg = [
        { label: 'Nombre', width: 120 },
        { label: 'Broker', width: 120 },
        { label: 'Puerto', width: 50 },
        { label: 'Protocolo', width: 60 },
        { label: 'Prefix', width: 80 },
        { label: 'Topics', width: 120 },
        { label: 'Usuario', width: 80 },
      ];
      const startX = left;
      const rowH = 20;
      const drawRowCfg = (values: string[], isHeader = false, shaded = false) => {
        const y = doc.y;
        if (shaded) {
          doc.rect(startX, y, pageWidth, rowH).fill(light);
        }
        doc.fillColor(isHeader ? secondary : slate).fontSize(isHeader ? 10 : 9);
        values.forEach((val, idx) => {
          const x = startX + columnsCfg.slice(0, idx).reduce((acc, c) => acc + c.width, 0) + 6;
          doc.text(val, x, y + 5, { width: columnsCfg[idx].width - 12, ellipsis: true });
        });
        doc.y = y + rowH;
      };
      drawRowCfg(columnsCfg.map((c) => c.label), true, true);
      configs.forEach((cfg, idx) => {
        drawRowCfg(
          [
            cfg.name,
            cfg.broker,
            String(cfg.port),
            cfg.protocol,
            cfg.topicPrefix,
            `${(cfg.defaultTopics || []).join(', ')} ${(cfg.customTopics || []).join(', ')}`.trim() || '--',
            cfg.username || '--',
          ],
          false,
          idx % 2 === 0,
        );
      });
      spacer(8);
    }

    // KPIs por sensor
    sectionTitle('Estadisticas por sensor');
    kpiSensorCards();
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).strokeColor(divider).lineWidth(1).stroke();
    spacer(8);

    // Tabla detalle
    sectionTitle('Detalle por sensor');
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
      sectionTitle('Detalle por sensor');
    }
    if (sensorDetails.length === 0) {
      doc.fillColor(slate).fontSize(9).text('Sin sensores para los filtros seleccionados.', left, doc.y + 6);
      doc.moveDown(2);
    } else {
      drawTable();
      spacer(6);
    }

    // Alertas
    doc.addPage();
    sectionTitle('Alertas en rango');
    if (alerts.length > 0) {
      const columnsAlert = [
        { label: 'Sensor', width: 170 },
        { label: 'Tipo', width: 50 },
        { label: 'Valor', width: 60 },
        { label: 'Umbral', width: 60 },
        { label: 'Fecha', width: 140 },
      ];
      const startX = left;
      const rowH = 20;
      const drawRowAlert = (values: string[], isHeader = false, shaded = false) => {
        const y = doc.y;
        if (shaded) doc.rect(startX, y, pageWidth, rowH).fill(light);
        doc.fillColor(isHeader ? secondary : slate).fontSize(isHeader ? 10 : 9);
        values.forEach((val, idx) => {
          const x = startX + columnsAlert.slice(0, idx).reduce((acc, c) => acc + c.width, 0) + 6;
          doc.text(val, x, y + 5, { width: columnsAlert[idx].width - 12, ellipsis: true });
        });
        doc.y = y + rowH;
      };
      drawRowAlert(columnsAlert.map((c) => c.label), true, true);
      alerts.slice(0, 120).forEach((a, idx) => {
        if (doc.y > doc.page.height - 60) {
          doc.addPage();
          sectionTitle('Alertas en rango');
          drawRowAlert(columnsAlert.map((c) => c.label), true, true);
        }
        const fecha = a.fechaAlerta ? new Date(a.fechaAlerta).toLocaleString('es-ES') : '--';
        drawRowAlert(
          [
            a.sensor?.nombre || `Sensor ${a.sensorId}`,
            a.tipo,
            a.valor !== null && a.valor !== undefined ? a.valor.toFixed(2) : '--',
            a.umbral !== null && a.umbral !== undefined ? a.umbral.toFixed(2) : '--',
            fecha,
          ],
          false,
          idx % 2 === 0,
        );
      });
    } else {
      doc.fillColor(slate).fontSize(9).text('No se encontraron alertas en el rango seleccionado.', left, doc.y + 4);
    }

    doc.end();
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}


