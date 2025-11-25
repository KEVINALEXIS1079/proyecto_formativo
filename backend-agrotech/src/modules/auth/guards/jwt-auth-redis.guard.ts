import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class JwtAuthGuardWithRedis extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero validar el JWT con Passport
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    // Verificar que el token NO esté en blacklist
    const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Decodificar el token para obtener el sessionId (jti)
    const decoded = this.jwtService.decode(token) as any;
    if (!decoded || !decoded.jti) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar que la sesión exista en Redis
    const userId = await this.redisService.getSession(decoded.jti);
    if (!userId || userId !== decoded.sub) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // Cargar permisos desde Redis y adjuntarlos al request
    let permissions = await this.redisService.getUserPermissions(userId);
    
    // Si no están en caché, se cargarán bajo demanda por el PermissionsGuard
    request.user.permissions = permissions || [];

    return true;
  }

  private extractTokenFromRequest(request: any): string | null {
    // Intentar obtener de cookie
    if (request.cookies && request.cookies.auth_token) {
      return request.cookies.auth_token;
    }

    // Intentar obtener de header Authorization
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
