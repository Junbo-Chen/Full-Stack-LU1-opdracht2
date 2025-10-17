import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    console.log('🔧 AuthService initialized');
    console.log('🔑 JWT Secret exists:', !!this.configService.get('JWT_SECRET'));
  }

  async register(registerDto: RegisterDto) {
    try {
      console.log('📝 Starting registration for:', registerDto.email);
      console.log('📦 Received data:', {
        name: registerDto.name,
        email: registerDto.email,
        hasPassword: !!registerDto.password,
        passwordLength: registerDto.password?.length
      });

      // Valideer dat alle velden aanwezig zijn
      if (!registerDto.name || !registerDto.email || !registerDto.password) {
        throw new BadRequestException('Name, email and password are required');
      }

      if (registerDto.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      
      // Check if user exists
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        console.log('⚠️ Email already exists:', registerDto.email);
        throw new ConflictException('Email already exists');
      }

      console.log('🔐 Hashing password...');
      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      console.log('✅ Password hashed successfully');

      console.log('💾 Creating user...');
      // Create user
      const user = await this.usersService.create({
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      });

      console.log('🎫 Generating token...');
      // Generate token
      const token = this.generateToken(user);

      console.log('✅ Registration complete for:', user.email);
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      console.error('Stack:', error.stack);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed: ' + error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      console.log('🔍 Finding user:', loginDto.email);
      console.log('📦 Login data:', {
        email: loginDto.email,
        hasPassword: !!loginDto.password
      });

      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }
      
      // Find user
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        console.log('⚠️ User not found:', loginDto.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('🔐 Verifying password...');
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        console.log('⚠️ Invalid password for:', loginDto.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('🎫 Generating token...');
      // Generate token
      const token = this.generateToken(user);

      console.log('✅ Login complete for:', user.email);
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed: ' + error.message);
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateToken(user: any): string {
    try {
      const payload = { 
        sub: user._id, 
        email: user.email,
        name: user.name 
      };
      
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      console.log('🎫 Signing JWT with secret');
      return this.jwtService.sign(payload, { secret });
    } catch (error) {
      console.error('❌ Token generation error:', error);
      throw new InternalServerErrorException('Token generation failed: ' + error.message);
    }
  }
}