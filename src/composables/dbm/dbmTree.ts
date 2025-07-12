import { reactive, computed, type Ref } from 'vue';
import type { QVueGlobals } from 'quasar';
import type { Subs } from 'src/models/Subscribe';
import { NotifyResponse } from '../notify';
import { setValues } from 'src/services/websocket';
import { findSubscriptionByPath } from 'src/models/Subscriptions';

export const dbmData = reactive<TreeNode[]>([]);
//export const reactiveValues = new Map<string, Ref<string | number | boolean | null>>();

export type TreeNode = {
  path: string | undefined;
  key?: string; // optional: useful for QTree's node-key
  lazy: boolean;
  children?: TreeNode[];
};

type TreeMap = {
  [key: string]: {
    __children: TreeMap;
    uuid?: string;
    value?: string | number | boolean | null;
    lazy: boolean;
  };
};

const root: TreeMap = {};

export function buildTree(subs: Subs): TreeNode[] {
  for (const { path, uuid, value, hasChild } of subs) {
    if (!path) continue;

    const parts = path.split(':');
    let current = root;

    parts.forEach((part, idx) => {
      if (!part) return;

      if (!current[part]) {
        current[part] = { __children: {}, lazy: true };
      }

      if (idx === parts.length - 1 && uuid) {
        if (current[part].uuid === uuid) return;

        current[part].uuid = uuid;
        current[part].value = value?.value ?? null;
        current[part].lazy = hasChild ?? false;
      }

      current = current[part].__children;
    });
  }

  function mapToTree(map: TreeMap): TreeNode[] {
    return Object.entries(map).map(([key, node]) => ({
      path: key,
      key: node.uuid ?? key,
      value: node.value,
      lazy: node.lazy,
      children: mapToTree(node.__children),
    }));
  }

  const newTree = [
    {
      path: 'DBM',
      key: '00000000-0000-0000-0000-000000000000',
      lazy: true,
      children: mapToTree(root),
    },
  ];
  return dbmData.splice(0, dbmData.length, ...newTree);
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
  removeChildrenAndMarkLazy(dbmData, parentKey);
}

export function updateValue(
  path1: string,
  $q: QVueGlobals,
  toggle?: Ref<boolean>,
  path2?: string,
  path3?: string,
  value3?: number,
) {
  return computed({
    get() {
      const sub = findSubscriptionByPath(toggle?.value && path2 ? path2 : path1);
      return sub?.value ? Number(sub.value ?? 0) : 0;
    },
    set(val) {
      const baseValue = val;
      const setPaths = [];
      if (toggle?.value && path2) {
        setPaths.push({ path: path2, value: baseValue });
      } else {
        setPaths.push({ path: path1, value: baseValue });
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
