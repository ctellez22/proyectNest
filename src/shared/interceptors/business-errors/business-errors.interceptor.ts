import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessError } from '../../errors/business-errors';

@Injectable()
export class BusinessErrorsInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
     return next.handle()
       .pipe(catchError(error => {
         if (error?.type === BusinessError.NOT_FOUND)
             return throwError(() => new HttpException(error.message, HttpStatus.NOT_FOUND));
         else if (error?.type === BusinessError.PRECONDITION_FAILED)
             return throwError(() => new HttpException(error.message, HttpStatus.PRECONDITION_FAILED));
         else if (error?.type === BusinessError.BAD_REQUEST)
             return throwError(() => new HttpException(error.message, HttpStatus.BAD_REQUEST));
         else
             return throwError(() => error);
       }));
   }
}