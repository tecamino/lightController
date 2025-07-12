import type { Ref } from 'vue';
import { reactive, ref } from 'vue';
import { convertToSubscribe } from 'src/models/Subscribe';
import type { Subs, Subscribe, RawSubs } from 'src/models/Subscribe';

const EMPTYUUID = '00000000-0000-0000-0000-000000000000';
export const Subscriptions = reactive<Record<string, Subscribe>>({});

export type TableSubscription = {
  path: string;
  value: Ref<string | number | boolean | null | undefined>;
};

export function getRows(): Subs {
  return Object.values(Subscriptions).map((sub) => {
    sub.path = sub.path?.split(':').pop() ?? '';
    if (!sub.type) sub.type = 'None';
    else sub.type = sub.type.toLowerCase();
    return sub;
  });
}

export function addSubscriptions(subs: RawSubs) {
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

export function removeSubscriptions(subs: RawSubs) {
  subs.forEach((sub) => {
    removeSubscription(sub.path);
  });
}

export function removeAllSubscriptions() {
  Object.keys(Subscriptions).forEach((key) => delete Subscriptions[key]);
}

function removeSubscription(uuid: string | undefined) {
  if (uuid === undefined) return;
  if (!Subscriptions || Subscriptions[uuid] === undefined) return;
  delete Subscriptions[uuid];
}

export function findSubscriptionByPath(path: string): Subscribe | undefined {
  return Object.values(Subscriptions).find((sub) => sub.path === path);
}
