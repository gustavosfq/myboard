import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto, ShareBoardDto } from './dto/board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('boards')
@ApiBearerAuth('JWT-auth')
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo tablero',
    description: 'Crea un nuevo tablero colaborativo'
  })
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({
    status: 201,
    description: 'Tablero creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        name: { type: 'string', example: 'Mi Tablero' },
        description: { type: 'string', example: 'Descripción del tablero' },
        owner: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        sharedWith: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    return this.boardsService.create(createBoardDto, req.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tableros del usuario',
    description: 'Obtiene todos los tableros que pertenecen al usuario o han sido compartidos con él'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tableros',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          owner: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              picture: { type: 'string' }
            }
          },
          sharedWith: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async findAll(@Request() req) {
    return this.boardsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un tablero específico',
    description: 'Obtiene los detalles de un tablero por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tablero',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiResponse({ status: 200, description: 'Detalles del tablero' })
  @ApiResponse({ status: 404, description: 'Tablero no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al tablero' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un tablero',
    description: 'Actualiza la información de un tablero (solo el propietario)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tablero',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ status: 200, description: 'Tablero actualizado' })
  @ApiResponse({ status: 403, description: 'Solo el propietario puede actualizar' })
  @ApiResponse({ status: 404, description: 'Tablero no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: CreateBoardDto,
    @Request() req,
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.userId);
  }

  @Post(':id/share')
  @ApiOperation({
    summary: 'Compartir tablero con usuarios',
    description: 'Comparte un tablero con otros usuarios (solo el propietario)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tablero',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiBody({ type: ShareBoardDto })
  @ApiResponse({ status: 200, description: 'Tablero compartido exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el propietario puede compartir' })
  @ApiResponse({ status: 404, description: 'Tablero no encontrado' })
  async share(@Param('id') id: string, @Body() shareBoardDto: ShareBoardDto, @Request() req) {
    return this.boardsService.share(id, shareBoardDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un tablero',
    description: 'Elimina un tablero (solo el propietario)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tablero',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiResponse({ status: 200, description: 'Tablero eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el propietario puede eliminar' })
  @ApiResponse({ status: 404, description: 'Tablero no encontrado' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.boardsService.delete(id, req.user.userId);
  }
}
