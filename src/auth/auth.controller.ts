import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ 
    summary: 'Iniciar autenticación con Google',
    description: 'Redirecciona al usuario a Google OAuth para autenticación'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirección a Google OAuth' 
  })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback de Google OAuth',
    description: 'Endpoint de callback que recibe la respuesta de Google y genera JWT'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirección al frontend con token JWT' 
  })
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user as any);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    
    console.log(`User authenticated with Google`);

    // Redirect to frontend with token
    res.redirect(
      `${frontendUrl}/auth/google/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(req.user))}&lala=hola`,
    );
  }

  @Get('test')
  @ApiOperation({
    summary: 'Test de conectividad',
    description: 'Endpoint de prueba para verificar que la API funciona'
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Auth endpoint is working!'
        }
      }
    }
  })
  test() {
    return { message: 'Auth endpoint is working!' };
  }
}
