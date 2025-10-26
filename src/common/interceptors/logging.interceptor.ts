import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const user = request.user;
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log request details
    const requestInfo = {
      timestamp,
      method,
      url,
      userId: user?.userId || 'anonymous',
      userEmail: user?.email || 'unknown',
      ...(Object.keys(body || {}).length > 0 && { body: this.sanitizeData(body) }),
      ...(Object.keys(query || {}).length > 0 && { query }),
      ...(Object.keys(params || {}).length > 0 && { params }),
    };

    this.logger.log(`📥 Request: ${JSON.stringify(requestInfo)}`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        const responseInfo = {
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode: response.statusCode,
          responseTime: `${responseTime}ms`,
          userId: user?.userId || 'anonymous',
          userEmail: user?.email || 'unknown',
          dataSize: data ? JSON.stringify(data).length : 0,
        };

        this.logger.log(`📤 Response: ${JSON.stringify(responseInfo)}`);
      }),
      catchError((error) => {
        const endTime = Date.now();
        const responseTime = `${endTime - startTime}ms`;
        
        // Almacenar información del error en el request para el middleware
        (request as any).errorInfo = {
          name: error.name || 'Error',
          message: error.message || 'Unknown error',
          stack: error.stack || 'No stack trace',
          status: error.status || error.statusCode || 500,
          response: error.response || null,
        };

        const errorLog = {
          timestamp: new Date().toISOString(),
          method: request.method,
          url: request.url,
          statusCode: error.status || error.statusCode || 500,
          responseTime,
          userId: user?.userId || 'anonymous',
          userEmail: user?.email || 'unknown',
          error: error.message || 'Unknown error',
          errorName: error.name || 'Error',
          errorDetails: {
            status: error.status || error.statusCode || 500,
            response: error.response || null,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
          },
          requestBody: this.sanitizeData(request.body),
          queryParams: request.query,
          routeParams: request.params,
        };

        this.logger.error(`💥 Error: ${JSON.stringify(errorLog)}`);
        
        // Log adicional con más detalles en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          this.logger.error(`💥 Full Error Stack: ${error.stack}`);
          this.logger.error(`💥 Error Object: ${JSON.stringify(error, null, 2)}`);
        }

        return throwError(() => error);
      }),
    );
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
}