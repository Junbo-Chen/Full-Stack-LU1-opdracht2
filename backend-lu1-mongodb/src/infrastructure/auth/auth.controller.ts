import { Controller, Post, Body, Get, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../service/auth.service';
import { RegisterDto } from '../../presentation/dto/register.dto'; 
import { LoginDto } from '../../presentation/dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      console.log('🔵 Register endpoint hit');
      
      console.log('📦 Body received:', {
        name: registerDto.name,
        email: registerDto.email,
        hasPassword: !!registerDto.password,
        passwordLength: registerDto.password?.length,
        rawBody: JSON.stringify(registerDto)
      });
      
      const result = await this.authService.register(registerDto);
      console.log('✅ Register success:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Register controller error:', error.message);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('🔵 Login endpoint hit');
      console.log('📦 Body received:', {
        email: loginDto.email,
        hasPassword: !!loginDto.password
      });
      
      const result = await this.authService.login(loginDto);
      console.log('✅ Login success:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Login controller error:', error.message);
      throw error;
    }
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
    return { message: 'Logged out successfully' };
  }
}