import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  jobs: {
    sensorDisconnectTtlMinutes: parseInt(process.env.SENSOR_DISCONNECT_TTL_MINUTES || '10', 10),
    sensorReadingsRetentionYears: parseInt(process.env.SENSOR_READINGS_RETENTION_YEARS || '1', 10),
    inventoryMovementsRetentionYears: parseInt(process.env.INVENTORY_MOVEMENTS_RETENTION_YEARS || '2', 10),
  },
}));
