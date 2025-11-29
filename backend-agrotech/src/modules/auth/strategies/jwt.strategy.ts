import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookieToken = request?.cookies?.auth_token || request?.cookies?.Authentication;
          if (cookieToken) {
             return cookieToken;
          }

          const authHeader = request?.headers?.authorization;
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.slice(7);
          }
          
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('config.jwt.secret')!,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      userId: payload.sub,
      correo: payload.correo,
      rolId: payload.rolId,
      jti: payload.jti,
    };
  }
}
