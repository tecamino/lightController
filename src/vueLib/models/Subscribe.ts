import { ref } from 'vue';
import type { Ref } from 'vue';
import type { Driver } from './Drivers';
import type { Set } from './Set';

export type Subscribe = {
  uuid?: string;
  path?: string;
  depth?: number;
  type?: string;
  drivers?: Record<string, Driver>;
  value?: Ref<string | number | boolean | null | undefined>;
  hasChild?: boolean;
};

export type Subs = Subscribe[];

export type RawSubscribe = {
  uuid?: string;
  path?: string;
  depth?: number;
  value?: string | number | boolean | null;
  drivers?: Record<string, Driver>;
  rights?: string;
  hasChild?: boolean;
};

export type RawSubs = RawSubscribe[];

export function convertToSubscribe(raw: RawSubscribe | Set): Subscribe {
  return {
    ...raw,
    uuid: raw.uuid ?? '',
    value: ref(raw.value ?? null),
  };
}

export function convertToSubscribes(rawList: RawSubs): Subs {
  const subs = rawList.map(convertToSubscribe).sort((a, b) => {
    const aPath = a.path ?? '';
    const bPath = b.path ?? '';
    return aPath.localeCompare(bPath);
  });
  return subs as Subs;
}

export function convertToRaw(sub: Subscribe): RawSubscribe {
  return {
    ...(sub.uuid !== undefined ? { uuid: sub.uuid } : {}),
    ...(sub.path !== undefined ? { path: sub.path } : {}),
    ...(sub.depth !== undefined ? { depth: sub.depth } : {}),
    ...(sub.value?.value !== undefined ? { value: sub.value.value } : {}),
    ...(sub.hasChild !== undefined ? { hasChild: sub.hasChild } : {}),
  };
}
