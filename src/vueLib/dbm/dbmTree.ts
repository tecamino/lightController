import { ref, computed, type Ref } from 'vue';
import { convertToSubscribes, type Subs } from '../models/Subscribe';
import { setValues, subscribe, unsubscribe } from '../services/websocket';
import {
  findSubscriptionByPath,
  addRawSubscriptions,
  removeAllSubscriptions,
} from '../models/Subscriptions';
import { UpdateTable } from '..//dbm/updateTable';
import type { Response } from '..//models/Response';
import type { RawSubs } from '..//models/Subscribe';
import { getRequest } from '../models/Request';
import type { Pubs } from '../models/Publish';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

export const dbmData = ref<TreeNode[]>([]);
export const expanded = ref<string[]>([]);

let lastExpanded: string[] = [];

export type TreeNode = {
  path?: string;
  key?: string;
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

export function buildTreeWithRawSubs(subs: RawSubs): TreeNode[] {
  return buildTree(convertToSubscribes(subs));
}

export function buildTree(subs: Subs | null): TreeNode[] {
  if (subs) {
    for (const { path, uuid, value, hasChild } of subs) {
      if (!path) continue;
      const parts = path.split(':');
      let current = root;

      parts.forEach((part, idx) => {
        if (!part) return;
        if (!current[part]) current[part] = { __children: {}, lazy: true };

        if (idx === parts.length - 1 && uuid) {
          current[part].uuid = uuid;
          current[part].value = value?.value ?? null;
          current[part].lazy = !!hasChild;
        }

        current = current[part].__children;
      });
    }
  }

  const toTreeNodes = (map: TreeMap): TreeNode[] =>
    Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, node]) => ({
        path: key,
        key: node.uuid ?? key,
        value: node.value,
        lazy: node.lazy,
        children: toTreeNodes(node.__children),
      }));

  const newTree = [
    {
      path: 'DBM',
      key: ZERO_UUID,
      lazy: true,
      children: toTreeNodes(root),
    },
  ];

  dbmData.value.splice(0, dbmData.value.length, ...newTree);
  return newTree;
}

export function removeNodes(pubs: Pubs) {
  pubs.forEach((pub) => {
    removeNode(pub.uuid);
  });
}

export function removeNode(uuid: string) {
  removeFromTreeMap(root, uuid);
  removeFromTree(dbmData.value, uuid);
  collapseNode(uuid);
}

function removeFromTreeMap(tree: TreeMap, uuid: string): boolean {
  for (const [key, node] of Object.entries(tree)) {
    if (node.uuid === uuid) {
      delete tree[key];
      return true;
    }
    if (removeFromTreeMap(node.__children, uuid)) return true;
  }
  return false;
}

function removeFromTree(nodes: TreeNode[], uuid: string): boolean {
  const index = nodes.findIndex((n) => n.key === uuid);
  if (index !== -1) {
    nodes.splice(index, 1);
    return true;
  }

  for (const node of nodes) {
    if (node.children && removeFromTree(node.children, uuid)) {
      if (node.children.length === 0) {
        delete node.children;
        node.lazy = true;
      }
      return true;
    }
  }

  return false;
}

export function removeSubtreeByParentKey(parentKey: string) {
  const recurse = (nodes: TreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.key === parentKey) {
        delete node.children;
        node.lazy = true;
        return true;
      }
      if (node.children && recurse(node.children)) return true;
    }
    return false;
  };
  recurse(dbmData.value);
}

function collapseNode(uuid: string) {
  const idx = expanded.value.indexOf(uuid);
  if (idx !== -1) {
    expanded.value.splice(idx, 1);
    const lastIdx = lastExpanded.indexOf(uuid);
    if (lastIdx !== -1) lastExpanded.splice(lastIdx, 1);
    onExpandedChange([...expanded.value]).catch(console.error);
  }
}

export function updateValue(
  NotifyResponse: (
    response: Response | string | undefined,
    type?: 'warning' | 'error',
    timeout?: 5000,
  ) => void,
  path1: string,
  toggle?: Ref<boolean>,
  path2?: string,
  path3?: string,
  value3?: number,
) {
  return computed({
    get() {
      const path = toggle?.value && path2 ? path2 : path1;
      return Number(findSubscriptionByPath(path)?.value ?? 0);
    },
    set(val) {
      const baseValue = val;
      const updates = [
        { path: toggle?.value && path2 ? path2 : path1, value: baseValue },
        ...(path3 ? [{ path: path3, value: value3 ?? baseValue }] : []),
      ];

      setValues(updates)
        .then((response) => NotifyResponse(response))
        .catch((err) =>
          NotifyResponse(`Failed to update [${[path1, path2, path3].join(' ')}]: ${err}`, 'error'),
        );
    },
  });
}

export async function onExpandedChange(newExpanded: readonly string[]) {
  const collapsed = lastExpanded.filter((k) => !newExpanded.includes(k));
  const newlyExpanded = newExpanded.filter((k) => !lastExpanded.includes(k));

  try {
    await unsubscribe([{ path: '.*', depth: 0 }]).then(removeAllSubscriptions);

    for (const key of collapsed) {
      removeSubtreeByParentKey(key);
      fetchAndUpdateNode(key);
    }

    for (const key of newlyExpanded) {
      fetchAndUpdateNode(key);
    }

    lastExpanded = [...newExpanded];
  } catch (err) {
    console.error('error in expand function', err);
  }
}

function fetchAndUpdateNode(key: string) {
  getRequest(key, '', 2)
    .then((resp) => {
      if (resp) {
        buildTreeWithRawSubs(resp);
        subscribe([{ uuid: key, path: '', depth: 2 }]).catch((err) => console.error(err));
        addRawSubscriptions(resp);
      }
      UpdateTable(key);
    })
    .catch((err) => console.error(err));
}

export function findParentKey(
  childKey: string,
  parentKey: string | null = null,
  nodes?: TreeNode[],
): string | null {
  if (!nodes) nodes = dbmData.value;
  for (const node of nodes) {
    if (node.key === childKey) return parentKey;
    if (node.children) {
      const found = findParentKey(childKey, node.key ?? null, node.children);
      if (found) return found;
    }
  }
  return null;
}

function getNodeUuidByPath(path: string, nodes?: TreeNode[]): string {
  if (!nodes) nodes = dbmData.value;
  for (const node of nodes) {
    if (node.path === path) return node.key ?? '';
    if (node.children) {
      const found = getNodeUuidByPath(path, node.children);
      if (found !== '') return found;
    }
  }
  return '';
}

export function pathIsExpanded(path: string): boolean {
  if (!path.includes(':')) {
    return true;
  }
  let p = path.replace(/:.+$/, '');
  if (expanded.value.includes(getNodeUuidByPath(p))) {
    return true;
  }
  p = path.replace(/:.+$/, '');
  return expanded.value.includes(getNodeUuidByPath(p));
}
