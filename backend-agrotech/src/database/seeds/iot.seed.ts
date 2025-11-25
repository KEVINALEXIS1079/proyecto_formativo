import { DataSource } from 'typeorm';
import { TipoSensor } from '../../modules/iot/entities/tipo-sensor.entity';
import { Sensor } from '../../modules/iot/entities/sensor.entity';
import { Cultivo } from '../../modules/cultivos/entities/cultivo.entity';
import { Usuario } from '../../modules/users/entities/usuario.entity';

export async function seedIot(dataSource: DataSource) {
  console.log('Ejecutando seed de IoT...');

  const tipoSensorRepo = dataSource.getRepository(TipoSensor);
  const sensorRepo = dataSource.getRepository(Sensor);
  const cultivoRepo = dataSource.getRepository(Cultivo);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // Obtener IDs de cultivos y usuarios existentes
  const cultivos = await cultivoRepo.find({ order: { id: 'ASC' } });
  const usuarios = await usuarioRepo.find({ order: { id: 'ASC' } });

  if (usuarios.length === 0) {
    console.log('  No se encontraron usuarios. Omitiendo seed de IoT.');
    return [];
  }

  // Tipos de sensores
  const tiposSensoresData = [
    {
      nombre: 'Humedad del suelo',
      unidad: '%',
      decimales: 1,
      descripcion: 'Sensor para medir la humedad del suelo',
      ttlMinutos: 10,
    },
    {
      nombre: 'Temperatura ambiente',
      unidad: '°C',
      decimales: 1,
      descripcion: 'Sensor de temperatura para monitoreo ambiental',
      ttlMinutos: 5,
    },
    {
      nombre: 'pH del suelo',
      unidad: 'pH',
      decimales: 2,
      descripcion: 'Sensor para medir el pH del suelo',
      ttlMinutos: 60,
    },
    {
      nombre: 'Luz ambiental',
      unidad: 'lux',
      decimales: 0,
      descripcion: 'Sensor de intensidad luminosa',
      ttlMinutos: 15,
    },
  ];

  let tiposCreados = 0;
  const tipoSensorIds: number[] = [];
  for (const tipoData of tiposSensoresData) {
    const existing = await tipoSensorRepo.findOne({ where: { nombre: tipoData.nombre } });
    if (!existing) {
      const tipo = tipoSensorRepo.create(tipoData);
      const saved = await tipoSensorRepo.save(tipo);
      tipoSensorIds.push(saved.id);
      tiposCreados++;
    } else {
      tipoSensorIds.push(existing.id);
    }
  }

  if (tiposCreados > 0) {
    console.log(`  ${tiposCreados} tipos de sensores creados`);
  } else {
    console.log('  ℹTipos de sensores ya existen, omitiendo...');
  }

  // Sensores de ejemplo
  const sensoresData = [
    {
      nombre: 'Sensor Humedad Suelo 1',
      tipoSensorId: tipoSensorIds[0],
      protocolo: 'MQTT',
      mqttBroker: 'mqtt.agrotech.local',
      mqttPort: 1883,
      mqttTopic: 'sensors/soil/humidity/001',
      mqttUsername: 'sensor1',
      mqttPassword: 'password123',
      mqttQos: 1,
      umbralMin: 20,
      umbralMax: 80,
      activo: true,
      cultivoId: cultivos[0]?.id,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Sensor Temperatura Ambiente 1',
      tipoSensorId: tipoSensorIds[1],
      protocolo: 'MQTT',
      mqttBroker: 'mqtt.agrotech.local',
      mqttPort: 1883,
      mqttTopic: 'sensors/air/temperature/001',
      mqttUsername: 'sensor2',
      mqttPassword: 'password123',
      mqttQos: 1,
      umbralMin: 15,
      umbralMax: 35,
      activo: true,
      cultivoId: cultivos[0]?.id,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Sensor pH Suelo 1',
      tipoSensorId: tipoSensorIds[2],
      protocolo: 'HTTP',
      endpointUrl: 'http://api.sensors.local/ph/001',
      umbralMin: 5.5,
      umbralMax: 7.5,
      activo: true,
      cultivoId: cultivos[0]?.id,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Sensor Luz Ambiental 1',
      tipoSensorId: tipoSensorIds[3],
      protocolo: 'MQTT',
      mqttBroker: 'mqtt.agrotech.local',
      mqttPort: 1883,
      mqttTopic: 'sensors/light/001',
      mqttUsername: 'sensor4',
      mqttPassword: 'password123',
      mqttQos: 1,
      umbralMin: 1000,
      umbralMax: 50000,
      activo: true,
      cultivoId: cultivos[1]?.id || cultivos[0]?.id,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Sensor Humedad Suelo 2',
      tipoSensorId: tipoSensorIds[0],
      protocolo: 'MQTT',
      mqttBroker: 'mqtt.agrotech.local',
      mqttPort: 1883,
      mqttTopic: 'sensors/soil/humidity/002',
      mqttUsername: 'sensor5',
      mqttPassword: 'password123',
      mqttQos: 1,
      umbralMin: 25,
      umbralMax: 75,
      activo: true,
      cultivoId: cultivos[1]?.id,
      creadoPorUsuarioId: usuarios[0].id,
    },
  ];

  let sensoresCreados = 0;
  const sensorIds: number[] = [];
  for (const sensorData of sensoresData) {
    const existing = await sensorRepo.findOne({ where: { nombre: sensorData.nombre } });
    if (!existing) {
      const sensor = sensorRepo.create(sensorData);
      const saved = await sensorRepo.save(sensor);
      sensorIds.push(saved.id);
      sensoresCreados++;
    } else {
      sensorIds.push(existing.id);
    }
  }

  if (sensoresCreados > 0) {
    console.log(`  ${sensoresCreados} sensores creados`);
  } else {
    console.log('  ℹSensores ya existen, omitiendo...');
  }

  console.log('Seed de IoT completado\n');
  return { tipoSensorIds, sensorIds };
}