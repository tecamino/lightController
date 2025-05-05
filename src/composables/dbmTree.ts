import type { Subs } from 'src/models/Subscribe';
import { ref } from 'vue';

export const dbmData = ref<TreeNode[]>(buildTree([]));

export const subs = ref<Subs>([]);

export interface TreeNode {
  path: string;
  key?: string; // optional: useful for QTree's node-key
  value?: string | undefined;
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
