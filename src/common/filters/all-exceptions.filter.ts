import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const user = (request as any).user;
    const timestamp = new Date().toISOString();

    // Determinar el mensaje de error
    let errorMessage = 'Internal server error';
    let errorDetails = {};
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      errorMessage = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
      errorDetails = typeof exceptionResponse === 'object' ? exceptionResponse : {};
    } else {
      errorMessage = exception.message || 'Unknown error';
      errorDetails = {
        name: exception.name,
        stack: exception.stack,
      };
    }

    // Log completo del error
    const errorLog = {
      timestamp,
      method: request.method,
      url: request.url,
      statusCode: status,
      user: {
        id: user?.userId || 'anonymous',
        email: user?.email || 'unknown',
      },
      error: {
        name: exception.name || 'Error',
        message: errorMessage,
        details: errorDetails,
        stack: process.env.NODE_ENV !== 'production' ? exception.stack : undefined,
      },
      request: {
        headers: this.sanitizeHeaders(request.headers),
        query: request.query,
        params: request.params,
        body: this.sanitizeData(request.body),
        ip: request.ip || request.connection.remoteAddress,
        userAgent: request.get('User-Agent'),
      },
    };

    // Log del error con diferentes niveles según el tipo
    if (status >= 500) {
      this.logger.error(`🚨 Server Error (${status}): ${JSON.stringify(errorLog, null, 2)}`);
    } else if (status >= 400) {
      this.logger.warn(`⚠️ Client Error (${status}): ${JSON.stringify(errorLog)}`);
    } else {
      this.logger.log(`ℹ️ Error (${status}): ${JSON.stringify(errorLog)}`);
    }

    // En desarrollo, mostrar stack trace completo
    if (process.env.NODE_ENV !== 'production' && exception.stack) {
      this.logger.error(`🔍 Full Stack Trace:\n${exception.stack}`);
    }

    // Respuesta al cliente
    const errorResponse = {
      statusCode: status,
      timestamp,
      path: request.url,
      method: request.method,
      message: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { details: errorDetails }),
    };

    response.status(status).json(errorResponse);
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}