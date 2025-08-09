import type { Value } from '../vueLib/models/Value';

export interface Scene {
  name: string;
  description?: string;
  stageLights: boolean;
  lightBar: boolean;
  floodPanels: boolean;
  movingHead: boolean;
  values?: Value[];
}
