import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('agent/login')
  async login(@Body() body) {
    const user = await this.authService.validateAgent(body.email, body.password);
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.loginAgent(user);
  }

  @Post('agent/register')
  async register(@Body() body) {
    return this.authService.registerAgent(body);
  }
  
  @Post('visitor/init')
  async visitorInit(@Body() body) {
      if (!body.v_uuid) throw new UnauthorizedException('UUID required');
      return this.authService.visitorInit(body.v_uuid);
  }
}
