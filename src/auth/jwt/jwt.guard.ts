import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Ambil token dari Authorization: Bearer <token>
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Format token tidak valid');
    }

    try {
      // Verifikasi token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'RAHASIA_JWT_LAUNDRY',
      });

      // Simpan data user ke request
      (request as any).user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah expired',
      );
    }
  }
}