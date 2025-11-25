import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    
    let message = 'Error interno del servidor';
    let error = 'INTERNAL_ERROR';

    if (exception instanceof WsException) {
      message = exception.message;
      error = 'WS_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = 'ERROR';
      this.logger.error(
        `WebSocket error: ${exception.message}`,
        exception.stack
      );
    }

    const errorResponse = {
      event: 'error',
      data: {
        error,
        message,
        timestamp: new Date().toISOString(),
      },
    };

    client.emit('error', errorResponse.data);
    
    this.logger.warn(`WebSocket error emitted: ${message}`);
  }
}
