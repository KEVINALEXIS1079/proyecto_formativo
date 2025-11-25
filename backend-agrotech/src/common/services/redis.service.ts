import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: 0,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  // ==================== SESIONES ====================

  /**
   * Crear sesión de usuario
   * @param sessionId - ID único de sesión (puede ser el jti del JWT)
   * @param userId - ID del usuario
   * @param ttl - Tiempo de vida en segundos (default: 7 días)
   */
  async createSession(sessionId: string, userId: number, ttl: number = 604800): Promise<void> {
    const key = `session:${sessionId}`;
    await this.client.setex(key, ttl, userId.toString());
  }

  /**
   * Verificar si una sesión existe y es válida
   */
  async getSession(sessionId: string): Promise<number | null> {
    const key = `session:${sessionId}`;
    const userId = await this.client.get(key);
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Eliminar sesión (logout)
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  /**
   * Eliminar todas las sesiones de un usuario
   */
  async deleteAllUserSessions(userId: number): Promise<void> {
    const pattern = `session:*`;
    const keys = await this.client.keys(pattern);
    
    for (const key of keys) {
      const storedUserId = await this.client.get(key);
      if (storedUserId && parseInt(storedUserId, 10) === userId) {
        await this.client.del(key);
      }
    }
  }

  // ==================== BLACKLIST DE TOKENS ====================

  /**
   * Agregar token a blacklist (al hacer logout)
   * @param token - Token JWT completo
   * @param ttl - Tiempo de vida restante del token en segundos
   */
  async blacklistToken(token: string, ttl: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.client.setex(key, ttl, '1');
  }

  /**
   * Verificar si un token está en blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const result = await this.client.get(key);
    return result !== null;
  }

  // ==================== PERMISOS ====================

  /**
   * Almacenar permisos efectivos de un usuario
   * @param userId - ID del usuario
   * @param permissions - Array de claves de permisos ['usuarios.ver', 'lotes.crear', ...]
   * @param ttl - Tiempo de vida en segundos (default: 1 hora)
   */
  async setUserPermissions(userId: number, permissions: string[], ttl: number = 3600): Promise<void> {
    const key = `permissions:user:${userId}`;
    await this.client.setex(key, ttl, JSON.stringify(permissions));
  }

  /**
   * Obtener permisos efectivos de un usuario desde caché
   */
  async getUserPermissions(userId: number): Promise<string[] | null> {
    const key = `permissions:user:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Invalidar caché de permisos de un usuario
   * (llamar al cambiar rol o permisos)
   */
  async invalidateUserPermissions(userId: number): Promise<void> {
    const key = `permissions:user:${userId}`;
    await this.client.del(key);
  }

  /**
   * Invalidar caché de permisos de todos los usuarios con un rol
   */
  async invalidateRolePermissions(rolId: number): Promise<void> {
    // Nota: Necesitarías mantener un set de usuarios por rol
    // Por simplicidad, puedes invalidar todos los permisos
    const pattern = `permissions:user:*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtener cliente Redis para operaciones personalizadas
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Cerrar conexión (al destruir el módulo)
   */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
