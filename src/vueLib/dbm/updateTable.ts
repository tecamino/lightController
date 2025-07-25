import type { Subs } from '../models/Subscribe';
import { Subscriptions } from '../models/Subscriptions';
import { ref } from 'vue';

export const TableSubs = ref<Subs>();

export function UpdateTable(targetUuid?: string) {
  TableSubs.value = Object.values(Subscriptions)
    .map((sub) => {
      sub.type = sub.type ?? 'none';
      return sub;
    })
    .sort((a, b) => {
      if (targetUuid) {
        if (a.uuid === targetUuid) return -1; // move `a` to front
        if (b.uuid === targetUuid) return 1; // move `b` to front
      }
      const aPath = a.path ?? '';
      const bPath = b.path ?? '';
      return aPath.localeCompare(bPath);
    });
}
