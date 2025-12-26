import { Controller, Post, Get, Put, Body, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Get('agent/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getAgentProfile(req.user.id);
  }

  @Put('agent/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() body) {
    return this.authService.updateAgentProfile(req.user.id, body);
  }
  
  @Post('visitor/init')
  async visitorInit(@Body() body) {
      if (!body.v_uuid) throw new UnauthorizedException('UUID required');
      return this.authService.visitorInit(body.v_uuid);
  }

  @Post('agent/forgot-password')
  async forgotPassword(@Body() body) {
      return this.authService.forgotPassword(body.email);
  }

  @Post('agent/reset-password')
  async resetPassword(@Body() body) {
      return this.authService.resetPassword(body.token, body.newPassword);
  }
}
