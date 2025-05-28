import { ref } from 'vue';
import type { TreeNode } from './dbmTree';

export const contextMenuRef = ref();

export const contextMenuState = ref<TreeNode | undefined>();

export function openContextMenu(event: MouseEvent, node: undefined) {
  event.preventDefault();
  contextMenuState.value = node;
  contextMenuRef.value?.show(event);
}
