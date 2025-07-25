import type { Ref } from 'vue';
import { reactive, ref } from 'vue';
import { convertToSubscribe } from '../models/Subscribe';
import type { Subscribe, RawSubs, RawSubscribe } from '../models/Subscribe';
import type { Set } from './Set';

const EMPTYUUID = '00000000-0000-0000-0000-000000000000';
export const Subscriptions = reactive<Record<string, Subscribe>>({});

export type TableSubscription = {
  path: string;
  value: Ref<string | number | boolean | null | undefined>;
};

export function addRawSubscription(sub: RawSubscribe | Set | undefined) {
  if (sub === undefined) return;
  addSubscription(convertToSubscribe(sub as RawSubscribe));
}

export function addRawSubscriptions(subs: RawSubs) {
  subs.forEach((sub) => addSubscription(convertToSubscribe(sub)));
}

function addSubscription(sub: Subscribe) {
  if (EMPTYUUID === sub.uuid) {
    sub.path = 'DBM';
  }
  if (!sub.uuid) return;
  Subscriptions[sub.uuid] = sub;
}

export function updateSubscription(sub: Subscribe) {
  if (!sub.uuid) return;
  Subscriptions[sub.uuid] = sub;
}

export function updateSubscriptionValue(
  uuid: string,
  value: string | number | boolean | null | undefined,
) {
  if (!uuid) return;
  if (!Subscriptions[uuid]) return;
  Subscriptions[uuid].value = ref(value);
}

export function removeRawSubscription(sub: RawSubscribe | string) {
  removeSubscription(typeof sub === 'string' ? sub : sub.uuid);
}

export function removeRawSubscriptions(subs: RawSubs) {
  subs.forEach((sub) => {
    removeSubscription(sub.uuid);
  });
}

export function removeAllSubscriptions() {
  Object.keys(Subscriptions).forEach((key) => delete Subscriptions[key]);
}

export function removeSubscription(uuid: string | undefined) {
  if (uuid === undefined) return;
  if (!Subscriptions || Subscriptions[uuid] === undefined) return;
  delete Subscriptions[uuid];
}

export function findSubscriptionByPath(path: string): Subscribe | undefined {
  return Object.values(Subscriptions).find((sub) => sub.path === path);
}

export function findSubscriptionByUuid(uuid: string): Subscribe | undefined {
  if (!Subscriptions[uuid]) return;
  return Subscriptions[uuid];
}
