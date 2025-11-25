import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // El backend y el frontend usan "correo" como campo de usuario.
    super({ usernameField: 'correo' });
  }

  async validate(correo: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(correo, pass);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
