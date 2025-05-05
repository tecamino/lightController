import type { Gets } from './Get';
import type { Sets } from './Set';
import type { Subs } from './Subscribe';

export type Request = {
  get?: Gets;
  set?: Sets;
  subscribe?: Subs;
  unsubscribe?: Subs;
};
