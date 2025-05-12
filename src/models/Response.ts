import type { Gets } from './Get';
import type { Sets } from './Set';
import type { Subs } from './Subscribe';
import type { Pubs } from './Publish';

export type Response = {
  get?: Gets;
  set?: Sets;
  subscribe?: Subs;
  unsubscribe?: Subs;
  publish?: Pubs;
};
