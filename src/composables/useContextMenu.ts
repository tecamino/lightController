import { ref } from 'vue';

export const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  anchor: 'top left',
  self: 'top left',
  node: null,
});

export function openContextMenu(event: MouseEvent, node: undefined) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    anchor: 'top left',
    self: 'top left',
    node: node ?? null,
  };
}
