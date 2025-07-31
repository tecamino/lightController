import type { Topic } from './Topic';

export interface Bus {
  name: string;
  address?: number[];
  topic?: Topic;
}
