import type { Subs } from 'src/models/Subscribe';
import { ref, nextTick } from 'vue';

const Subscriptions = ref<Subs>([]);

export const dbmData = ref<TreeNode[]>([]);

export interface TreeNode {
  path: string | undefined;
  key?: string; // optional: useful for QTree's node-key
  value?: string | number | boolean | undefined;
  children?: TreeNode[];
}

export function buildTree(subs: Subs): TreeNode[] {
  type TreeMap = {
    [key: string]: {
      __children: TreeMap;
      uuid?: string;
      value?: string | undefined;
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
        current[part] = { __children: {} };
      }

      // Optionally attach uuid only at the final part
      if (i === pathParts.length - 1 && item.uuid) {
        current[part].uuid = item.uuid;
        current[part].value = item.value !== undefined ? String(item.value) : '';
      }

      current = current[part].__children;
    }
  }

  function convert(map: TreeMap): TreeNode[] {
    return Object.entries(map).map(([path, node]) => ({
      path,
      key: node.uuid ?? path, // `key` is used by QTree
      value: node.value,
      children: convert(node.__children),
    }));
  }

  return [
    {
      path: 'DBM',
      key: 'DBM',
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
  Subscriptions.value.push(...subs);
  void nextTick(() => {
    dbmData.value = buildTree(Subscriptions.value);
  });
}

export function removeSubtreeByParentKey(parentKey: string) {
  // Find the parent node using its uuid
  const parent = Subscriptions.value.find((s) => s.uuid === parentKey);
  if (!parent || !parent.path) return;

  const parentPath = parent.path;

  // Now filter out the children, but NOT the parent itself
  Subscriptions.value = Subscriptions.value.filter((s) => {
    // Keep the parent itself (don't remove it)
    if (s.uuid === parentKey) return true;

    // Remove any child whose path starts with parentPath + '/' (descendants)
    return !s.path?.startsWith(parentPath + ':');
  });

  // Rebuild the tree after removing children, but keeping the parent
  dbmData.value = buildTree(Subscriptions.value);
}

export function getSubscriptionsByPath(path: string) {
  return Subscriptions.value.find((s) => s.path === path);
}

export function getAllSubscriptions() {
  return Subscriptions.value;
}
