import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../models/api-error';

/** Forma del error que responde el backend (ApiError.java). */
interface ProblemaHttp {
  mensaje?: string;
  detalles?: string[];
}

/** Convierte cualquier error HTTP en un ApiError con un mensaje legible. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) =>
      throwError(() => new ApiError(mensajeDe(error), error.status)),
    ),
  );

function mensajeDe(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No hay conexión con el servidor. ¿Está encendido el backend?';
  }
  const problema = error.error as ProblemaHttp | null;
  const detalles = problema?.detalles?.length ? ` (${problema.detalles.join('. ')})` : '';
  return problema?.mensaje ? `${problema.mensaje}${detalles}` : 'Ocurrió un error inesperado';
}
