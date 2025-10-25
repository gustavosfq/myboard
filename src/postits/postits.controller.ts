import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PostitsService } from './postits.service';
import { CreatePostitDto, UpdatePostitDto } from './dto/postit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('postits')
@ApiBearerAuth('JWT-auth')
@Controller('postits')
@UseGuards(JwtAuthGuard)
export class PostitsController {
  constructor(private readonly postitsService: PostitsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo post-it',
    description: 'Crea un nuevo post-it en un tablero específico'
  })
  @ApiBody({ type: CreatePostitDto })
  @ApiResponse({
    status: 201,
    description: 'Post-it creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        boardId: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        text: { type: 'string', example: 'Mi nota importante' },
        x: { type: 'number', example: 100 },
        y: { type: 'number', example: 150 },
        width: { type: 'number', example: 200 },
        height: { type: 'number', example: 200 },
        color: { type: 'string', example: '#FFE66D' },
        zIndex: { type: 'number', example: 1 },
        createdBy: { type: 'string', example: '65f1b2c3d4e5f6a7b8c9d0e1' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al tablero' })
  async create(@Body() createPostitDto: CreatePostitDto, @Request() req) {
    return this.postitsService.create(createPostitDto, req.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar post-its de un tablero',
    description: 'Obtiene todos los post-its de un tablero específico'
  })
  @ApiQuery({
    name: 'boardId',
    description: 'ID del tablero',
    example: '65f1b2c3d4e5f6a7b8c9d0e1',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de post-its del tablero',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          boardId: { type: 'string' },
          text: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          color: { type: 'string' },
          zIndex: { type: 'number' },
          createdBy: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Sin acceso al tablero' })
  async findByBoard(@Query('boardId') boardId: string, @Request() req) {
    return this.postitsService.findByBoard(boardId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un post-it específico',
    description: 'Obtiene los detalles de un post-it por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post-it',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiResponse({ status: 200, description: 'Detalles del post-it' })
  @ApiResponse({ status: 404, description: 'Post-it no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al post-it' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.postitsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un post-it',
    description: 'Actualiza las propiedades de un post-it existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post-it',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiBody({ type: UpdatePostitDto })
  @ApiResponse({ status: 200, description: 'Post-it actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Post-it no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al post-it' })
  async update(
    @Param('id') id: string,
    @Body() updatePostitDto: UpdatePostitDto,
    @Request() req,
  ) {
    return this.postitsService.update(id, updatePostitDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un post-it',
    description: 'Elimina un post-it del tablero'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post-it',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @ApiResponse({ status: 200, description: 'Post-it eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Post-it no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al post-it' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.postitsService.delete(id, req.user.userId);
  }
}
