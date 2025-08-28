import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { services_controllers } from '../constants';

const { somethingWentWrong } = services_controllers;

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.extractErrorDetails(exception);

    this.logError(request, status, exception);

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
    };

    response.status(status).json(errorResponse);
  }

  private extractErrorDetails(exception: unknown): {
    status: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractHttpExceptionMessage(exception.getResponse()),
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: somethingWentWrong,
    };
  }

  private extractHttpExceptionMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const messageValue = (response as Record<string, unknown>).message;
      return typeof messageValue === 'string'
        ? messageValue
        : somethingWentWrong;
    }

    return somethingWentWrong;
  }

  private logError(request: Request, status: number, exception: unknown): void {
    const errorMessage = `[${request.method}] ${request.url} - Status: ${status}`;
    const stack =
      exception instanceof Error ? exception.stack : String(exception);

    this.logger.error(errorMessage, stack);
  }
}
