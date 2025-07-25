import type { UUID } from 'crypto';

export interface Value {
  uuid?: UUID;
  path: string;
  value: number | string | undefined;
}
