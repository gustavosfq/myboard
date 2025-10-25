import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description: 'Devuelve la información del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        email: { type: 'string', example: 'usuario@gmail.com' },
        name: { type: 'string', example: 'Juan Pérez' },
        picture: { type: 'string', example: 'https://lh3.googleusercontent.com/...' },
        googleId: { type: 'string', example: '123456789012345678901' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar todos los usuarios activos',
    description: 'Devuelve una lista de todos los usuarios activos en la plataforma'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios activos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          picture: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
