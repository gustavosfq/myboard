import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log request
    const userId = req.user?.userId || 'anonymous';
    const userEmail = req.user?.email || 'unknown';
    
    this.logger.log(`🔍 ${method} ${originalUrl} - IP: ${ip} - User: ${userEmail} (${userId}) - UserAgent: ${userAgent}`);

    // Log response when it finishes
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      
      const logLevel = statusCode >= 400 ? 'error' : 'log';
      const statusEmoji = this.getStatusEmoji(statusCode);
      
      this.logger[logLevel](
        `${statusEmoji} ${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms - User: ${userEmail} (${userId})`
      );

      // Log additional details for errors
      if (statusCode >= 400) {
        this.logger.error(`❌ Error details - IP: ${ip} - UserAgent: ${userAgent}`);
      }
    });

    next();
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '↩️';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '📝';
  }
}