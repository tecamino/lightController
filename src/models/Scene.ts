import type { Value } from '../vueLib/models/Value';

export interface Scene {
  name: string;
  description?: string;
  movingHead: boolean;
  lightBar: boolean;
  values?: Value[];
}
