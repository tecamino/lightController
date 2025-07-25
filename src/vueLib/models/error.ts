import type { Response } from './Response';

export function catchError(data: Error | Response): string {
  if (data instanceof Response) {
    if (data.message) return data.message;
    else console.error(data);
  } else if (data instanceof Error) {
    return data.message;
  } else {
    console.error(data);
  }
  return '';
}
