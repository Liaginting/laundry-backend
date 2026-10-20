import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================
  // LOGIN MANAGER
  // =========================
  @Post('login')
  login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  // =========================
  // LOGIN KASIR
  // =========================
  @Post('login-kasir')
  loginCashier(
    @Body()
    body: {
      kodeKasir: string;
      password: string;
    },
  ) {
    return this.authService.loginCashier(
      body.kodeKasir,
      body.password,
    );
  }

  // =========================
  // REGISTER LAUNDRY + MANAGER
  // =========================
  @Post('register')
  register(
    @Body()
    body: {
      namaLaundry: string;
      alamat?: string;
      noTelepon?: string;
      namaAdmin: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(body);
  }
}