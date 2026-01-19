import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

/**
 * PrismaExceptionFilter - Xử lý các lỗi từ Prisma ORM
 *
 * Prisma Error Codes:
 * - P2002: Unique constraint violation (duplicate)
 * - P2025: Record not found
 * - P2003: Foreign key constraint violation
 * - P2001: Record required but not found
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle PrismaClientValidationError
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        details: exception.message,
      });
    }

    // Handle PrismaClientKnownRequestError
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          // Unique constraint violation
          const target = exception.meta?.target as string[] | undefined;
          const field = target ? target.join(', ') : 'field';
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: `${field} already exists`,
            error: 'Conflict',
            code: exception.code,
          });
        }

        case 'P2025': {
          // Record not found
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Record not found',
            error: 'Not Found',
            code: exception.code,
          });
        }

        case 'P2003': {
          // Foreign key constraint violation
          const field = exception.meta?.field_name as string | undefined;
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: field
              ? `Invalid reference: ${field} does not exist`
              : 'Foreign key constraint failed',
            error: 'Bad Request',
            code: exception.code,
          });
        }

        case 'P2001': {
          // Required relation not found
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Required record not found',
            error: 'Not Found',
            code: exception.code,
          });
        }

        default: {
          // Generic Prisma error
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Database error occurred',
            error: 'Internal Server Error',
            code: exception.code,
          });
        }
      }
    }
  }
}
