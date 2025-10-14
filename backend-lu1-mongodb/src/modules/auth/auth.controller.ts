import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // Met JWT tokens gebeurt logout client-side door token te verwijderen
    return { message: 'Logged out successfully' };
  }
}