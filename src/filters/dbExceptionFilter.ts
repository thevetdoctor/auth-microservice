import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BaseError as SequelizeBaseError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import { response as resp } from 'oba-http-response';

@Catch(SequelizeBaseError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: SequelizeBaseError | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Database error';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    console.log(exception);
    if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      const detail =
        (exception.parent as any)?.detail || 'Unique constraint error';
      message = `Duplicate entry: ${detail}`;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Unique constraint error';
    } else if (exception.parent) {
      const parentError = exception.parent as any;
      if (parentError.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = parentError.detail || 'Conflict error';
      } else if (parentError.code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = parentError.detail || 'Foreign key constraint error';
      }
    }
    resp(response, HttpStatus.BAD_REQUEST, null, message);
  }
}
