import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostitDto {
  @ApiProperty({
    description: 'ID del tablero donde crear el post-it',
    example: '65f1b2c3d4e5f6a7b8c9d0e1'
  })
  @IsMongoId()
  boardId: string;

  @ApiProperty({
    description: 'Texto contenido en el post-it',
    example: 'Revisar diseño de la UI',
    maxLength: 1000
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Posición X en el canvas',
    example: 100,
    minimum: 0
  })
  @IsNumber()
  x: number;

  @ApiProperty({
    description: 'Posición Y en el canvas',
    example: 150,
    minimum: 0
  })
  @IsNumber()
  y: number;

  @ApiProperty({
    description: 'Ancho del post-it en píxeles',
    example: 200,
    required: false,
    default: 200,
    minimum: 100
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: 'Alto del post-it en píxeles',
    example: 200,
    required: false,
    default: 200,
    minimum: 100
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Color de fondo del post-it en formato hexadecimal',
    example: '#FFE66D',
    required: false,
    default: '#FFE66D'
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Índice Z para el orden de apilamiento',
    example: 1,
    required: false,
    default: 0,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  zIndex?: number;
}

export class UpdatePostitDto {
  @ApiProperty({
    description: 'Nuevo texto del post-it',
    example: 'Texto actualizado',
    required: false,
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Nueva posición X',
    example: 120,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  x?: number;

  @ApiProperty({
    description: 'Nueva posición Y',
    example: 180,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  y?: number;

  @ApiProperty({
    description: 'Nuevo ancho del post-it',
    example: 220,
    required: false,
    minimum: 100
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: 'Nuevo alto del post-it',
    example: 180,
    required: false,
    minimum: 100
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Nuevo color del post-it',
    example: '#FF6B6B',
    required: false
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Nuevo índice Z',
    example: 2,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  zIndex?: number;
}
