
import { DataSource } from 'typeorm';
import { Cultivo } from '../../modules/cultivos/entities/cultivo.entity';
import { LoteProduccion } from '../../modules/production/entities/lote-produccion.entity';
import { ProductoAgro } from '../../modules/production/entities/producto-agro.entity';
import { Sensor } from '../../modules/iot/entities/sensor.entity';
import { SensorLectura } from '../../modules/iot/entities/sensor-lectura.entity';
import { TipoSensor } from '../../modules/iot/entities/tipo-sensor.entity';
import { Usuario } from '../../modules/users/entities/usuario.entity';

export const seedReportData = async (dataSource: DataSource) => {
    console.log('Seeding dummy report data (Harvests + IoT Readings)...');

    const cultivoRepo = dataSource.getRepository(Cultivo);
    const loteProduccionRepo = dataSource.getRepository(LoteProduccion);
    const productoRepo = dataSource.getRepository(ProductoAgro);
    const sensorRepo = dataSource.getRepository(Sensor);
    const lecturaRepo = dataSource.getRepository(SensorLectura);
    const tipoSensorRepo = dataSource.getRepository(TipoSensor);
    const usuarioRepo = dataSource.getRepository(Usuario);

    // 0. Findings Admin - FIXED field name 'correo'
    const admin = await usuarioRepo.findOne({ where: { correo: 'agrotechsena2025@gmail.com' } });
    const adminId = admin ? admin.id : 1;

    // 1. Find an active crop
    const cultivo = await cultivoRepo.findOne({
        where: { estado: 'activo' },
        relations: ['lote']
    });

    if (!cultivo) {
        console.log('No active crop found. Skipping report data seeding.');
        return;
    }

    console.log(`Found crop: ${cultivo.nombreCultivo} (ID: ${cultivo.id}) in Lote: ${cultivo.loteId}`);

    // 3. Ensure ProductoAgro exists
    let producto = await productoRepo.findOne({ where: { nombre: 'Platano Verde' } });
    if (!producto) {
        // Direct save with cast to avoid create() overload ambiguity
        producto = await productoRepo.save({
            nombre: 'Platano Verde',
            descripcion: 'Platano variedad Dominico Harton',
            unidadBase: 'kg'
        } as any);
    }

    if (!producto) return;

    // 4. Create Dummy Harvest (LoteProduccion)
    const existingHarvest = await loteProduccionRepo.findOne({ where: { cultivoId: cultivo.id } });
    if (!existingHarvest) {
        await loteProduccionRepo.save({
            cultivoId: cultivo.id,
            productoAgroId: producto.id,
            codigoLote: `LOT-PROD-${Date.now()}`,
            cantidadKg: 1500,
            stockDisponibleKg: 1500,
            calidad: 'Primera',
            costoTotal: 5000000,
            costoUnitarioKg: 5000000 / 1500,
            precioSugeridoKg: 4500,
        } as any);
        console.log('Created dummy harvest.');
    } else {
        console.log('Harvest already exists.');
    }

    // 5. Ensure Sensor Type Exists
    let tipoTemp = await tipoSensorRepo.findOne({ where: { nombre: 'TEMPERATURE' } });
    if (!tipoTemp) {
        tipoTemp = await tipoSensorRepo.findOne({ where: { nombre: 'TEMPERATURA_AIRE' } });
    }
    if (!tipoTemp) {
        tipoTemp = await tipoSensorRepo.save({
            nombre: 'TEMPERATURE',
            unidad: '°C',
            descripcion: 'Temperatura'
        } as any);
    }

    // 6. Create/Find Sensor for this Lote
    // Fix: explicitly type as any to avoid 'Sensor | null' mismatch if inferred wrong
    let sensor: any = await sensorRepo.findOne({ where: { loteId: cultivo.loteId } });

    if (!sensor && tipoTemp) {
        sensor = await sensorRepo.save({
            nombre: 'Sensor Temp Demo',
            tipoSensorId: tipoTemp.id,
            loteId: cultivo.loteId,
            protocolo: 'MQTT',
            mqttTopic: 'demo/temp',
            activo: true,
            estadoConexion: 'CONECTADO',
            creadoPorUsuarioId: adminId,
        } as any);
        console.log('Created dummy sensor.');
    }

    if (sensor) {
        // 7. Generate Readings
        const recent = await lecturaRepo.findOne({
            where: { sensorId: sensor.id },
            order: { fechaLectura: 'DESC' }
        });

        const now = new Date();
        if (!recent || (now.getTime() - recent.fechaLectura.getTime() > 1000 * 60 * 60)) {
            console.log(`Generating readings for sensor ${sensor.id}...`);
            const readings: any[] = [];
            for (let i = 0; i < 24; i++) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                const val = 25 + 5 * Math.sin(i / 4) + (Math.random() - 0.5);
                readings.push({
                    sensorId: sensor.id,
                    valor: val.toFixed(2),
                    fechaLectura: time
                });
            }
            // Save directly
            await lecturaRepo.save(readings);
            console.log(`Inserted ${readings.length} dummy readings.`);
        } else {
            console.log('Recent readings exist, skipping insertion.');
        }
    }
};
