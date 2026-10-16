import { HttpErrorResponse } from '@angular/common/http';
import { API_BASE } from '../config/api.config';

export function describeHttpError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  if (error.status === 0) {
    return `Verifica que el backend configurado en "${API_BASE}" esté activo.`;
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (error.error && typeof error.error === 'object') {
    const messages = Object.values(error.error as Record<string, unknown>)
      .filter((value): value is string => typeof value === 'string');
    if (messages.length) {
      return messages.join(' ');
    }
  }

  return `El backend respondió con el estado ${error.status}. Inténtalo de nuevo.`;
}