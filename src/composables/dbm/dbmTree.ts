import type { Subs } from 'src/models/Subscribe';
import { ref, nextTick, computed } from 'vue';
import { setValues } from 'src/services/websocket';
import { NotifyResponse } from 'src/composables/notify';
import type { QVueGlobals } from 'quasar';

const Subscriptions = ref<Subs>([]);

export const dbmData = ref<TreeNode[]>([]);

export interface TreeNode {
  path: string | undefined;
  key?: string; // optional: useful for QTree's node-key
  value?: string | number | boolean | undefined;
  lazy: boolean;
  children?: TreeNode[];
}

export function buildTree(subs: Subs): TreeNode[] {
  type TreeMap = {
    [key: string]: {
      __children: TreeMap;
      uuid?: string;
      value?: string | undefined;
      lazy: boolean;
    };
  };

  const root: TreeMap = {};

  Subscriptions.value = subs;

  for (const item of subs) {
    const pathParts = item.path?.split(':') ?? [];
    let current = root;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

      if (!part) continue;

      if (!current[part]) {
        current[part] = { __children: {}, lazy: true };
      }

      // Optionally attach uuid only at the final part
      if (i === pathParts.length - 1 && item.uuid) {
        current[part].uuid = item.uuid;
        current[part].value = item.value !== undefined ? String(item.value) : '';
        current[part].lazy = item.hasChild ?? false;
      }
      current = current[part].__children;
    }
  }

  function convert(map: TreeMap): TreeNode[] {
    return Object.entries(map).map(([path, node]) => ({
      path,
      key: node.uuid ?? path, // `key` is used by QTree
      value: node.value,
      lazy: node.lazy,
      children: convert(node.__children),
    }));
  }

  return [
    {
      path: 'DBM',
      key: '00000000-0000-0000-0000-000000000000',
      lazy: true,
      children: convert(root),
    },
  ];
}

export function getTreeElementByPath(path: string) {
  return dbmData.value.find((s) => s.path === path);
}

export function getSubscriptionsByUuid(uid: string | undefined) {
  return Subscriptions.value.find((s) => s.uuid === uid);
}

export function addChildrentoTree(subs: Subs) {
  const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
  const existingIds = new Set(Subscriptions.value.map((sub) => sub.uuid));
  const newSubs = subs
    .filter((sub) => sub.uuid !== ZERO_UUID) // Skip UUIDs with all zeroes
    .filter((sub) => !existingIds.has(sub.uuid));

  Subscriptions.value.push(...newSubs);

  void nextTick(() => {
    dbmData.value = buildTree(Subscriptions.value);
  });
}

export function removeSubtreeByParentKey(parentKey: string) {
  function removeChildrenAndMarkLazy(nodes: TreeNode[], targetKey: string): boolean {
    for (const node of nodes) {
      if (node.key === targetKey) {
        delete node.children;
        node.lazy = true;
        return true;
      }
      if (node.children) {
        const found = removeChildrenAndMarkLazy(node.children, targetKey);
        if (found) return true;
      }
    }
    return false;
  }

  removeChildrenAndMarkLazy(dbmData.value, parentKey);
}

export function getSubscriptionsByPath(path: string | undefined) {
  return Subscriptions.value.find((s) => s.path === path);
}

export function getAllSubscriptions() {
  return Subscriptions.value;
}

export function updateValue(
  path1: string,
  $q: QVueGlobals,
  path2?: string,
  path3?: string,
  value3?: number,
) {
  return computed({
    get() {
      const sub = getSubscriptionsByPath(path1);
      const value = sub ? Number(sub.value ?? 0) : 0;
      return Math.round((100 / 255) * value);
    },
    set(val) {
      const baseValue = Math.round((255 / 100) * val);
      const setPaths = [{ path: path1, value: baseValue }];
      if (path2) {
        setPaths.push({ path: path2, value: baseValue });
      }
      if (path3) {
        setPaths.push({ path: path3, value: value3 ? value3 : baseValue });
      }
      setValues(setPaths)
        .then((response) => NotifyResponse($q, response))
        .catch((err) => {
          NotifyResponse(
            $q,
            `Failed to update [${path1 + ' ' + path2 + ' ' + path3}]: ${err}`,
            'error',
          );
        });
    },
  });
}
