import { Controller, Post, Body, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RegisterDto } from '../dtos/register.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { RequestResetDto, ResetPasswordDto } from '../dtos/reset-password.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) { }

  // RF01: Registro - Paso 1 (Iniciar)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.startRegistration(registerDto);
  }

  // RF01: Registro - Paso 2 (Completar con código)
  @Post('complete-register')
  async completeRegister(@Body() body: { correo: string; code: string }) {
    return this.authService.completeRegistration(body.correo, body.code);
  }

  // RF02: Verificar email
  @Post('verify-email')
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  // RF02: Reenviar código
  @Post('resend-verification')
  async resendVerification(@Body('correo') correo: string) {
    return this.authService.resendVerificationCode(correo);
  }

  // RF03: Login
  // @UseGuards(LocalAuthGuard) <-- Removed to handle error manually
  @Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
  const user = await this.authService.validateUser(body.correo, body.password);

  if (!user) {
    return { success: false, message: 'Correo o contraseña incorrectos' };
  }

  // result.access_token y result.user vienen del AuthService
  const result = await this.authService.login(user);

  // ---- COOKIE PARA NAVEGADOR WEB ----
  res.cookie('auth_token', result.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // ---- RESPUESTA PARA APP MOVIL ----
  return {
    success: true,
    user: result.user,
    token: result.access_token,   // <<--- CLAVE
  };
}

  // RF04: Logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['auth_token'];
    if (token) {
      try {
        const payload = this.jwtService.verify(token) as any;
        const sessionId = payload.jti;
        const ttl = Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000));
        await this.authService.logout(sessionId, token, ttl);
      } catch (error) {
        // Token inválido, no proceder con logout de sesión
      }
    }
    res.cookie('auth_token', '', {
      httpOnly: true,
      maxAge: 0,
    });
    return { message: 'Logout exitoso' };
  }

  // RF05: Solicitar reset
  @Post('request-reset')
  async requestReset(@Body() requestDto: RequestResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  // RF05: Resetear password
  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  // RF05: Verificar código de recuperación
  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { correo: string; code: string }) {
    return this.authService.verifyResetCode(body.correo, body.code);
  }
}
