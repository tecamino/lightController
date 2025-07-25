import type { Gets } from './Get';
import type { Sets } from './Set';
import type { RawSubs } from './Subscribe';
import type { Pubs } from './Publish';

export type Response = {
  get?: Gets;
  set?: Sets;
  subscribe?: RawSubs;
  unsubscribe?: RawSubs;
  publish?: Pubs;
  error?: boolean;
  message?: string;
};
