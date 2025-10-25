import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: 'Nombre del tablero',
    example: 'Mi Tablero de Trabajo',
    maxLength: 100
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción opcional del tablero',
    example: 'Tablero para planificar el sprint',
    required: false,
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ShareBoardDto {
  @ApiProperty({
    description: 'Array de IDs de usuarios con los que compartir el tablero',
    example: ['65f1b2c3d4e5f6a7b8c9d0e1', '65f1b2c3d4e5f6a7b8c9d0e2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
