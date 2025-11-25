import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      // Extract token from cookie or handshake auth
      let token = client.handshake.auth?.token;
      
      if (!token && client.handshake.headers.cookie) {
         const cookies = client.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
         }, {} as Record<string, string>);
         token = cookies['auth_token'] || cookies['Authentication'];
      }

      if (token?.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('config.jwt.secret'),
      });

      const normalizedUser = {
        id: payload.sub,
        userId: payload.sub,
        correo: payload.correo,
        rolId: payload.rolId,
        jti: payload.jti,
      };

      const data = context.switchToWs().getData();
      if (data && typeof data === 'object') {
        (data as any).user = normalizedUser;
      }
      // Also attach to client for future use
      (client as any).user = normalizedUser;

      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
