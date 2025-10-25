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
      ...(Object.keys(body || {}).length > 0 && { body: this.sanitizeBody(body) }),
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
        const responseTime = Date.now() - startTime;
        const errorInfo = {
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode: error.status || 500,
          responseTime: `${responseTime}ms`,
          userId: user?.userId || 'anonymous',
          userEmail: user?.email || 'unknown',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };

        this.logger.error(`💥 Error: ${JSON.stringify(errorInfo)}`);
        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}