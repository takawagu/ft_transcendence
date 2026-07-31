import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  CheckUsernameDto,
  CheckEmailDto,
} from './dto/check-availability.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('check-username')
  async checkUsername(@Query() query: CheckUsernameDto) {
    const taken = await this.authService.isUsernameTaken(query.username);
    return { taken };
  }

  @Get('check-email')
  async checkEmail(@Query() query: CheckEmailDto) {
    const taken = await this.authService.isEmailTaken(query.email);
    return { taken };
  }
}
