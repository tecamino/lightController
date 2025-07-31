import type { Bus } from './Bus';
export interface Driver {
  type: string;
  buses?: Bus[];
}

export const driverDefault = <Driver>{
  type: '',
};
